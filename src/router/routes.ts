import HomePage from '@/views/pages/home/HomePage.vue'
import LoginPage from '@/views/pages/auth/LoginPage.vue'
import RegisterPage from '@/views/pages/auth/RegisterPage.vue'
import ForgottenPasswordPage from '@/views/pages/auth/ForgottenPasswordPage.vue'
import EditionPage from '@/views/pages/EditionPage.vue'
import ActivityPage from '@/views/pages/ActivityPage.vue'
import UserPage from '@/views/pages/UserPage.vue'
import SettingsPage from '@/views/pages/settings/SettingsPage.vue'
import UserActivitiesPage from '@/views/pages/home/user/UserActivitiesPage.vue'
import GlobalImpactPage from '@/views/pages/home/community/GlobalImpactPage.vue'
import SecuritySettingsPage from '@/views/pages/settings/SecuritySettingsPage.vue'
import WelcomePage from '@/views/pages/auth/WelcomePage.vue'
import ProfileSettingsPage from '@/views/pages/settings/ProfileSettingsPage.vue'
import LevelsPage from '@/views/pages/home/user/LevelsPage.vue'
import {RouteConfig} from 'vue-router'
import {ActivityType} from '@/types/ActivityType'
import SearchGroupPage from '@/views/pages/home/groups/SearchGroupPage.vue'
import GroupPage from '@/views/pages/group/GroupPage.vue'
import GroupSettingsPage from '@/views/pages/group/settings/GroupSettingsPage.vue'
import GroupProfilePage from '@/views/pages/group/settings/GroupProfilePage.vue'
import GroupQuestionsPage from '@/views/pages/group/settings/GroupQuestionsPage.vue'
import GroupRequestsPage from '@/views/pages/group/settings/GroupRequestsPage.vue'
import MemberRequestPage from '@/views/pages/group/MemberRequestPage.vue'
import MembersListPage from '@/views/pages/group/MembersListPage.vue'
import GroupReportPage from '@/views/pages/group/settings/GroupReportPage.vue'
import SupportPage from '@/views/pages/settings/SupportPage.vue'
import StationModelsPage from '@/views/pages/group/settings/recycling/StationModelsPage.vue'
import StationModelFormPage from '@/views/pages/group/settings/recycling/StationModelFormPage.vue'
import StationsPage from '@/views/pages/group/settings/recycling/StationsPage.vue'
import StationFormPage from '@/views/pages/group/settings/recycling/StationFormPage.vue'
import MapPage from '@/views/pages/home/community/MapPage.vue'
import RecyclingStationPage from '@/views/pages/recycling/RecyclingStationPage.vue'
import RecyclingEditionPage from '@/views/pages/recycling/RecyclingEditionPage.vue'
import RecyclingPage from '@/views/pages/recycling/RecyclingPage.vue'
import CurrentUserRecyclingsPage from '@/views/pages/home/user/CurrentUserRecyclingsPage.vue'

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: {
      public: true
    }
  }, {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage,
    meta: {
      public: true
    }
  }, {
    path: '/forgotten-password',
    name: 'ForgottenPasswordPage',
    component: ForgottenPasswordPage,
    meta: {
      public: true
    }
  }, {
    path: '/welcome',
    name: 'WelcomePage',
    component: WelcomePage
  }, {
    path: '/',
    name: 'HomePageRoot',
    redirect: '/home/community'
  }, {
    path: '/home',
    name: 'HomePageWrapper',
    redirect: '/home/community'
  }, {
    path: '/home/:tab',
    name: 'HomePage',
    component: HomePage
  }, {
    path: '/group/:id',
    name: 'GroupPage',
    component: GroupPage
  }, {
    path: '/group/:id/members',
    name: 'GroupMembersPage',
    component: MembersListPage
  }, {
    path: '/group/:id/settings',
    name: 'GroupSettingsPage',
    component: GroupSettingsPage
  }, {
    path: '/group/:id/settings/profile',
    name: 'GroupProfilePage',
    component: GroupProfilePage
  }, {
    path: '/group/:id/settings/requests',
    name: 'GroupRequestsPage',
    component: GroupRequestsPage
  }, {
    path: '/group/:id/settings/questions',
    name: 'GroupQuestionsPage',
    component: GroupQuestionsPage
  }, {
    path: '/group/:id/settings/report',
    name: 'GroupReportPage',
    component: GroupReportPage
  }, {
    path: '/group/:id/settings/recycling-station-models',
    name: 'StationModelsPage',
    component: StationModelsPage
  }, {
    path: '/group/:groupId/settings/recycling-station-models/:id',
    name: 'StationModelFormPage',
    component: StationModelFormPage
  }, {
    path: '/group/:id/settings/recycling-stations',
    name: 'StationsPage',
    component: StationsPage
  }, {
    path: '/group/:groupId/settings/recycling-stations/:id',
    name: 'StationFormPage',
    component: StationFormPage
  }, {
    path: '/group/:id/member-request',
    name: 'MemberRequestPage',
    component: MemberRequestPage
  }, {
    path: '/search-group',
    name: 'SearchGroupPage',
    component: SearchGroupPage
  }, {
    path: '/levels',
    name: 'LevelsPage',
    component: LevelsPage
  }, {
    path: '/map',
    name: 'MapPage',
    component: MapPage
  }, {
    path: '/user/:id',
    name: 'UserPage',
    component: UserPage
  }, {
    path: '/current-user-cleanups',
    name: 'CurrentUserCleanups',
    component: UserActivitiesPage,
    props: {
      type: 'cleanup'
    }
  }, {
    path: '/current-user-recyclings',
    name: 'CurrentUserRecyclingsPage',
    component: CurrentUserRecyclingsPage
  }, {
    path: '/current-user-alerts',
    name: 'CurrentUserAlerts',
    component: UserActivitiesPage,
    props: {
      type: 'alert'
    }
  }, {
    path: '/current-user-events',
    name: 'CurrentUserEvents',
    component: UserActivitiesPage,
    props: {
      type: 'event'
    }
  }, {
    path: '/cleanup/:id',
    name: 'CleanupPage',
    component: ActivityPage
  }, {
    path: '/recyclings/:id',
    name: 'RecyclingPage',
    component: RecyclingPage
  }, {
    path: '/recycling-stations/:id',
    name: 'RecyclingStationPage',
    component: RecyclingStationPage
  }, {
    path: '/edit-cleanup',
    name: 'CleanupEditionPage',
    component: EditionPage,
    props: {
      type: ActivityType.cleanup
    }
  }, {
    path: '/edit-recycling',
    name: 'RecyclingEditionPage',
    component: RecyclingEditionPage
  }, {
    path: '/settings',
    name: 'SettingsPage',
    component: SettingsPage
  }, {
    path: '/global-impact',
    name: 'GlobalImpactPage',
    component: GlobalImpactPage
  }, {
    path: '/settings/security',
    name: 'SecuritySettingsPage',
    component: SecuritySettingsPage
  }, {
    path: '/settings/support',
    name: 'SupportPage',
    component: SupportPage
  }, {
    path: '/settings/profile',
    name: 'ProfileSettingsPage',
    component: ProfileSettingsPage
  }, {
    path: '*',
    redirect: '/'
  }
]
export default routes
