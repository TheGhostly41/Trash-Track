// variables
let map;
let directionsService;
let directionsRenderer;
let userLocationMarker;

// Center location of Sam Ibrahim (IA) Building 43.78899692601981, -79.19093841009143
const CENTER_LOCATION = {
  lat: 43.78899692601981,
  lng: -79.19093841009143,
};

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
  // Initialize directions services
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#4285F4",
      strokeWeight: 5,
      strokeOpacity: 0.8,
    },
  });

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
    scaleControl: false,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: false,
  });

  // Attach the directions renderer to the map
  directionsRenderer.setMap(map);

  // Get user's location
  getUserLocation();

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
    if (trashMarker.getAnimation() !== null) {
      trashMarker.setAnimation(null);
    } else {
      trashMarker.setAnimation(google.maps.Animation.BOUNCE);

      // Create an info window with route button
      const infoWindow = new google.maps.InfoWindow({
        content: RECYCLED_STATUS,
      });

      infoWindow.open(map, trashMarker);

      // Add event listener to the button after it's been added to the DOM
      google.maps.event.addListener(infoWindow, "domready", () => {
        document.getElementById("routeButton1").addEventListener("click", () => {
          calculateAndDisplayRoute(trashCanLocation);
          infoWindow.close();
        });
      });

      // Stop animation after 1.5 seconds
      setTimeout(() => {
        trashMarker.setAnimation(null);
      }, 1500);
    }
  });

  // Add a second trash can marker
  const trashMarker2 = new google.maps.Marker({
    position: TRASH_CAN_LOCATION_2,
    map: map,
    title: "Trash Can 2",
    animation: google.maps.Animation.DROP,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "#FF5722",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 10,
    },
  });

  // Add click event to second marker
  trashMarker2.addListener("click", () => {
    const infoWindow = new google.maps.InfoWindow({
      content: ORGANIC_STATUS,
    });

    infoWindow.open(map, trashMarker2);

    // Add event listener to the button after it's been added to the DOM
    google.maps.event.addListener(infoWindow, "domready", () => {
      document.getElementById("routeButton2").addEventListener("click", () => {
        calculateAndDisplayRoute(trashCanLocation2);
        infoWindow.close();
      });
    });
  });
}

// Get user's current location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Create a marker for user's location if it doesn't exist
        if (!userLocationMarker) {
          userLocationMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#1E88E5",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            },
            zIndex: 100, // Ensure it appears above other markers
          });
        } else {
          // Update existing marker
          userLocationMarker.setPosition(userLocation);
        }

        // For testing purposes, if the user is outside the bounds, place them inside
        const boundsCenter = {
          lat: (SAM_IBRAHIM_BOUNDS.north + SAM_IBRAHIM_BOUNDS.south) / 2,
          lng: (SAM_IBRAHIM_BOUNDS.east + SAM_IBRAHIM_BOUNDS.west) / 2,
        };

        // Only move the user inside bounds for testing if they're far outside
        const distanceFromCenter = calculateDistance(userLocation, CENTER_LOCATION);
        if (distanceFromCenter > 0.5) {
          // If more than 0.5 km away
          userLocationMarker.setPosition(boundsCenter);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        // Place default user location within bounds for demo purposes
        const defaultUserLocation = { lat: 43.7892, lng: -79.1915 };
        userLocationMarker = new google.maps.Marker({
          position: defaultUserLocation,
          map: map,
          title: "Default Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#1E88E5",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8,
          },
        });
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    alert("Geolocation is not supported by your browser.");
  }
}

// Calculate and display the route between user location and trash can
function calculateAndDisplayRoute(destination) {
  if (!userLocationMarker) {
    alert("Your location is not available. Please enable location services.");
    return;
  }

  const userLocation = userLocationMarker.getPosition();

  directionsService.route(
    {
      origin: userLocation,
      destination: destination,
      travelMode: google.maps.TravelMode.WALKING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);

        // Display distance and time info
        const route = response.routes[0];
        const distanceText = route.legs[0].distance.text;
        const durationText = route.legs[0].duration.text;

        // Create an info popup with the route information
        const routeInfoWindow = new google.maps.InfoWindow({
          position: userLocation,
          content: `<div><strong>Distance:</strong> ${distanceText}<br><strong>Time:</strong> ${durationText} (walking)</div>`,
        });

        routeInfoWindow.open(map);
        setTimeout(() => routeInfoWindow.close(), 5000); // Close after 5 seconds
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

// Calculate distance between two points in km (for testing user position)
function calculateDistance(point1, point2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLng = deg2rad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

window.initMap = initMap;
