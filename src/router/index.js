import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/list'
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'list',
          component: () => import('../views/List.vue'),
          meta: {
            headerTitle: 'Your Library',
            headerIcon: 'Disc'
          }
        },
        {
          path: 'stats',
          component: () => import('../views/Stats.vue'),
          meta: {
            headerTitle: 'Your Music Habits',
            headerIcon: 'Stats'
          }
        },
        {
          path: 'youtube-mp3',
          component: () => import('../views/YoutubeMp3.vue'),
          meta: {
            headerTitle: 'Expand Your Library',
            headerIcon: 'VideoPlayer'
          }
        },
        {
          path: 'settings',
          component: () => import('../views/Settings.vue'),
          meta: {
            headerTitle: 'Settings',
            headerIcon: 'Settings'
          }
        }
      ]
    }
  ]
})

export default router
