import Address from '@/types/Address'
import CoordsBound from '@/types/CoordsBound'
import Coords from '@/types/Coords'
import distance from '@turf/distance'

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
