import "./App.css";
import {
  GoogleMap,
  DirectionsRenderer,
  PolylineF,
  MarkerF,
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
    getDirections,
    directions,
    snapToRoads,
    snappedCoordinates,
    snappedPoints,
    setSnappedPoints,
  } = useMap();

  return (
    <>
      {isLoaded ? (
        <div id="container">
          <div className="action_bar">
            <input
              ref={originRef}
              defaultValue="1476 Canyon Crest Drive, Corona, CA"
              placeholder="Start Poin"
            />
            <input
              ref={destinationRef}
              defaultValue="700 E Lake Drive, Orange CA"
              placeholder="End Point"
            />
            <button onClick={getDirections}>Get Directions</button>
            <button onClick={snapToRoads}>Snap To Roads</button>
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
                if (e.latLng) {
                  console.log(snappedPoints);
                  snappedPoints.push(e.latLng?.toUrlValue());
                  console.log(snappedPoints);
                  setSnappedPoints(snappedPoints);
                  setTimeout(() => {
                    snapToRoads();
                  }, 0);
                }
              }}
            >
              {directions && <DirectionsRenderer directions={directions} />}
              {snappedCoordinates && (
                <PolylineF
                  path={snappedCoordinates}
                  options={{
                    strokeColor: "#FF0000",
                    strokeOpacity: 1,
                    strokeWeight: 3,
                  }}
                />
              )}
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
