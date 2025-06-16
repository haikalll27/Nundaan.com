import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Monitor',
      component: () => import('../views/Monitor/MonitorPage.vue'),
      meta: {
        title: 'User',
      },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'Dashboard',
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
      path: '/dashboard/ticket',
      name: 'Caller',
      component: () => import('../views/Callers/Caller.vue'),
      meta: {
        title: 'Caller',
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
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard/error-404',
    },
  ],
})

// Auth Guard
router.beforeEach((to, from, next) => {
  document.title = `Vue.js ${to.meta.title} | TailAdmin - Vue.js Tailwind CSS Dashboard Template`

  const publicRoutes = ['/', '/dashboard/signin']
  const isPublic = publicRoutes.includes(to.path)

  const session = localStorage.getItem('sb-nbhsvuqycjizirnusafy-auth-token')
  let access_token = null

  if (session) {
    try {
      const parsed = JSON.parse(session)
      access_token = parsed.access_token
    } catch (e) {
      access_token = null
    }
  }

  if (!access_token && !isPublic) {
    next('/dashboard/signin')
  } else {
    next()
  }
})

export default router
