export function generateTrailingPolyline(
  coords: google.maps.LatLng,
  path: google.maps.LatLng[]
) {
  const { computeDistanceBetween } = google.maps.geometry.spherical;

  let smallestPosition = 0;
  let smallestDistance = computeDistanceBetween(coords, path[0]);

  for (let i = 1; i < path.length; i++) {
    const curDistance = computeDistanceBetween(coords, path[i]);
    if (curDistance < smallestDistance) {
      smallestPosition = i;
      smallestDistance = curDistance;
    }
  }

  const trailingPolyline = path.slice(0, smallestPosition);
  trailingPolyline.push(coords);

  return trailingPolyline;
}
