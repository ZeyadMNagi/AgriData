const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.static("public"));
const PORT = process.env.PORT || 3000;

function checkWeatherConditions(weatherData) {
  const { temp, humidity, rainfall, soilMoisture } = weatherData;

  const conditions = {
    flood: false,
    drought: false,
    heatwave: false,
  };

  // Flood conditions
  if (rainfall >= 50 && soilMoisture > 80) {
    conditions.flood = true;
  }

  // Drought conditions
  if (rainfall < 75 && soilMoisture < 20 && temp > 35) {
    conditions.drought = true;
  }

  // Heatwave conditions
  if (temp > 35 && humidity < 30) {
    conditions.heatwave = true;
  }

  return conditions;
}

app.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).send("Please provide latitude and longitude");
  }

  try {
    const weatherResponse = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: lat,
          lon: lon,
          appid: process.env.API_KEY,
          units: "metric", // To get temperature in Celsius
        },
      }
    );

    const weatherData = weatherResponse.data;

    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const rainfall = weatherData.rain ? weatherData.rain["1h"] || 0 : 0;
    const soilMoisture = 75;

    const conditions = checkWeatherConditions({
      temp,
      humidity,
      rainfall,
      soilMoisture,
    });

    res.json({
      location: {
        lat,
        lon,
      },
      conditions,
      currentWeather: {
        temp,
        humidity,
        rainfall,
      },
    });
  } catch (error) {
    res.status(500).send("Error fetching weather data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
