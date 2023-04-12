import {authProvider} from '@/providers/data/auth.provider'
import {imagesProvider} from '@/providers/data/images.provider'
import {passwordResetProvider} from '@/providers/data/password-reset.provider'
import {userProvider} from '@/providers/data/user.provider'
import {nativeProvider} from '@/providers/native/native.provider'
import {store} from '@/store/index'
import {locationModule} from '@/store/locationModule'
import {userModule} from '@/store/userModule'
import Validator from '@/tools/Validator'
import User from '@/types/User'
import {LOGIN, RESET_PASSWORD, UPDATE_EMAIL, UPDATE_PASSWORD} from '@/types/ValidationGroups'
import {FirebaseAnalytics} from '@capacitor-community/firebase-analytics'
import {Action, Module, Mutation, VuexModule} from 'vuex-class-modules'
import {LoggedResult} from '@/types/LoggedResult'

const SESSION = 'CSFN_SESSION'

@Module
class AuthModule extends VuexModule {

  logged = false
  loggedRedirect: string = null

  constructor() {
    super({store, name: 'auth'})
  }

  get isLogged() {
    return this.logged
  }

  @Mutation
  setLogged(logged: boolean): void {
    this.logged = logged
  }

  @Mutation
  setLoggedRedirect(path: string): void {
    this.loggedRedirect = path
  }

  @Action
  initialize(): Promise<LoggedResult | void> {
    return this.checkIsLogged()
      .catch(() => this.loggedOut())
  }

  @Action
  checkIsLogged(): Promise<LoggedResult> {
    return authProvider.fetchCurrentUser()
      .then((user) => this.loggedIn({user}))
      .then(({user, redirect}) => {
        this.setLogged(true)
        return {user, redirect}
      })
  }

  @Action
  doRegister(user: User): Promise<LoggedResult> {
    return locationModule.getLocationByIp()
      .then((location) => authProvider.doRegister(location.address.countryCode, user))
      .then((registered) => imagesProvider.uploadImages([user.picture as File], 'register')
        .then((images) => userProvider.updateUser(registered.id, {picture: {id: images[0].id}})))
      .then((user) => {
        FirebaseAnalytics.logEvent({name: 'sign_up', params: {method: 'credentials'}})
        return this.loggedIn({user, redirect: '/welcome'})
      })
  }

  @Action
  doCredentialsLogin(userLogin: User): Promise<LoggedResult> {
    return Validator.validate(userLogin, {groups: [LOGIN]})
      .then(() => authProvider.doLogin(userLogin))
      .then((user) => {
        FirebaseAnalytics.logEvent({name: 'login', params: {method: 'credentials'}})
        return this.loggedIn({user, redirect: '/home'})
      })
  }

  @Action
  doFacebookLogin(token: string): Promise<LoggedResult> {
    return locationModule.getLocationByIp()
      .then((location) => authProvider.doFacebookLogin(location.address.countryCode, token))
      .then((user) => this.loggedIn({user, redirect: user.isNew ? '/welcome' : '/home'}))
  }

  @Action
  doGoogleLogin(token: string): Promise<LoggedResult> {
    return Promise.all([locationModule.getLocationByIp(), nativeProvider.isIOS()])
      .then(([location, ios]) => authProvider.doGoogleLogin(location.address.countryCode, token, ios))
      .then((user) => this.loggedIn({user, redirect: user.isNew ? '/welcome' : '/home'}))
  }

  @Action
  doAppleLogin({token, name}: { token: string, name: string }): Promise<LoggedResult> {
    return locationModule.getLocationByIp()
      .then((location) => authProvider.doAppleLogin(location.address.countryCode, token, name))
      .then((user) => this.loggedIn({user, redirect: user.isNew ? '/welcome' : '/home'}))
  }

  @Action
  changeEmail(change: User) {
    return Validator.validate(change, {groups: [UPDATE_EMAIL]})
      .then(() => authProvider.changeEmail({
        currentEmail: userModule.getCurrentUser.email,
        currentPassword: change.password,
        newEmail: change.email
      }))
      .then(user => {
        FirebaseAnalytics.logEvent({name: 'update_email', params: {}})
        userModule.setCurrentUser(user)
      })
  }

  @Action
  changePassword({currentPassword, newPassword}: { currentPassword: string, newPassword: string }) {
    return Validator.validate({password: newPassword} as User, {groups: [UPDATE_PASSWORD]})
      .then(() => authProvider.changePassword({
        currentEmail: userModule.getCurrentUser.email,
        currentPassword, newPassword
      }))
      .then(user => {
        FirebaseAnalytics.logEvent({name: 'update_password', params: {}})
        userModule.setCurrentUser(user)
      })
  }

  @Action
  doPasswordReset(reset: User): Promise<void> {
    return Validator.validate(reset, {groups: [RESET_PASSWORD]})
      .then(() => {
        FirebaseAnalytics.logEvent({name: 'reset_password', params: {}})
        return passwordResetProvider.request(reset.email)
      })
  }

  @Action
  doLogout(): Promise<void> {
    return authProvider.doLogout()
      .then(() => {
        FirebaseAnalytics.logEvent({name: 'logout', params: {}})
        this.loggedOut()
      })
  }

  @Action
  loggedIn({user, redirect}: { user: User, redirect?: string }): Promise<LoggedResult> {
    userModule.setCurrentUser(user)
    this.setLogged(true)
    locationModule.initialize()
    let toRedirect = this.loggedRedirect || redirect
    this.setLoggedRedirect(null)
    return Promise.resolve({user, redirect: toRedirect})
  }

  @Action
  loggedOut() {
    userModule.setCurrentUser(undefined)
    this.setLogged(false)
  }


  @Action
  deleteAccount(password: string) {
    return authProvider.deleteAccount({email: userModule.getCurrentUser.email, password})
      .then(() => {
        FirebaseAnalytics.logEvent({name: 'delete_account', params: {}})
        this.loggedOut()
      })
  }
}

export const authModule = new AuthModule()
