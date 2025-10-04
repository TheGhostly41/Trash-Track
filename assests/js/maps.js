let map;

// Center location of Sam Ibrahim (IA) Building 43.78899692601981, -79.19093841009143
const CENTER_LOCATION = {
  lat: 43.78899692601981,
  lng: -79.19093841009143,
};

// Map bounds
const SAM_IBRAHIM_BOUNDS = {
  north: 43.791, // moderate boundary
  south: 43.787, // moderate boundary
  east: -79.188, // moderate boundary
  west: -79.1935, // moderate boundary
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTER_LOCATION,
    zoom: 12, // change if too many markers are shown
    minZoom: 12, // Set minimum zoom level
    maxZoom: 25, // Set maximum zoom level

    // Map bounds
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
}

window.initMap = initMap;
