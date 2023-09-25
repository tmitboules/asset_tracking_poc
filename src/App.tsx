import "./App.css";
import { GoogleMap, DirectionsRenderer, MarkerF } from "@react-google-maps/api";
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
    directions,
    distance,
    duration,
    rotation,
  } = useMap();

  const directionsOptions = {
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "red",
      strokeWeight: 6,
    },
  };

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
              center={MAP_STARTING_CENTER}
              onUnmount={onUnmount}
              onLoad={onLoad}
              zoom={15}
              mapContainerStyle={CONTAINER_STYLE}
              onClick={(e) => {
                console.log(e.latLng?.toUrlValue());
                // if (e.latLng) {
                //   snappedPoints.push(e.latLng?.toUrlValue());
                //   setSnappedPoints(snappedPoints);
                // }
              }}
            >
              {origin && (
                <MarkerF
                  icon={{
                    url: "../src/assets/Navigation.svg",
                    scaledSize: new google.maps.Size(32, 32),
                    anchor: new google.maps.Point(16, 16),
                    rotation: rotation,
                  }}
                  position={origin}
                />
              )}
              {destination && <MarkerF position={destination} />}
              {directions && (
                <DirectionsRenderer
                  options={directionsOptions}
                  directions={directions}
                />
              )}
              {/* {snappedCoordinates && (
                <PolylineF
                  path={snappedCoordinates}
                  options={{
                    strokeColor: "#FF0000",
                    strokeOpacity: 1,
                    strokeWeight: 3,
                  }}
                />
              )} */}
              {/* <>
                {Object.values(snappedCoordinates).map((loc, index) => (
                  <MarkerF markerStyle key={index} position={loc} />
                ))}
              </> */}
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
