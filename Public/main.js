const OPENWEATHER_API_KEY = "f2ed49840497b3c7ee0070d59441efe4";
const GEONAMES_USERNAME = "zeyad_m_nagi";

async function fetchCitySuggestions(query) {
  if (query.length < 3) {
    document.getElementById("suggestions").innerHTML = ""; // Clear suggestions
    return;
  }

  const response = await fetch(
    `http://api.geonames.org/searchJSON?q=${query}&maxRows=5&username=${GEONAMES_USERNAME}`
  );
  const data = await response.json();

  // Display city suggestions
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";
  data.geonames.forEach((city) => {
    const listItem = document.createElement("li");
    listItem.innerText = `${city.name}, ${city.countryName}`;
    listItem.onclick = () => selectCity(city.name, city.lat, city.lng);
    suggestions.appendChild(listItem);
  });
}

function selectCity(name, lat, lon) {
  document.getElementById("city-input").value = name;
  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lon;
  document.getElementById("suggestions").innerHTML = ""; // Clear suggestions
}

async function fetchWeatherData() {
  const lat = document.getElementById("latitude").value;
  const lon = document.getElementById("longitude").value;

  if (!lat || !lon) {
    alert("Please select a city or enter coordinates!");
    return;
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );
  const weatherData = await response.json();

  displayWeatherData(weatherData);

  console.log(weatherData);
}

function displayWeatherData(data) {
  const weatherResult = document.getElementById("weather-result");
  weatherResult.innerHTML = `
        <h3>Weather in ${data.name}</h3>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Condition: ${data.weather[0].description}</p>
    `;

    console.log(data);
    console.log("done shown ");
}

document
  .getElementById("getLocationBtn")
  .addEventListener("click", function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  document.getElementById(
    "locationDisplay"
  ).innerText = `Latitude: ${lat}, Longitude: ${lon}`;

  fetchCityData(lat, lon);
  fetchCitySuggestions(lat, lon);

  console.log("DONE");
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

async function fetchCityData(lat, lon) {
  const response = await fetch(
    `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&username=zeyad_m_nagi`
  );
  const data = await response.json();
  console.log(data);
}
