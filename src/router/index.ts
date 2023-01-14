import Vue from 'vue'
import {IonicVueRouter} from '@ionic/vue'
import routes from './routes'
import beforeEach from '@/router/beforeEach'
import afterEach from '@/router/afterEach'
import {RawLocation, Route} from 'vue-router'

Vue.use(IonicVueRouter)

export default class Router extends IonicVueRouter {

  isBack = false

  constructor() {
    super({
      mode: 'history', base: process.env.BASE_URL, routes
    })
    this.beforeEach(beforeEach)
    this.beforeEach((to, from, next) => {
      to.meta.isBack = this.isBack
      next()
    })
    this.afterEach(afterEach)
  }

  back() {
    this.isBack = true
    super.back()
  }

  push(location: RawLocation): Promise<Route> {
    this.isBack = false
    return super.push(location)
  }

  replace(location: RawLocation): Promise<Route> {
    this.isBack = false
    return super.replace(location)
  }
}

export const router = new Router()
