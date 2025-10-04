let map;

// Center location of Sam Ibrahim (IA) Building 43.78878841061145, -79.19063341726873
const CENTER_LOCATION = {
  lat: 43.78878841061145,
  lng: -79.19063341726873,
};

// Map bounds
const SAM_IBRAHIM_BOUNDS = {
  north: 43.792, // increased
  south: 43.785, // decreased
  east: -79.186, // increased
  west: -79.195, // decreased
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTER_LOCATION,
    zoom: 18, // change if too many markers are shown
    minZoom: 18, // Set minimum zoom level
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
