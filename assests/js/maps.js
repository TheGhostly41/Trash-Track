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

  // Main trash can marker
  const trashCanLocation = { lat: 43.78899692601981, lng: -79.19093841009143 };
  const trashMarker = new google.maps.Marker({
    position: trashCanLocation,
    map: map,
    title: "Trash Can",
    animation: google.maps.Animation.DROP,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "#4CAF50",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 10,
    },
  });

  // Add click event to marker
  trashMarker.addListener("click", () => {
    if (trashMarker.getAnimation() !== null) {
      trashMarker.setAnimation(null);
    } else {
      trashMarker.setAnimation(google.maps.Animation.BOUNCE);

      // Create an info window
      const infoWindow = new google.maps.InfoWindow({
        content: "<div><strong>Trash Can</strong><br>Status: 45% full<br>Last emptied: Today</div>",
      });

      infoWindow.open(map, trashMarker);

      // Stop animation after 1.5 seconds
      setTimeout(() => {
        trashMarker.setAnimation(null);
      }, 1500);
    }
  });

  // Add a second trash can marker
  const trashCanLocation2 = { lat: 43.78929, lng: -79.19113 };
  const trashMarker2 = new google.maps.Marker({
    position: trashCanLocation2,
    map: map,
    title: "Trash Can 2",
    animation: google.maps.Animation.DROP,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "#FF5722", // Different color to indicate different status
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 10,
    },
  });

  // Add click event to second marker
  trashMarker2.addListener("click", () => {
    const infoWindow = new google.maps.InfoWindow({
      content: "<div><strong>Trash Can</strong><br>Status: 85% full<br>Last emptied: Yesterday</div>",
    });
    infoWindow.open(map, trashMarker2);
  });
}

window.initMap = initMap;
