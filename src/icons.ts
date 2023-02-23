import {addIcons} from 'ionicons'
import * as icons from 'ionicons5/icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import Vue from 'vue'


const kebabCase = (input) => input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
  .map(s => s.toLowerCase())
  .join('-')

/**
 * Ionicons
 */
const ionicons5 = Object.keys(icons).reduce((acc, key) => ({
  ...acc,
  [`md-${kebabCase(key)}`]: icons[key],
  [`ios-${kebabCase(key)}`]: icons[key]
}), {})

addIcons({...ionicons5, 'md-fb': icons.logoFacebook, 'ios-fb': icons.logoFacebook})

/**
 * Font awesome
 */

Vue.component('fa-icon', FontAwesomeIcon)