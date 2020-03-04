import {OpenWeather} from './open_weather';

const Weather = (dt, temp) =>
({
  dt,
  temp
})

const toFarenheit = k => (k - 273.15) * 9/5 + 32


const toWeather = (dt, temp) =>
  Weather((new Date(dt)).toLocaleDateString(), toFarenheit(temp))

const prepareItems = w =>
  toWeather(w.dt, w.main.temp)

const getWeatherItems = args =>
  OpenWeather.fetch(args)
  .map(json => json.list.map(prepareItems))

export {getWeatherItems}