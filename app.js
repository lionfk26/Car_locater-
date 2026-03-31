let map, userMarker, carMarkers = [], routeLine;

// INIT MAP
navigator.geolocation.getCurrentPosition(pos => {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  map = L.map('map').setView([lat, lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  userMarker = L.marker([lat, lng]).addTo(map).bindPopup("You");

  loadCars();
});

// STORAGE
function getCars() {
  return JSON.parse(localStorage.getItem("cars") || "[]");
}

function saveCars(cars) {
  localStorage.setItem("cars", JSON.stringify(cars));
}

// SAVE CAR
document.getElementById("saveBtn").onclick = () => {
  const name = document.getElementById("carName").value || "My Car";

  navigator.geolocation.getCurrentPosition(pos => {
    const cars = getCars();

    cars.push({
      name,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });

    saveCars(cars);
    loadCars();
  });
};

// LOAD CARS
function loadCars() {
  carMarkers.forEach(m => map.removeLayer(m));
  carMarkers = [];

  const cars = getCars();
  const select = document.getElementById("carList");
  select.innerHTML = "";

  cars.forEach((car, i) => {
    const marker = L.marker([car.lat, car.lng])
      .addTo(map)
      .bindPopup(car.name);

    carMarkers.push(marker);

    const option = document.createElement("option");
    option.value = i;
    option.textContent = car.name;
    select.appendChild(option);
  });
}

// DISTANCE
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

// BEARING
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
  const cars = getCars();
  const index = document.getElementById("carList").value;
  if (!cars[index]) return;

  const car = cars[index];

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

// IN-APP NAVIGATION
document.getElementById("navBtn").onclick = async () => {
  const cars = getCars();
  const index = document.getElementById("carList").value;
  if (!cars[index]) return;

  const car = cars[index];

  navigator.geolocation.getCurrentPosition(async pos => {
    const start = `${pos.coords.longitude},${pos.coords.latitude}`;
    const end = `${car.lng},${car.lat}`;

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
    );

    const data = await res.json();

    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

    if (routeLine) map.removeLayer(routeLine);

    routeLine = L.polyline(coords).addTo(map);

    map.fitBounds(routeLine.getBounds());
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
