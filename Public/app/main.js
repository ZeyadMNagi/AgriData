const weatherResult = document.getElementById("weather-result");
const todayWeather = document.getElementById("today");
const weekWeather = document.getElementById("week");
const graphs = document.getElementById("graphs");
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
  document.getElementById("loadingIndicator").style.display = "block";
  document.getElementById("errorMessage").textContent = "";

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayWeatherData(data);
    console.log(data);
  } catch (error) {
    console.error(error);
    document.getElementById("errorMessage").textContent =
      "Failed to fetch weather data. Please try again.";
  } finally {
    document.getElementById("loadingIndicator").style.display = "none";
  }
}

// Display weather data
function displayWeatherData(data) {
  weatherResult.style.display = "block";
  document.getElementById("city-input").value = "";
  location.href = "#weather-result";
  document.querySelector(".form").style.display = "none";
  todayWeather.innerHTML = `
          <h3>Weather in ${data.location.city}</h3>
          <p>Temperature: ${data.currentWeather.temp}°C</p>
          <p>Humidity: ${data.currentWeather.humidity}%</p>
          <p>Rainfall: ${data.currentWeather.rainfall} mm</p>
      `;

  plotForecast(data.forecast);
  makePredictions(data.forecast);
  console.log(data);
}

function makePredictions(forecast) {
  const floodThreshold = 50;
  const droughtThreshold = 10;
  const heatWaveThreshold = 35;
  let floodWarning = false;
  let droughtWarning = false;
  let heatWaveWarning = false;

  forecast.list.forEach((item) => {
    const rain = item.rain ? item.rain["3h"] || 0 : 0;
    const temp = item.main.temp;

    if (rain > floodThreshold) {
      floodWarning = true;
    }

    if (rain < droughtThreshold) {
      droughtWarning = true;
    }

    if (temp > heatWaveThreshold) {
      heatWaveWarning = true;
    }
  });

  let warningMessage = "Weather Alerts: ";
  if (floodWarning) {
    warningMessage += "Possible Flooding. ";
  }
  if (droughtWarning) {
    warningMessage += "Possible Drought Conditions. ";
  }
  if (heatWaveWarning) {
    warningMessage += "Heat Wave Alert!";
  }

  const warningDiv = document.createElement("div");
  warningDiv.innerHTML = `<p>${warningMessage}</p>`;
  weatherResult.appendChild(warningDiv);
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

function plotForecast(forecast) {
  const forecastTime = [];
  const forecastTemps = [];
  const forecastHumidity = [];
  const forecastRainfall = [];

  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    forecastTime.push(date.toLocaleString()); // Format date
    forecastTemps.push(item.main.temp);
    forecastHumidity.push(item.main.humidity);
    forecastRainfall.push(item.rain ? item.rain["3h"] || 0 : 0);
  });

  // Plot temperature graph
  const ctxTemp = document.getElementById("tempChart").getContext("2d");
  new Chart(ctxTemp, {
    type: "line",
    data: {
      labels: forecastTime,
      datasets: [
        {
          label: "Temperature (°C)",
          data: forecastTemps,
          borderColor: "rgb(255, 99, 132)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Temperature Forecast (16 Days)",
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Date/Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Temperature (°C)",
          },
        },
      },
    },
  });

  // Plot humidity graph
  const ctxHumidity = document.getElementById("humidityChart").getContext("2d");
  new Chart(ctxHumidity, {
    type: "line",
    data: {
      labels: forecastTime,
      datasets: [
        {
          label: "Humidity (%)",
          data: forecastHumidity,
          borderColor: "rgb(54, 162, 235)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Humidity Forecast (16 Days)",
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Date/Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Humidity (%)",
          },
        },
      },
    },
  });

  // Plot rainfall graph
  const ctxRainfall = document.getElementById("rainfallChart").getContext("2d");
  new Chart(ctxRainfall, {
    type: "bar",
    data: {
      labels: forecastTime,
      datasets: [
        {
          label: "Rainfall (mm)",
          data: forecastRainfall,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Rainfall Forecast (16 Days)",
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Date/Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Rainfall (mm)",
          },
        },
      },
    },
  });
}
