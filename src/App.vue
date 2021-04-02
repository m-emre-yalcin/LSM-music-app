<template>
  <div id="app">
    <Titlebar />
    <router-view />
  </div>
</template>

<script>
import Titlebar from './components/titlebar'
export default {
  components: {
    Titlebar
  }
}
</script>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
</style>
