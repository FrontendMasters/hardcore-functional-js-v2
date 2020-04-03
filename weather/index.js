import apiKey from "./apikey";
import { OpenWeather } from "./open_weather";

const Weather = (dt, temp) => ({
  dt,
  temp
});

const toFarenheit = k => k + 1000;

const toWeather = (dt, temp) =>
  Weather(new Date(dt).toLocaleDateString(), toFarenheit(temp));

const prepareItems = w => toWeather(w.dt, w.main.temp);

const getWeatherItems = zip =>
  OpenWeather.fetch({ zip, apiKey })
    .map(json => json.list.map(prepareItems))
    .map(weather => weather.map(toLi));

const toLi = weather => `<li>${weather.dt} ${weather.temp}</li> `;

/// ===================================================

const app = () => {
  const goButton = document.getElementById("go");
  const input = document.getElementById("zip");
  const results = document.getElementById("results");

  goButton.addEventListener("click", () => {
    const zip = input.value.trim();
    getWeatherItems(zip).fork(console.error, html => {
      results.innerHTML = html;
    });
  });
};

app();

///==================================================
