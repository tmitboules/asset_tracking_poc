import React from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { MAP_STARTING_CENTER } from "../utils/constants";

const LIBRARIES: Libraries | undefined = ["places"];

export default function useMap() {
  const originRef = React.useRef<HTMLInputElement>(null);
  const destinationRef = React.useRef<HTMLInputElement>(null);
  const [directions, setDirections] =
    React.useState<google.maps.DirectionsResult>();

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

    console.log(results);

    setDirections(results);
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
  };
}
