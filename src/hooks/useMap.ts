import React from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { MAP_STARTING_CENTER } from "../utils/constants";

const LIBRARIES: Libraries | undefined = ["places"];

export default function useMap() {
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
  const [zoom, setZoom] = React.useState<number>(15);
  const originRef = React.useRef<HTMLInputElement>(null);
  const destinationRef = React.useRef<HTMLInputElement>(null);

  const [directions, setDirections] =
    React.useState<google.maps.DirectionsResult>();

  const [origin, setOrigin] = React.useState<any>();
  const [destination, setDestination] = React.useState<any>(null);

  const [distance, setDistance] = React.useState("");
  const [duration, setDuration] = React.useState("");

  const [count, setCount] = React.useState<number>(1);

  const [rotation, setRotation] = React.useState(90);

  const [snappedPoints, setSnappedPoints] = React.useState<string[]>([
    "33.778119,-117.846784",
    "33.777807,-117.846766",
    "33.777807,-117.846766",
    "33.777774,-117.844449",
    "33.777774,-117.844449",
    "33.773305,-117.844445",
    "33.773305,-117.844445",
    "33.773312,-117.852937",
    "33.773312,-117.852937",
    "33.774997,-117.853139",
    "33.774997,-117.853139",
    "33.776469,-117.836496",
    "33.776469,-117.836496",
    "33.84246,-117.830153",
    "33.84246,-117.830153",
    "33.844391,-117.824889",
    "33.844391,-117.824889",
    "33.8764,-117.660117",
    "33.8764,-117.660117",
    "33.878108,-117.656993",
    "33.878108,-117.656993",
    "33.875662,-117.635074",
    "33.875662,-117.635074",
    "33.871735,-117.634046",
  ]);
  const [snappedCoordinates, setSnappedCoordinates] = React.useState<string[]>(
    []
  );

  async function getDirections() {
    if (!originRef.current || !destinationRef.current) return;

    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDistanceAndDuration(results);
    setOrigin({
      lat: results.routes[0].legs[0].start_location.lat(),
      lng: results.routes[0].legs[0].start_location.lng(),
    });
    setDestination({
      lat: results.routes[0].legs[0].end_location.lat(),
      lng: results.routes[0].legs[0].end_location.lng(),
    });
    setDirections(results);

    setInterval(() => {
      setCount((s) => s + 1);
    }, 5000);
  }

  function intervalRunner() {
    console.log(count);
    if (count % 3 == 0) {
      getUpdateDirections(snappedPoints[count]);
    } else {
      liveLocationChange();
    }
  }

  React.useEffect(() => {
    intervalRunner();
  }, [count]);

  function liveLocationChange() {
    if (snappedPoints.length > 0 && snappedPoints[count]) {
      updateMarker(snappedPoints[count]);
    }
  }

  async function getUpdateDirections(newLocationRef: any) {
    if (!destinationRef.current) return;
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: newLocationRef,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    console.log("getUpdateDirections");
    setDistanceAndDuration(results);
    setDirections(results);
    setOrigin({
      lat: results.routes[0].legs[0].start_location.lat(),
      lng: results.routes[0].legs[0].start_location.lng(),
    });
    map?.setCenter(results.routes[0].bounds.getCenter());

    setSnappedCoordinates([]);
  }

  function updateMarker(newLocationRef: any) {
    updateMarkerPosition({
      lat: Number(newLocationRef.split(",")[0]),
      lng: Number(newLocationRef.split(",")[1]),
    });
  }

  const updateMarkerPosition = (newCoordinates: any) => {
    console.log("updateMarkerPosition");

    const cor = snappedCoordinates.concat(newCoordinates);
    setSnappedCoordinates(cor);

    const newRotation = calculateRotationAngle(newCoordinates);
    setOrigin(newCoordinates);
    setRotation(newRotation);
    computeCurrentDistance(newCoordinates);
    setZoom(18);
  };

  const calculateRotationAngle = (newCoordinates: any) => {
    if (origin) {
      const prevLat = Number(origin?.lat);
      const prevLng = Number(origin?.lng);
      const { lat: newLat, lng: newLng } = newCoordinates;

      const deltaY = newLat - prevLat;
      const deltaX = newLng - prevLng;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      console.log({ angle });
      return angle;
    }
    return 0;
  };

  const computeCurrentDistance = (newCoordinates: any) => {
    if (!destination) return;
    const currentDistance =
      google.maps.geometry.spherical.computeDistanceBetween(
        destination,
        newCoordinates,
        6371
      );
    if (currentDistance < 1 && destination != newCoordinates) {
      setTimeout(() => {
        atLocation();
      }, 10);
    }
    return currentDistance;
  };

  const atLocation = () => {
    setSnappedCoordinates([]);
    setCount(snappedPoints.length);
    updateMarkerPosition(destination);
  };

  async function setDistanceAndDuration(results: google.maps.DirectionsResult) {
    if (results.routes[0].legs[0] && results.routes[0].legs[0].distance) {
      setDistance(results.routes[0].legs[0].distance.text);
    } else {
      setDistance("");
    }
    if (results.routes[0].legs[0] && results.routes[0].legs[0].duration) {
      setDuration(results.routes[0].legs[0].duration.text ?? 0);
    } else {
      setDuration("");
    }
  }

  return {
    isLoaded,
    onLoad,
    onUnmount,
    map,
    getDirections,
    originRef,
    destinationRef,
    origin,
    destination,
    directions,
    snappedPoints,
    setSnappedPoints,
    // snapToRoads,
    distance,
    duration,
    getUpdateDirections,
    snappedCoordinates,
    count,
    zoom,
    setCount,
    rotation,
  };
}
