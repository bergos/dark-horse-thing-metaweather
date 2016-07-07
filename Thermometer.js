'use strict'

const fetch = require('isomorphic-fetch')
const Thermometer = require('dark-horse-thing/device/Thermometer')

class MetaWeatherThermometer extends Thermometer {
  constructor (iri, location) {
    super(iri)

    this._location = location
    this._woeid = typeof location === 'number' ? location : null
  }

  findWhereOnEarthId (location) {
    if (this._woeid) {
      return Promise.resolve(this._woeid)
    } else {
      let url = 'https://www.metaweather.com/api/location/search/?'

      if (typeof this._location === 'string') {
        url += 'query=' + encodeURIComponent(this._location)
      } else {
        url += 'lattlong=' + this._location.join(',')
      }

      return fetch(url).then((res) => {
        return res.json()
      }).then((res) => {
        this._woeid = res.shift().woeid

        return this._woeid
      })
    }
  }

  get () {
    return this.findWhereOnEarthId().then((woeid) => {
      let url = 'https://www.metaweather.com/api/location/' + woeid + '/'

      return fetch(url).then((res) => {
        return res.json()
      }).then((res) => {
        let weather = res.consolidated_weather.shift()

        this.humidity = weather.humidity
        this.temperature = weather.the_temp

        return this
      })
    })
  }
}

module.exports = MetaWeatherThermometer
