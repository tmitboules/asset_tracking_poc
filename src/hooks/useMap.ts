import React from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { DIRECTIONS_OPTIONS, MAP_STARTING_CENTER } from "../utils/constants";
import { generateTrailingPolyline } from "../utils";

const LIBRARIES: Libraries | undefined = ["places"];

type IMapReducerActions =
  | {
      type: "initialize_directions";
      directionsResult: google.maps.DirectionsResult;
    }
  | { type: "update_directions" }
  | { type: "init_map"; map: google.maps.Map }
  | { type: "clear_map" }
  | {
      type: "update_truck_location_along_route";
      coordinates: google.maps.LatLng;
    }
  | {
      type: "update_truck_location_off_route";
      coordinates: google.maps.LatLng;
      directionsResult: google.maps.DirectionsResult;
    };

type IMapReducerState = {
  map: google.maps.Map | null;
  directionsRenderer: google.maps.DirectionsRenderer | null;
  count: number;
  directions?: google.maps.DirectionsResult;
  destination?: google.maps.LatLngLiteral;
  truckPosition?: google.maps.LatLngLiteral;
  origin?: google.maps.LatLngLiteral | google.maps.LatLng;
  trailingPolyline?: google.maps.LatLng[];
};

const reducer = (state: IMapReducerState, action: IMapReducerActions) => {
  switch (action.type) {
    case "init_map":
      return {
        ...state,
        map: action.map,
        directionsRenderer: new google.maps.DirectionsRenderer(
          DIRECTIONS_OPTIONS
        ),
      } as IMapReducerState;

    case "clear_map":
      return {
        ...state,
        map: null,
      };

    case "update_directions":
      return {
        ...state,
        count: state.count + 1,
        origin: state.directions!.routes[0].overview_path[state.count + 1],
      } as IMapReducerState;

    case "initialize_directions": {
      state.directionsRenderer?.setDirections(action.directionsResult);
      state.directionsRenderer?.setMap(state.map);

      state.map?.fitBounds(action.directionsResult.routes[0].bounds);

      return {
        ...state,
        directions: action.directionsResult,
        origin: {
          lat: action.directionsResult.routes[0].legs[0].start_location.lat(),
          lng: action.directionsResult.routes[0].legs[0].start_location.lng(),
        },
        destination: {
          lat: action.directionsResult.routes[0].legs[0].end_location.lat(),
          lng: action.directionsResult.routes[0].legs[0].end_location.lng(),
        },
      } as IMapReducerState;
    }

    case "update_truck_location_along_route":
      if (!state.directions) return state;

      return {
        ...state,
        origin: action.coordinates,
        trailingPolyline: generateTrailingPolyline(
          action.coordinates,
          state.directions?.routes[0].overview_path
        ),
      } as IMapReducerState;

    case "update_truck_location_off_route":
      if (!state.directions) return state;
      state.directionsRenderer?.setDirections(action.directionsResult);
      state.directionsRenderer?.setMap(state.map);

      return {
        ...state,
        origin: action.coordinates,
        trailingPolyline: generateTrailingPolyline(
          action.coordinates,
          action.directionsResult.routes[0].overview_path
        ),
        directions: action.directionsResult,
      } as IMapReducerState;

    default:
      return state;
  }
};

export default function useMap() {
  //hooks
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });

  //refs
  const originRef = React.useRef<HTMLInputElement>(null);
  const destinationRef = React.useRef<HTMLInputElement>(null);

  //state
  const [mapState, dispatch] = React.useReducer(reducer, {
    count: 0,
    map: null,
    directionsRenderer: null,
  });

  //functions
  async function getDirections() {
    if (!originRef.current || !destinationRef.current) return;

    const directionsService = new google.maps.DirectionsService();

    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    dispatch({ type: "initialize_directions", directionsResult: results });
  }

  async function updateTruckLocation(e: google.maps.MapMouseEvent) {
    if (!mapState.directions || !e.latLng) return;

    const poly = new google.maps.Polyline({
      path: mapState.directions.routes[0].overview_path,
    });

    const isOnRoute = google.maps.geometry.poly.isLocationOnEdge(
      e.latLng,
      poly,
      0.0008
    );

    if (isOnRoute) {
      dispatch({
        type: "update_truck_location_along_route",
        coordinates: e.latLng,
      });
    }

    if (!isOnRoute) {
      if (!originRef.current || !destinationRef.current) return;

      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: [{ location: e.latLng }],
      });

      dispatch({
        type: "update_truck_location_off_route",
        coordinates: e.latLng,
        directionsResult: results,
      });
    }
  }

  //callbacks
  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    map.setCenter(MAP_STARTING_CENTER);
    map.setZoom(14);
    dispatch({ type: "init_map", map });
  }, []);

  const onUnmount = React.useCallback(function callback() {
    dispatch({ type: "clear_map" });
  }, []);

  return {
    isLoaded,
    onLoad,
    onUnmount,
    originRef,
    destinationRef,
    getDirections,
    mapState,
    updateTruckLocation,
  } as const;
}

/*
logic

1. calculate route between two addresses or points (check)
2. whenever we receive coordinates from momentum or another source
  a. check if that coordinates are along route using google.maps.geometry.poly.isLocationOnEdge
    1. false == move marker to new location and repeat step 1 with new origin location
    2. true == move marker to new location and proceed to next step
  b. calculate new path array to overlay onto original polyline
    1. use google distance api to find the index of the closest waypoint in the original path and slice array to generate path.
    2. push new marker location into array
    3. generate overlay polyline from new sliced array
3. set an interval to update route and eta.
  a. if location is far call repeate 3 during over long intervals
  b. as item gets closer call 3 during shorter durations

*/
