/*
    NOTE: This file is 96% vibe coded, not the best with JS, but it works. :)
*/

let map;
let directionsService;
let directionsRenderer;
let userMarker;
let watchId = null;
let currentDestination = null;
let nearestMode = false; // if true, re-routes to the nearest bin as the user moves
const markers = [];

// Read ?nearest=1 from the URL to auto-route after load
const urlParams = new URLSearchParams(window.location.search);
let pendingNearest = urlParams.get("nearest") === "1";

// Center near Sam Ibrahim (IA) Building
const CENTER_LOCATION = { lat: 43.786507, lng: -79.188647 };

// All trash cans are "Litter and Recycle"
const TRASH_CANS = [
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

// Hide all POIs/businesses/buildings (icons + labels)
const MAP_STYLES_HIDE_POIS = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  // Hide man-made building footprints
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ visibility: "off" }] },
];

// Marker icon
function binIcon(size = 36, fill = "#4CAF50") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="18" fill="${fill}" stroke="#FFFFFF" stroke-width="2"/>
      <svg x="12" y="12" width="24" height="24" viewBox="0 -960 960 960">
        <path fill="#FFFFFF" d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
      </svg>
    </svg>
  `;
  const url = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  return {
    url,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2), // center the icon on the coordinate
  };
}

// Build a list of 14 JGPs with 4-digit suffix: WA0001..WA0014
const IMAGE_BASE_DIR = "../images"; // resolved relative to pages/maps.html
const IMAGES = Array.from({ length: 14 }, (_, i) => {
  const n = String(i + 1).padStart(4, "0"); // 0001..0014
  return `${IMAGE_BASE_DIR}/IMG-20251004-WA${n}.jgp`;
});

// Popup content (dynamic image + text + single button)
function infoContent(type, buttonId, imgUrl) {
  const fallback = "../assests/icons/trashcan.svg";
  return `
    <div style="width:260px;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;font-family:Arial, sans-serif;">
      <div style="height:120px;background:#f5f5f7;display:flex;align-items:center;justify-content:center;">
        <img src="${imgUrl}" onerror="this.onerror=null;this.src='${fallback}';"
             alt="Trash can location" style="max-width:100%;max-height:100%;object-fit:cover;object-position:center;display:block;">
      </div>
      <div style="padding:12px;">
        <div style="font-weight:600;margin-bottom:8px;">${type}</div>
        <button id="${buttonId}"
          style="background:#4CAF50;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer">
          Select Route
        </button>
      </div>
    </div>
  `;
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: CENTER_LOCATION,
    zoom: 18,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false, // disable default Google POI clicks
    styles: MAP_STYLES_HIDE_POIS, // apply styles to hide POIs/buildings
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: { strokeColor: "#4285F4", strokeWeight: 5, strokeOpacity: 0.85 },
  });
  directionsRenderer.setMap(map);

  const infoWindow = new google.maps.InfoWindow();

  // Create markers
  TRASH_CANS.forEach(({ position, type }, idx) => {
    const marker = new google.maps.Marker({
      position,
      map,
      title: type,
      icon: binIcon(),
    });
    // Assign an image to this marker (round-robin across the 14 JPGs)
    marker.__imgUrl = IMAGES[idx % IMAGES.length];
    markers.push(marker);

    marker.addListener("click", () => {
      const btnId = `route-btn-${idx}`;
      // Pass the marker's assigned image to the popup
      infoWindow.setContent(infoContent(type, btnId, marker.__imgUrl));
      infoWindow.open(map, marker);

      google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.addEventListener("click", () => {
            nearestMode = false; // manual selection overrides nearest mode
            currentDestination = marker.getPosition();
            if (userMarker) routeFromUserTo(currentDestination);
            infoWindow.close();
          });
        }
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

      // If index requested nearest, run it once when we have a position
      if (pendingNearest) {
        pendingNearest = false;
        routeToNearestBin();
      }

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
      if (pendingNearest) {
        pendingNearest = false;
        window.alert("Unable to get your location to route to the nearest bin.");
      }
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
