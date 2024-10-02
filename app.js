const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
require("dotenv").config();

const app = express();
app.use(express.static("public"));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Function to check weather conditions
function checkWeatherConditions(weatherData) {
  const { temp, humidity, rainfall, soilMoisture } = weatherData;

  const conditions = {
    flood: false,
    drought: false,
    heatwave: false,
  };

  if (rainfall >= 50 && soilMoisture > 80) {
    conditions.flood = true;
  }

  if (rainfall < 75 && soilMoisture < 20 && temp > 35) {
    conditions.drought = true;
  }

  if (temp > 35 && humidity < 30) {
    conditions.heatwave = true;
  }

  return conditions;
}

// Route to get weather data
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
          units: "metric",
        },
      }
    );

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

    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const rainfall = weatherData.rain ? weatherData.rain["1h"] || 0 : 0;
    const soilMoisture = 75;
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
      forecast: forecast5DaysData,
    });
  } catch (error) {
    res.status(500).send("Error fetching weather data");
  }
});

app.post("/send-email", async (req, res) => {
  const { name, email, weatherData, forecast } = req.body;

  const emailContent = `
    Dear ${name},

    Here is the latest weather forecast:

    Current Conditions:
    - Temperature: ${weatherData.currentWeather.temp}°C
    - Humidity: ${weatherData.currentWeather.humidity}%
    - Rainfall: ${weatherData.currentWeather.rainfall}mm

    Forecast for the next 5 days:
    ${forecast
      .map(
        (day) => `
      Date: ${new Date(day.dt * 1000).toLocaleDateString()}
      - Temperature: ${day.main.temp}°C
      - Weather: ${day.weather[0].description}
    `
      )
      .join("\n")}

    Best regards,
    Your Weather App Team
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Weather Forecast for ${weatherData.location.city}`,
    text: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent with graph attachment!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
