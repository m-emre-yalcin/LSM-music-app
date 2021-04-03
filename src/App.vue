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
