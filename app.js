let map;
let userMarker;
let carMarker;

function initMap(lat, lng) {
  map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  userMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup("You")
    .openPopup();

  loadCarLocation();
}

// Get user location
navigator.geolocation.getCurrentPosition(pos => {
  initMap(pos.coords.latitude, pos.coords.longitude);
});

// Save car location
document.getElementById("saveBtn").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const carLocation = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    localStorage.setItem("carLocation", JSON.stringify(carLocation));

    if (carMarker) map.removeLayer(carMarker);

    carMarker = L.marker([carLocation.lat, carLocation.lng])
      .addTo(map)
      .bindPopup("Car")
      .openPopup();

    alert("Car location saved!");
  });
});

// Load saved car
function loadCarLocation() {
  const saved = localStorage.getItem("carLocation");
  if (!saved) return;

  const car = JSON.parse(saved);

  carMarker = L.marker([car.lat, car.lng])
    .addTo(map)
    .bindPopup("Car");
}

// Directions (opens external map)
document.getElementById("locateBtn").addEventListener("click", () => {
  const saved = localStorage.getItem("carLocation");
  if (!saved) {
    alert("No car location saved.");
    return;
  }

  const car = JSON.parse(saved);

  navigator.geolocation.getCurrentPosition(pos => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    // OpenStreetMap directions via OpenRouteService-style link
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat},${userLng};${car.lat},${car.lng}`;

    window.open(url, "_blank");
  });
});
