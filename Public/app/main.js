const GEONAMES_USERNAME = "zeyad_m_nagi";

function selectCity(name, lat, lon) {
  document.getElementById("city-input").value = name;
  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lon;
  document.getElementById("suggestions").innerHTML = ""; // Clear suggestions

  fetchWeatherData(lat, lon, name);
}

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

async function fetchWeatherData(lat, lon, city = "") {
  try {
    const response = await fetch("/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: lat,
        lon: lon,
        city: city,
      }),
    });

    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    alert("Failed to fetch weather data");
  }
}

// Display weather data
function displayWeatherData(data) {
  const weatherResult = document.getElementById("weather-result");
  weatherResult.innerHTML = `
          <h3>Weather in ${data.location.city}</h3>
          <p>Temperature: ${data.currentWeather.temp}°C</p>
          <p>Humidity: ${data.currentWeather.humidity}%</p>
          <p>Rainfall: ${data.currentWeather.rainfall} mm</p>
          <h4>Detected Conditions</h4>
          <p>Flood: ${data.conditions.flood ? "Yes" : "No"}</p>
          <p>Drought: ${data.conditions.drought ? "Yes" : "No"}</p>
          <p>Heatwave: ${data.conditions.heatwave ? "Yes" : "No"}</p>
      `;

  console.log(data);
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

  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lon;

  fetchWeatherData(lat, lon);

  console.log(position);
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
