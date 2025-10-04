let map;

// Center location of Sam Ibrahim (IA) Building 43.78899692601981, -79.19093841009143
const CENTER_LOCATION = {
  lat: 43.78899692601981,
  lng: -79.19093841009143,
};

// Map bounds
const SAM_IBRAHIM_BOUNDS = {
  north: 43.7905, // reduced from 43.791
  south: 43.7875, // increased from 43.787
  east: -79.1895, // reduced from -79.188
  west: -79.1925, // increased from -79.1935
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTER_LOCATION,
    zoom: 18, // change if too many markers are shown
    minZoom: 18, // Set minimum zoom level
    maxZoom: 25, // Set maximum zoom level

    // Map bounds restriction
    restriction: {
      latLngBounds: SAM_IBRAHIM_BOUNDS,
      strictBounds: false,
    },

    // Map controls
    zoomControl: false,
    cameraControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: false,
  });

  // test marker
  const position = { lat: 43.78899692601981, lng: -79.19093841009143 };

  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Trash Can 1",
  });
}

window.initMap = initMap;
