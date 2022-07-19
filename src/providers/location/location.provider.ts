import Address from '@/types/Address'
import Coords from '@/types/Coords'
import LocationError from '@/types/errors/LocationError'
import Location from '@/types/Location'
import {Geolocation} from '@capacitor/geolocation'
import axios from 'axios'

const ipLocationURL = 'https://get.geojs.io/v1/ip/geo.json'

export default class LocationProvider {

  getCurrentCoords(): Promise<Coords> {
    return Geolocation.getCurrentPosition()
      .then(({coords}) => new Coords(coords.latitude, coords.longitude))
      .catch(() => this.getLocationByIp()
        .then((location: Location) => location.coords))
      .catch(() => Promise.reject(new LocationError()))
  }

  public getLocationByIp(): Promise<Location> {
    return axios.get(ipLocationURL)
      .then(({data}) => new Location(new Address(data.city, data.region, data.country, data.country_code), new Coords(Number(data.latitude), Number(data.longitude))))
  }

}

export const locationProvider = new LocationProvider()
