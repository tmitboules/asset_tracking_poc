import "./App.css";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
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
          </div>
          <div className="map_container">
            <GoogleMap
              center={MAP_STARTING_CENTER}
              onUnmount={onUnmount}
              onLoad={onLoad}
              mapContainerStyle={CONTAINER_STYLE}
              onClick={(e) => {
                console.log(e);
              }}
            >
              {directions && <DirectionsRenderer directions={directions} />}
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
