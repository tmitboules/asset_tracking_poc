import "./App.css";

import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api";

import { CONTAINER_STYLE, MAP_STARTING_CENTER } from "./utils/constants";
import useMap from "./hooks/useMap";

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
  } = useMap();

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
            <label style={{ color: "white" }}>
              Current Distance : {mapState.remainingDistance}
            </label>
            <label style={{ color: "white" }}>
              Distance : {mapState.distance}
            </label>
            <label style={{ color: "white" }}>
              Duration : {mapState.duration}
            </label>
          </div>
          <div className="map_container">
            <GoogleMap
              center={MAP_STARTING_CENTER}
              onUnmount={onUnmount}
              onLoad={onLoad}
              mapContainerStyle={CONTAINER_STYLE}
              onClick={updateTruckLocation}
            >
              {(mapState.origin || mapState.currentOriginAngle) && (
                <>
                  <MarkerF
                    icon={{
                      // url: "../src/assets/Navigation.svg",
                      path: "M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z",
                      anchor: new google.maps.Point(16, 16),
                      rotation: mapState.currentOriginAngle ?? 0,
                      scaledSize: new google.maps.Size(32, 32),
                      fillColor: "#FF6C3E",
                      fillOpacity: 1,
                      strokeColor: "#FF6C3E",
                    }}
                    position={mapState.origin ?? MAP_STARTING_CENTER}
                  />
                  {/* <CircleF
                    center={mapState.origin}
                    radius={1}
                    options={{
                      strokeColor: "#FF6C3E",
                      strokeOpacity: 1,
                      strokeWeight: 5,
                      fillColor: "#F9F9F9",
                      fillOpacity: 1,
                    }}
                  /> */}
                </>
              )}
              {mapState.destination && (
                <>
                  <MarkerF
                    icon={{
                      url: "../src/assets/LocationOn.svg",
                      scaledSize: new google.maps.Size(32, 32),
                      anchor: new google.maps.Point(16, 16),
                    }}
                    position={mapState.destination}
                  />
                  {/* <CircleF
                    center={mapState.destination}
                    radius={15} // Example circle radius in meters
                    options={{
                      strokeColor: "#FF6C3E",
                      strokeOpacity: 0.1,
                      strokeWeight: 5,
                      fillColor: "#F9F9F9",
                      fillOpacity: 1,
                    }}
                  /> */}
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
