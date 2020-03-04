import apiKey from './apikey';
import {getWeatherItems} from './model'

const populateUI = (zip) =>
  getWeatherItems({zip, apiKey})
  .map(weathers => weathers.map(toLi))

const toLi = weather =>
  `<li>${weather.dt} ${weather.temp}</li>`

///=============================
const app = () => {
  const goButton = document.getElementById('go')
  const input = document.getElementById('zip')
  const results = document.getElementById('results')

  goButton.addEventListener('click', () => {
    const zip = input.value.trim()
    populateUI(zip).fork(console.error, html => {
      results.innerHTML = html
    })
  })
}

app()