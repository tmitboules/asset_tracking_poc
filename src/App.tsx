import "./App.css";

import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api";

import useMapTakeTwo from "./hooks/useMapTakeTwo";
import { CONTAINER_STYLE, MAP_STARTING_CENTER } from "./utils/constants";

function App() {
  const {
    isLoaded,
    onLoad,
    onUnmount,
    originRef,
    destinationRef,
    getDirections,
    mapState,
    updateTruckLocation,
  } = useMapTakeTwo();

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
            {/* <label style={{ color: "white" }}>Distance : {distance}</label>
            <label style={{ color: "white" }}> Duration : {duration}</label> */}
          </div>
          <div className="map_container">
            <GoogleMap
              center={MAP_STARTING_CENTER}
              onUnmount={onUnmount}
              onLoad={onLoad}
              mapContainerStyle={CONTAINER_STYLE}
              onClick={updateTruckLocation}
            >
              {mapState.origin && (
                <>
                  <MarkerF
                    icon={{
                      url: "../src/assets/Navigation.svg",
                      scaledSize: new google.maps.Size(32, 32),
                      anchor: new google.maps.Point(16, 16),
                      rotation: 90,
                    }}
                    position={mapState.origin}
                  />
                </>
              )}
              {mapState.destination && (
                <>
                  <MarkerF position={mapState.destination} />
                </>
              )}

              <>
                {mapState.trailingPolyline && (
                  <PolylineF
                    path={mapState.trailingPolyline}
                    options={{
                      strokeColor: "grey",
                      strokeOpacity: 1,
                      strokeWeight: 7,
                      zIndex: 1000,
                    }}
                  />
                )}
              </>
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
