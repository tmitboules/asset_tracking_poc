import React from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { MAP_STARTING_CENTER } from "../utils/constants";

const LIBRARIES: Libraries | undefined = ["places"];

export default function useMap() {
  const originRef = React.useRef<HTMLInputElement>(null);
  const destinationRef = React.useRef<HTMLInputElement>(null);
  const [directions, setDirections] =
    React.useState<google.maps.DirectionsResult>();
  const [snappedPoints, setSnappedPoints] = React.useState<any[]>([]);
  const [snappedCoordinates, setSnappedCoordinates] = React.useState<any[]>([]);

  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(MAP_STARTING_CENTER);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  async function getDirections() {
    if (!originRef.current || !destinationRef.current) return;

    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    // var pathValues = [];
    // for (var i = 0; i < results.routes.length; i++) {
    //   for (var j = 0; j < results.routes[i].legs[0].steps.length; j++) {
    //     pathValues.push(
    //       results.routes[i].legs[0].steps[j].start_location.toUrlValue()
    //     );
    //     pathValues.push(
    //       results.routes[i].legs[0].steps[j].end_location.toUrlValue()
    //     );
    //   }
    // }
    //setSnappedPoints(pathValues);
    setDirections(results);
  }

  async function snapToRoads() {
    // const snappedPoints = [
    //   { lat: 37.772, lng: -122.214 },
    //   { lat: 21.291, lng: -157.821 },
    //   { lat: -18.142, lng: 178.431 },
    //   { lat: -27.467, lng: 153.027 },
    // ];
    if (snappedPoints.length < 2) return;

    const response = await fetch(
      `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(
        snappedPoints.join("|")
      )}&interpolate=true&key=${GOOGLE_MAPS_KEY}`
    );

    const data = await response.json();

    // Extract the snapped points from the response
    const snappedCoordinates = data.snappedPoints.map((point: any) => ({
      lat: point.location.latitude,
      lng: point.location.longitude,
    }));
    setSnappedCoordinates(snappedCoordinates);
  }

  return {
    isLoaded,
    onLoad,
    onUnmount,
    map,
    getDirections,
    originRef,
    destinationRef,
    directions,
    snappedPoints,
    setSnappedPoints,
    snapToRoads,
    snappedCoordinates,
  };
}
