import {geocoderToAddress, geocoderToFullAddress} from '@/tools/Utils'
import Address from '@/types/Address'
import Coords from '@/types/Coords'
import UnknownError from '@/types/errors/UnknownError'
import Location from '@/types/Location'

class PlacesProvider {

  getAddress(coords: Coords, full = false): Promise<Address> {
    return new google.maps.Geocoder().geocode({
      location: coords
    }).then(({results}) => full ? geocoderToFullAddress(results[0]) : geocoderToAddress(results[0]))
      .catch((err) => {
        console.error(err)
        return Promise.reject(new UnknownError('obtain-location'))
      })
  }

  searchPlace(input: string,
              country: string): Promise<Location[]> {
    return new google.maps.places.AutocompleteService().getPlacePredictions({input, types: ['political']})
      .then(({predictions}) => Promise.all(predictions.map(prediction => new Promise<Location>((resolve, reject) =>
        new google.maps.places.PlacesService(document.getElementById('empty') as HTMLDivElement)
          .getDetails({placeId: prediction.place_id}, ({geometry}, status) => {
            if (status === 'OK') {
              resolve({
                address: {
                  city: prediction.description,
                  state: '',
                  country: '',
                  countryCode: ''
                },
                coords: {
                  lat: geometry.location.lat(),
                  lng: geometry.location.lng()
                }
              })
            } else {
              reject()
            }
          })))))
      .catch((error) => {
        console.log(error)
        return Promise.reject(new UnknownError('search-place'))
      })
  }

}

export const placesProvider = new PlacesProvider()
