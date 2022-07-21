import Address from '@/types/Address'
import Coords from '@/types/Coords'
import CoordsBound from '@/types/CoordsBound'
import distance from '@turf/distance'
import GeocoderAddressComponent = google.maps.GeocoderAddressComponent
import GeocoderResult = google.maps.GeocoderResult

export function addressToString(address: Address) {
  return [address.city, address.state, address.country].filter(s => !!s).join(', ')
}

export function coordsBoundToString(bounds: CoordsBound): string {
  if (!bounds) {
    return ''
  }
  return [bounds.sw.lat, bounds.sw.lng, bounds.ne.lat, bounds.ne.lng].join(',')
}


export function calculateDistance(frm: Coords,
                                  to: Coords): number {
  return frm && to ? distance([frm.lat, frm.lng], [to.lat, to.lng]) : Infinity
}

export function remToPixel(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}

export function hasNotch() {
  let proceed = false
  const div = document.createElement('div')
  if (CSS.supports('padding-bottom: env(safe-area-inset-bottom)')) {
    div.style.paddingBottom = 'env(safe-area-inset-bottom)'
    proceed = true
  } else if (CSS.supports('padding-bottom: constant(safe-area-inset-bottom)')) {
    div.style.paddingBottom = 'constant(safe-area-inset-bottom)'
    proceed = true
  }
  if (proceed) {
    document.body.appendChild(div)
    const calculatedPadding = parseInt(window.getComputedStyle(div).paddingBottom)

    document.body.removeChild(div)
    if (calculatedPadding > 0) {
      return true
    }
  }
  return false
}

export function geocoderToAddress(result: GeocoderResult): Address {
  const city = findAddressComponentByType(result.address_components, 'locality')
    || findAddressComponentByType(result.address_components, 'administrative_area_level_2')
  const state = findAddressComponentByType(result.address_components, 'administrative_area_level_1')
    || findAddressComponentByType(result.address_components, 'administrative_area_level_2')
    || findAddressComponentByType(result.address_components, 'administrative_area_level_3')
    || findAddressComponentByType(result.address_components, 'administrative_area_level_4')
    || findAddressComponentByType(result.address_components, 'administrative_area_level_5')
    || findAddressComponentByType(result.address_components, 'administrative_area_level_6')
    || findAddressComponentByType(result.address_components, 'administrative_area_level_7')

  const country = findAddressComponentByType(result.address_components, 'country')

  return {
    city: city.long_name,
    state: state.long_name,
    country: country.long_name,
    countryCode: country.short_name
  }
}

export function findAddressComponentByType(addressComponents: GeocoderAddressComponent[], type: string) {
  return addressComponents.filter(({types}) => types.includes(type))[0]
}
