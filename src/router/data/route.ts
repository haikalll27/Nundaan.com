const routes = [
  {
    path: '/dashboard/',
    name: 'Ecommerce',
    component: () => import('../views/Ecommerce.vue'),
    meta: {
      title: 'eCommerce Dashboard',
    },
  },
  {
    path: '/dashboard/caller',
    name: 'Caller',
    component: () => import('../views/Callers/Caller.vue'),
    meta: {
      title: 'Caller',
    },
  },
  {
    path: '/dashboard/signage',
    name: 'Signage',
    component: () => import('../views/Signages/Signage.vue'),
    meta: {
      title: 'Signage',
    },
  },
  {
    path: '/dashboard/calendar',
    name: 'Calendar',
    component: () => import('../views/Others/Calendar.vue'),
    meta: {
      title: 'Calendar',
    },
  },
  {
    path: '/dashboard/profile',
    name: 'Profile',
    component: () => import('../views/Others/UserProfile.vue'),
    meta: {
      title: 'Profile',
    },
  },
  {
    path: '/dashboard/form-elements',
    name: 'Form Elements',
    component: () => import('../views/Forms/FormElements.vue'),
    meta: {
      title: 'Form Elements',
    },
  },
  {
    path: '/dashboard/basic-tables',
    name: 'Basic Tables',
    component: () => import('../views/Tables/BasicTables.vue'),
    meta: {
      title: 'Basic Tables',
    },
  },
  {
    path: '/dashboard/line-chart',
    name: 'Line Chart',
    component: () => import('../views/Chart/LineChart/LineChart.vue'),
  },
  {
    path: '/dashboard/bar-chart',
    name: 'Bar Chart',
    component: () => import('../views/Chart/BarChart/BarChart.vue'),
  },
  {
    path: '/dashboard/alerts',
    name: 'Alerts',
    component: () => import('../views/UiElements/Alerts.vue'),
    meta: {
      title: 'Alerts',
    },
  },
  {
    path: '/dashboard/avatars',
    name: 'Avatars',
    component: () => import('../views/UiElements/Avatars.vue'),
    meta: {
      title: 'Avatars',
    },
  },
  {
    path: '/dashboard/badge',
    name: 'Badge',
    component: () => import('../views/UiElements/Badges.vue'),
    meta: {
      title: 'Badge',
    },
  },

  {
    path: '/dashboard/buttons',
    name: 'Buttons',
    component: () => import('../views/UiElements/Buttons.vue'),
    meta: {
      title: 'Buttons',
    },
  },

  {
    path: '/dashboard/images',
    name: 'Images',
    component: () => import('../views/UiElements/Images.vue'),
    meta: {
      title: 'Images',
    },
  },
  {
    path: '/dashboard/videos',
    name: 'Videos',
    component: () => import('../views/UiElements/Videos.vue'),
    meta: {
      title: 'Videos',
    },
  },
  {
    path: '/dashboard/blank',
    name: 'Blank',
    component: () => import('../views/Pages/BlankPage.vue'),
    meta: {
      title: 'Blank',
    },
  },
  {
    path: '/dashboard/error-404',
    name: '404 Error',
    component: () => import('../views/Errors/FourZeroFour.vue'),
    meta: {
      title: '404 Error',
    },
  },
  {
    path: '/dashboard/signin',
    name: 'Signin',
    component: () => import('../views/Auth/Signin.vue'),
    meta: {
      title: 'Signin',
    },
  },
  {
    path: '/dashboard/signup',
    name: 'Signup',
    component: () => import('../views/Auth/Signup.vue'),
    meta: {
      title: 'Signup',
    },
  },
]
