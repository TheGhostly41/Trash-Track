let map;

// Center location of Sam Ibrahim (IA) Building 43.78878841061145, -79.19063341726873
const CENTER_LOCATION = {
  lat: 43.78878841061145,
  lng: -79.19063341726873,
};

// Map bounds
const SAM_IBRAHIM_BOUNDS = {
  north: 43.79, // increased from 43.789012
  south: 43.7868, // decreased from 43.787804
  east: -79.1885, // increased from -79.189579
  west: -79.1921, // decreased from -79.191687
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTER_LOCATION,
    zoom: 18, // change if too many markers are shown
    minZoom: 18, // Set minimum zoom level
    maxZoom: 25, // Set maximum zoom level

    /*
    restriction: {
      latLngBounds: SAM_IBRAHIM_BOUNDS,
      strictBounds: false,
    },
    */

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
