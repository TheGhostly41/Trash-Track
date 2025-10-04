// Trash Track - Google Maps integration

let map;

// Center near Sam Ibrahim (IA) Building
const CENTER_LOCATION = { lat: 43.78899692601981, lng: -79.19093841009143 };

// List all trash cans and their types
// Type must be either "Litter" or "Recycle"
const TRASH_CANS = [
  { position: { lat: 43.78899692601981, lng: -79.19093841009143 }, type: "Fake-Testing" },
  { position: { lat: 43.78929, lng: -79.19113 }, type: "Fake-Testing" },
  { position: { lat: 43.783867, lng: -79.187603 }, type: "Litter and Recycle" },
  { position: { lat: 43.784115, lng: -79.188015 }, type: "Litter and Recycle" },
  { position: { lat: 43.783558, lng: -79.188208 }, type: "Litter and Recycle" },
  { position: { lat: 43.783873, lng: -79.187717 }, type: "Litter and Recycle" },
  { position: { lat: 43.784808, lng: -79.187473 }, type: "Litter and Recycle" },
  { position: { lat: 43.785159, lng: -79.187117 }, type: "Litter and Recycle" },
  { position: { lat: 43.786194, lng: -79.188097 }, type: "Litter and Recycle" },
  { position: { lat: 43.786422, lng: -79.188609 }, type: "Litter and Recycle" },
  { position: { lat: 43.786713, lng: -79.189257 }, type: "Litter and Recycle" },
  { position: { lat: 43.787052, lng: -79.189949 }, type: "Litter and Recycle" },
  { position: { lat: 43.787182, lng: -79.190129 }, type: "Litter and Recycle" },
  { position: { lat: 43.787535, lng: -79.190778 }, type: "Litter and Recycle" },
  { position: { lat: 43.788183, lng: -79.19051 }, type: "Litter and Recycle" },
  { position: { lat: 43.788275, lng: -79.191097 }, type: "Litter and Recycle" },
];

// Build a styled marker icon based on type
function iconForType(type) {
  const color = type === "Recycle" ? "#4CAF50" : "#9E9E9E"; // green for recycle, gray for litter
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#FFFFFF",
    strokeWeight: 2,
    scale: 9,
  };
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTER_LOCATION,
    zoom: 17,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  // Reuse a single info window
  const infoWindow = new google.maps.InfoWindow();
  const bounds = new google.maps.LatLngBounds();

  // Dynamically add all markers
  TRASH_CANS.forEach(({ position, type }) => {
    const marker = new google.maps.Marker({
      position,
      map,
      title: `${type} Bin`,
      icon: iconForType(type),
    });

    marker.addListener("click", () => {
      infoWindow.setContent(`<div style="min-width:140px;"><strong>${type} Bin</strong></div>`);
      infoWindow.open(map, marker);
    });

    bounds.extend(position);
  });

  // Show all markers on screen
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);

    // Prevent zooming in too far when bounds are tight
    const listener = google.maps.event.addListenerOnce(map, "bounds_changed", () => {
      if (map.getZoom() > 19) map.setZoom(19);
      google.maps.event.removeListener(listener);
    });
  }
}

window.initMap = initMap;
