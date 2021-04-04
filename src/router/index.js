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
          component: () => import('../views/List.vue')
        },
        {
          path: 'stats',
          component: () => import('../views/Stats.vue')
        },
        {
          path: 'settings',
          component: () => import('../views/Settings.vue')
        },
        {
          path: 'youtube-mp3',
          component: () => import('../views/YoutubeMp3.vue')
        }
      ]
    }
  ]
})

export default router
