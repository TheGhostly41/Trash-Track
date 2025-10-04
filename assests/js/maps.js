// Trash Track - Google Maps (dynamic markers, live user tracking, routing, external "nearest" button)

let map;
let directionsService;
let directionsRenderer;
let userMarker;
let watchId = null;
let currentDestination = null;
let nearestMode = false; // if true, re-routes to the nearest bin as the user moves
const markers = [];

// Center near Sam Ibrahim (IA) Building
const CENTER_LOCATION = { lat: 43.786507, lng: -79.188647 };

// Map bounds
const SAM_IBRAHIM_BOUNDS = {
  north: 43.7905,
  south: 43.7875,
  east: -79.1895,
  west: -79.1925,
};

// Marker positions
const TRASH_CAN_LOCATION_1 = { lat: 43.78899692601981, lng: -79.19093841009143 };
const TRASH_CAN_LOCATION_2 = { lat: 43.78929, lng: -79.19113 };
/*lat: 43.783867, lng: -79.187603
  lat: 43.784115, lng: -79.188015
  lat: 43.783558, lng: -79.188208
  lat: 43.783873, lng: -79.187717
  lat: 43.784808, lng: -79.187473
  lat: 43.785159, lng: -79.187117
  lat: 43.786194, lng: -79.188097
  lat: 43.786422, lng: -79.188609
  lat: 43.786713, lng: -79.189257
  lat: 43.787052, lng: -79.189949
  lat: 43.787182, lng: -79.190129
  lat: 43.787535, lng: -79.190778
  lat: 43.788183, lng: -79.190510
  lat: 43.788275, lng: -79.191097
*/

// marker status'
const RECYCLED_STATUS = `
          <div>
            <strong>Trash Can</strong><br>
            Status: Recycle Only<br>
            <button id="routeButton1" style="margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Show Route</button>
          </div>
        `;

const ORGANIC_STATUS = `
          <div>
            <strong>Trash Can</strong><br>
            Status: Organic Waste Only<br>
            <button id="routeButton2" style="margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Show Route</button>
          </div>
        `;

const GENERAL_STATUS = `
          <div>
            <strong>Trash Can</strong><br>
            Status: General Waste Only<br>
            <button id="routeButton3" style="margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Show Route</button>
          </div>
        `;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTER_LOCATION,
    zoom: 18,
    minZoom: 18,
    maxZoom: 25,

    restriction: {
      latLngBounds: SAM_IBRAHIM_BOUNDS,
      strictBounds: false,
    },

    zoomControl: false,
    cameraControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  // Attach the directions renderer to the map
  directionsRenderer.setMap(map);

  const infoWindow = new google.maps.InfoWindow();

  // Main trash can marker
  const trashMarker = new google.maps.Marker({
    position: TRASH_CAN_LOCATION_1,
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
    // Create an info window with route button
    const infoWindow = new google.maps.InfoWindow({
      content: RECYCLED_STATUS,
    });

    infoWindow.open(map, trashMarker);

    // Add event listener to the button after it's been added to the DOM
    google.maps.event.addListener(infoWindow, "domready", () => {
      document.getElementById("routeButton1").addEventListener("click", () => {
        calculateAndDisplayRoute(TRASH_CAN_LOCATION_1); // Fixed: use the constant TRASH_CAN_LOCATION_1
        infoWindow.close();
      });
    });
  });

  // Start live tracking
  startUserWatch();

  // Expose global function for external HTML button
  window.routeToNearestBin = routeToNearestBin;
}

function startUserWatch() {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const userLatLng = { lat: position.coords.latitude, lng: position.coords.longitude };

      if (!userMarker) {
        userMarker = new google.maps.Marker({
          position: userLatLng,
          map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#1E88E5",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8,
          },
          zIndex: 100,
        });
      } else {
        userMarker.setPosition(userLatLng);
      }

      // Update route as user moves
      if (nearestMode && markers.length) {
        const nearest = findNearestMarker(userMarker.getPosition());
        const nearestPos = nearest?.getPosition();
        if (nearestPos && (!currentDestination || !nearestPos.equals(currentDestination))) {
          currentDestination = nearestPos;
        }
      }
      if (currentDestination) {
        routeFromUserTo(currentDestination);
      }
    },
    (error) => {
      console.error("Error getting location:", error);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function routeFromUserTo(destination) {
  if (!userMarker) return;

  directionsService.route(
    {
      origin: userMarker.getPosition(),
      destination,
      travelMode: google.maps.TravelMode.WALKING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed: " + status);
      }
    }
  );
}

// Public API - called from external HTML
function routeToNearestBin() {
  if (!userMarker) {
    window.alert("Waiting for your location. Please enable location services.");
    return;
  }
  if (!markers.length) {
    window.alert("No trash cans available.");
    return;
  }

  const nearest = findNearestMarker(userMarker.getPosition());
  if (!nearest) {
    window.alert("No nearby trash cans found.");
    return;
  }

  // Override any current route with nearest
  nearestMode = true; // keep snapping to nearest as user moves
  currentDestination = nearest.getPosition();
  routeFromUserTo(currentDestination);
}

// Nearest marker by Haversine distance
function findNearestMarker(userLatLng) {
  const uLat = typeof userLatLng.lat === "function" ? userLatLng.lat() : userLatLng.lat;
  const uLng = typeof userLatLng.lng === "function" ? userLatLng.lng() : userLatLng.lng;

  let nearest = null;
  let minDist = Infinity;

  for (const m of markers) {
    const p = m.getPosition();
    const dist = haversineMeters(uLat, uLng, p.lat(), p.lng());
    if (dist < minDist) {
      minDist = dist;
      nearest = m;
    }
  }
  return nearest;
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

window.initMap = initMap;
