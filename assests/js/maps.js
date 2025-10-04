let map;
let userMarker;
let routePolyline;
let userPosition;

const trashCanLocations = [
  { lat: 34.0532, lng: -118.2452, title: "Trash Can 1" },
  { lat: 34.0545, lng: -118.2468, title: "Trash Can 2" },
  { lat: 34.0519, lng: -118.2481, title: "Trash Can 3" },
  { lat: 34.05, lng: -118.2422, title: "Trash Can 4" },
];

async function initMap() {
  const { Map, Polyline } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  await google.maps.importLibrary("geometry");

  map = new Map(document.getElementById("map"), {
    center: { lat: 34.0522, lng: -118.2437 }, // Default to Downtown LA
    zoom: 15,
    mapId: "DEMO_MAP_ID",
    gestureHandling: "greedy",
  });

  routePolyline = new Polyline({
    strokeColor: "#4285F4",
    strokeOpacity: 0.8,
    strokeWeight: 6,
    map: map,
  });

  const panel = document.getElementById("panel");
  const errorDisplay = document.getElementById("error-display");

  // Get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Add marker for user's location
        userMarker = new AdvancedMarkerElement({
          map: map,
          position: userPosition,
          title: "Your Location",
        });

        map.setCenter(userPosition);
        addTrashCanMarkers();
      },
      () => {
        handleLocationError(true, panel, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, panel, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, panel, pos) {
  const errorDisplay = document.getElementById("error-display");
  panel.classList.remove("hidden");
  errorDisplay.textContent = browserHasGeolocation
    ? "Error: The Geolocation service failed. Please enable location services."
    : "Error: Your browser doesn`t support geolocation.";
}

async function addTrashCanMarkers() {
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  trashCanLocations.forEach((location) => {
    const trashIcon = document.createElement("span");
    trashIcon.className = "material-icons";
    trashIcon.textContent = "delete";

    const trashPin = new PinElement({
      glyph: trashIcon,
      background: "#EA4335",
      borderColor: "#FFFFFF",
      glyphColor: "#FFFFFF",
    });

    const marker = new AdvancedMarkerElement({
      map: map,
      position: location,
      title: location.title,
      content: trashPin.element,
    });

    marker.addListener("click", () => {
      calculateAndDisplayRoute(userPosition, location);
    });
  });
}

async function calculateAndDisplayRoute(origin, destination) {
  const panel = document.getElementById("panel");
  const routeInfo = document.getElementById("route-info");
  const errorDisplay = document.getElementById("error-display");

  panel.classList.remove("hidden");
  routeInfo.textContent = "Calculating route...";
  errorDisplay.textContent = "";

  const request = {
    origin: {
      location: {
        latLng: origin,
      },
    },
    destination: {
      location: {
        latLng: destination,
      },
    },
    travelMode: "WALKING",
    routingPreference: "TRAFFIC_AWARE",
  };

  try {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": "YOUR_API_KEY",
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody.error.message}`);
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const decodedPath = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
      routePolyline.setPath(decodedPath);

      const distance = (route.distanceMeters / 1000).toFixed(2);
      const durationSeconds = parseInt(route.duration.slice(0, -1));
      const durationText = Math.round(durationSeconds / 60);

      routeInfo.innerHTML = `<strong>Distance:</strong> ${distance} km<br><strong>Walking Time:</strong> ${durationText} mins`;

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(origin.lat, origin.lng));
      bounds.extend(new google.maps.LatLng(destination.lat, destination.lng));
      decodedPath.forEach((path) => bounds.extend(path));
      map.fitBounds(bounds);
    } else {
      throw new Error("No routes found.");
    }
  } catch (error) {
    console.error("Directions request failed:", error);
    routeInfo.textContent = "";
    errorDisplay.textContent = "Could not calculate a walking route to this location.";
    routePolyline.setPath([]);
  }
}

initMap();
