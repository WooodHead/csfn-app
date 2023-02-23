import {locationProvider} from '@/providers/location/location.provider'
import Coords from '@/types/Coords'
import {isEqual} from 'lodash'
import {MarkerClusterer, Renderer} from '@googlemaps/markerclusterer'
import LatLngBounds = google.maps.LatLngBounds

export default class Map {

  static zoom = 14

  map: google.maps.Map
  zoom: number
  bounds: LatLngBounds
  pin: string
  origin: Coords
  selected: Coords
  markers: google.maps.Marker[] = []
  isInput: boolean
  circle: any
  onTouch: Function
  clusterer: MarkerClusterer

  constructor({element, origin, isInput, zoom, pin, onTouch, onReady, bounds}:
                { element: string, origin: Coords, isInput: boolean, zoom?: number, pin?: string, onTouch?: Function, onReady?: Function, bounds?: LatLngBounds }) {
    if (!bounds) {
      this.origin = origin
    }
    this.selected = origin
    this.isInput = isInput
    this.zoom = zoom
    this.pin = pin
    this.onTouch = onTouch
    this.map = new google.maps.Map(document.getElementById(element), {
      center: !bounds ? origin : undefined,
      minZoom: 5,
      zoom: zoom || Map.zoom,
      disableDefaultUI: true,
      clickableIcons: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels.icon',
          stylers: [{visibility: 'off'}]
        }, {
          featureType: 'road',
          elementType: 'labels.icon',
          stylers: [{visibility: 'off'}]
        }
      ]
    })
    if (bounds) {
      this.map.fitBounds(bounds, 0)
    }

    const centerControlDiv = document.createElement('div')
    new Map.CenterControl(centerControlDiv, this.map, this.origin, this.myLocationClicked.bind(this))

    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv)

    if (onReady) {
      this.map.addListener('ready', onReady)
    }

    if (onTouch) {
      this.map.addListener('dragend', this.touched.bind(this))
      this.map.addListener('zoom_changed', this.touched.bind(this))
      this.map.addListener('tilt_changed', this.touched.bind(this))
    }

    if (isInput) {
      this.map.addListener('click', this.mapClicked.bind(this))
    }

    if (!isInput) {
      this.clusterer = new MarkerClusterer({map: this.map, renderer})
    }

    google.maps.event.trigger(this.map, 'resize')
  }

  static CenterControl(controlDiv,
                       map,
                       origin,
                       clicked) {
    // Set CSS for the control border.
    const controlUI = document.createElement('div')
    controlUI.className = 'ion-activatable ripple-parent'
    controlUI.style.backgroundColor = '#fff'
    controlUI.style.border = '2px solid #fff'
    controlUI.style.borderRadius = '100%'
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)'
    controlUI.style.cursor = 'pointer'
    controlUI.style.marginTop = '12px'
    controlUI.style.marginRight = '12px'
    controlUI.style.textAlign = 'center'
    controlDiv.appendChild(controlUI)

    // Set CSS for the control interior.
    const controlText = document.createElement('div')
    controlText.style.fontSize = '2.5em'
    controlText.style.paddingTop = '6px'
    controlText.style.paddingLeft = '7px'
    controlText.style.paddingRight = '7px'
    controlText.innerHTML = `<ion-icon src="${require('ionicons/dist/ionicons/svg/md-locate.svg')}" color="dark"></ion-icon><ion-ripple-effect></ion-ripple-effect>`
    controlUI.appendChild(controlText)

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function () {
      clicked()
    })

  }

  public addMarker(position: Coords,
                   pin: string,
                   onClick?: Function,
                   id?: string) {
    if (this.markers.filter(marker => isEqual(marker.getPosition(), position)).length > 0) {
      return
    }

    const marker = new google.maps.Marker({
      position,
      icon: pin,
      map: this.map
    })

    if (id) {
      marker.set('id', id)
    }

    if (onClick) {
      marker.addListener('click', onClick)
    }

    this.markers.push(marker)
    if (this.clusterer) {
      this.clusterer.addMarker(marker)
    }
  }

  removeMarkers() {
    this.clusterer.removeMarkers(this.markers)
    this.markers.forEach((marker) => marker.setMap(null))
    this.markers = []
  }

  removeMarkersById(ids: string[]) {
    const markers = this.markers.filter(marker => ids.includes(marker.get('id')))
    markers.forEach((marker) => marker.setMap(null))
    this.clusterer.removeMarkers(markers)
    this.markers = this.markers.filter(marker => !ids.includes(marker.get('id')))
  }

  setCircle(coords: Coords,
            radius: number) {
    this.circle = new google.maps.Circle({
      strokeWeight: 0,
      fillColor: '#59B14A',
      fillOpacity: 0.35,
      clickable: false,
      map: this.map,
      center: coords,
      radius: radius * 1000
    })
  }

  setCircleRadius(radius: number) {
    this.circle && this.circle.setRadius(radius * 1000)
  }

  removeCircle() {
    this.circle && this.circle.setMap(null)
  }

  public getSelectedPosition(): Coords {
    return this.selected
  }

  public getBounds(): string {
    return this.map.getBounds()?.toUrlValue()
  }

  public positionSelected(position: Coords) {
    this.selected = position
    this.markers.splice(0, 1)[0].setMap(null)
    this.addMarker(position, this.pin || '/img/pin.png')
    if (this.circle) {
      this.circle.setCenter(position)
    }
  }

  public moveCamera(position,
                    zoom?: number) {
    this.map.panTo(position)
    this.map.setZoom(zoom || this.zoom || Map.zoom)
  }

  public setOrigin(origin) {
    this.origin = origin
    this.moveCamera(origin)
  }

  private mapClicked({latLng}) {
    this.positionSelected(new Coords(latLng.lat(), latLng.lng()))
  }

  private myLocationClicked() {
    if (this.isInput) {
      locationProvider.getCurrentCoords()
        .then((coords) => {
          this.positionSelected(coords)
          this.moveCamera(coords)
        })
    } else {
      this.moveCamera(this.origin)
    }
  }

  private touched(event) {
    if (this.onTouch) {
      this.onTouch(event)
    }
    this.zoom = this.map.getZoom()
    this.bounds = this.map.getBounds()
  }
}

const renderer: Renderer = {
  render({count, position, markers}) {
    const svg = window.btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="70"  fill="#FFFFFF" stroke="#59B14A" stroke-width="20px"/>    
          </svg>`)
    return new google.maps.Marker({
      position,
      opacity: 1,
      icon: {
        url: `data:image/svg+xml;base64,${svg}`,
        scaledSize: new google.maps.Size(60, 60),
      },
      label: {
        text: String(count),
        color: '#59B14A',
        fontSize: '16px',
        fontWeight: 'bold'
      },
    })
  }
}
