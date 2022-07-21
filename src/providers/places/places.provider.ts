import {geocoderToAddress} from '@/tools/Utils'
import Address from '@/types/Address'
import Coords from '@/types/Coords'
import UnknownError from '@/types/errors/UnknownError'
import Location from '@/types/Location'

class PlacesProvider {

  getAddress(coords: Coords): Promise<Address> {
    return new google.maps.Geocoder().geocode({
      location: coords
    }).then(({results}) => geocoderToAddress(results[0]))
      .catch((err) => {
        console.error(err)
        return Promise.reject(new UnknownError('obtain-location'))
      })
  }

  searchPlace(input: string,
              country: string): Promise<Location[]> {
    return new google.maps.places.AutocompleteService().getPlacePredictions({input, types: ['political']})
      .then(({predictions}) => new Promise<Location[]>((resolve, reject) =>
        new google.maps.places.PlacesService(document.getElementById('empty') as HTMLDivElement)
          .getDetails({placeId: predictions[0].place_id}, ({geometry}, status) => {
            if (status === 'OK') {
              resolve([{
                address: {
                  city: predictions[0].description,
                  state: '',
                  country: '',
                  countryCode: ''
                },
                coords: {
                  lat: geometry.location.lat(),
                  lng: geometry.location.lng()
                }
              }])
            } else {
              reject()
            }
          })))
      .catch((error) => {
        console.log(error)
        return Promise.reject(new UnknownError('search-place'))
      })
  }

}

export const placesProvider = new PlacesProvider()
