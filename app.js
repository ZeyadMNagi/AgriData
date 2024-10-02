const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.static("public"));
app.use(express.json());

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

app.post("/weather", async (req, res) => {
  const { lat, lon, city } = req.body;

  if (!lat || !lon) {
    return res.status(400).send("Please provide latitude and longitude.");
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

    // Fetch the 5-day forecast
    const forecast5DaysResponse = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          lat: lat,
          lon: lon,
          appid: process.env.API_KEY,
          units: "metric",
        },
      }
    );

    const forecast16DaysResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,soil_temperature_6cm,soil_moisture_3_to_9cm&timezone=Africa%2FCairo&forecast_days=16`
    );

    const weatherData = weatherResponse.data;
    const forecast5DaysData = forecast5DaysResponse.data;
    const forecast16DaysData = forecast16DaysResponse.data;

    // Extract relevant weather data

    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const rainfall = weatherData.rain ? weatherData.rain["1h"] || 0 : 0;
    const soilMoisture = 75; // Static value for now
    const state = weatherData.weather;

    const conditions = checkWeatherConditions({
      temp,
      humidity,
      rainfall,
      soilMoisture,
    });

    res.json({
      location: {
        city: weatherData.name || city,
        lat,
        lon,
      },
      conditions,
      currentWeather: {
        temp,
        humidity,
        rainfall,
      },
      state,
      forecast: forecast5DaysData, // Send forecast data to frontend
    });
  } catch (error) {
    res.status(500).send("Error fetching weather data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
