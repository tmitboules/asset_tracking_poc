import "./App.css";

import {
  CircleF,
  DirectionsRenderer,
  GoogleMap,
  MarkerF,
  PolylineF,
} from "@react-google-maps/api";
import useMap from "./hooks/useMap";
import { CONTAINER_STYLE, MAP_STARTING_CENTER } from "./utils/constants";

function App() {
  const {
    isLoaded,
    onLoad,
    onUnmount,
    originRef,
    destinationRef,
    origin,
    destination,
    getDirections,
    snappedCoordinates,
    directions,
    distance,
    duration,
    rotation,
    zoom,
  } = useMap();

  const directionsOptions = {
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#FF6C3E",
      strokeWeight: 6,
    },
  };
  // const markerIcon = {
  //   url: "../src/assets/Navigation.svg",
  //   scaledSize: new google.maps.Size(32, 32),
  //   anchor: new google.maps.Point(16, 16),
  //   rotation: rotation,
  // };
  return (
    <>
      {isLoaded ? (
        <div id="container">
          <div className="action_bar">
            <label style={{ color: "white" }}>Start Point</label>
            <input
              ref={originRef}
              defaultValue="700 E Lake Drive, Orange CA"
              placeholder="Start Point"
            />
            <label style={{ color: "white" }}>End Point</label>
            <input
              ref={destinationRef}
              defaultValue="1476 Canyon Crest Drive, Corona, CA"
              placeholder="End Point"
            />
            <button onClick={getDirections}>Get Directions</button>
            <label style={{ color: "white" }}>Distance : {distance}</label>
            <label style={{ color: "white" }}> Duration : {duration}</label>
          </div>
          <div className="map_container">
            <GoogleMap
              center={origin ?? MAP_STARTING_CENTER}
              onUnmount={onUnmount}
              onLoad={onLoad}
              zoom={zoom}
              mapContainerStyle={CONTAINER_STYLE}
            >
              {origin && (
                <>
                  <MarkerF
                    icon={{
                      url: "../src/assets/Navigation.svg",
                      scaledSize: new google.maps.Size(32, 32),
                      anchor: new google.maps.Point(16, 16),
                      rotation: rotation,
                    }}
                    position={origin}
                  />
                </>
              )}

              {destination && (
                <>
                  <MarkerF position={destination} />
                </>
              )}
              {directions && (
                <DirectionsRenderer
                  options={directionsOptions}
                  directions={directions}
                />
              )}
              {snappedCoordinates && (
                <PolylineF
                  path={snappedCoordinates}
                  options={{
                    strokeColor: "grey",
                    strokeOpacity: 1,
                    strokeWeight: 7,
                    zIndex: 1000,
                  }}
                />
              )}
            </GoogleMap>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default App;
