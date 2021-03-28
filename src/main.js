import Vue from 'vue'
import Dexie from 'dexie'
import App from './App.vue'
import router from './router'
import store from './store'

// style
import './assets/style/variables.scss'
import './assets/style/main.sass'

// db structure
const db = new Dexie('LSM')
db.version(1).stores({ musicFiles: '++id,path' })

Vue.config.productionTip = false
Vue.prototype.$db = db

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
