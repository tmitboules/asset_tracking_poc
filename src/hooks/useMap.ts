import React, { useMemo } from "react";
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
  const [distance, setDistance] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [origin, setOrigin] = React.useState<
    google.maps.LatLng | google.maps.LatLngLiteral
  >();
  const [count, setCount] = React.useState<number>(0);
  const [destination, setDestination] = React.useState<any>(null);
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const [rotation, setRotation] = React.useState(0);
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
    setOrigin({
      lat: results.routes[0].legs[0].start_location.lat(),
      lng: results.routes[0].legs[0].start_location.lng(),
    });
    setDestination({
      lat: results.routes[0].legs[0].end_location.lat(),
      lng: results.routes[0].legs[0].end_location.lng(),
    });
    setDistanceAndDuration(results);

    var pathValues = [];
    for (var i = 0; i < results.routes.length; i++) {
      for (var j = 0; j < results.routes[i].legs[0].steps.length; j++) {
        pathValues.push(
          results.routes[i].legs[0].steps[j].start_location.toUrlValue()
        );
        pathValues.push(
          results.routes[i].legs[0].steps[j].end_location.toUrlValue()
        );
      }
    }
    setSnappedPoints(pathValues);
  }

  const interval = setInterval(async () => {
    if (snappedPoints.length > 0 && snappedPoints[count]) {
      await getUpdateDirections(snappedPoints[count]);
    }
    clearInterval(interval);
  }, 10000);

  useMemo(() => {
    if (count < snappedPoints.length) {
      interval;
    }
  }, [count]);

  async function getUpdateDirections(newLocationRef: any) {
    if (!destinationRef.current) return;
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: newLocationRef,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDistanceAndDuration(results);
    setDirections(results);
    if (count < snappedPoints.length) setCount(count + 1);
    setTimeout(() => {
      updateMarkerPosition({
        lat: Number(snappedPoints[count].split(",")[0]),
        lng: Number(snappedPoints[count].split(",")[1]),
      });
    });
  }

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

  const updateMarkerPosition = (newCoordinates: any) => {
    // Calculate rotation angle based on movement direction
    const newRotation = calculateRotationAngle(newCoordinates);
    console.log(newRotation);
    setOrigin(newCoordinates);
    setRotation(newRotation);
  };

  const calculateRotationAngle = (newCoordinates: any) => {
    const prevLat = Number(origin?.lat);
    const prevLng = Number(origin?.lng);
    const { lat: newLat, lng: newLng } = newCoordinates;

    const deltaY = newLat - prevLat;
    const deltaX = newLng - prevLng;

    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    return angle;
  };

  async function snapToRoads() {
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
    origin,
    destination,
    directions,
    snappedPoints,
    setSnappedPoints,
    snapToRoads,
    distance,
    duration,
    getUpdateDirections,
    snappedCoordinates,
    count,
    setCount,
    rotation,
  };
}
