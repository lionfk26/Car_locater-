let map, userMarker, carMarker;

// INIT MAP
navigator.geolocation.getCurrentPosition(pos => {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  userMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup("You");

  loadCar();
});

// SAVE CAR
document.getElementById("saveBtn").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const car = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    localStorage.setItem("carLocation", JSON.stringify(car));

    if (carMarker) map.removeLayer(carMarker);

    carMarker = L.marker([car.lat, car.lng])
      .addTo(map)
      .bindPopup("Car");

    alert("Saved!");
  });
};

// LOAD CAR
function loadCar() {
  const saved = localStorage.getItem("carLocation");
  if (!saved) return;

  const car = JSON.parse(saved);

  carMarker = L.marker([car.lat, car.lng])
    .addTo(map)
    .bindPopup("Car");
}

// DISTANCE FUNCTION
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon/2)**2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// BEARING FUNCTION
function getBearing(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;
  const toDeg = x => x * 180 / Math.PI;

  const dLon = toRad(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// LIVE UPDATE
setInterval(() => {
  const saved = localStorage.getItem("carLocation");
  if (!saved) return;

  const car = JSON.parse(saved);

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const distance = getDistance(lat, lng, car.lat, car.lng);
    document.getElementById("distance").innerText =
      `Distance: ${Math.round(distance)} m`;

    const bearing = getBearing(lat, lng, car.lat, car.lng);

    document.getElementById("arrow").style.transform =
      `rotate(${bearing}deg)`;
  });
}, 2000);

// DIRECTIONS
document.getElementById("locateBtn").onclick = () => {
  const saved = localStorage.getItem("carLocation");
  if (!saved) return alert("No saved car");

  const car = JSON.parse(saved);

  navigator.geolocation.getCurrentPosition(pos => {
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pos.coords.latitude},${pos.coords.longitude};${car.lat},${car.lng}`;
    window.open(url, "_blank");
  });
};

// LOST MODE
document.getElementById("lostBtn").onclick = () => {
  document.body.classList.toggle("lost-mode");
};

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
