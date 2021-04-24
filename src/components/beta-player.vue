<template>
  <div>
    <div class="icn"><Play /></div>
    <div class="icn"><Pause /></div>
  </div>
</template>

<script>
import Play from '../assets/icons/play.svg'
import Pause from '../assets/icons/pause.svg'

const mediaStream = new MediaStream()
const audio = new Audio()
audio.srcObject = mediaStream
export default {
  components: {
    Play,
    Pause
  },
  methods: {
    play () {},
    pause () {},
    addTracks () {
      this.$store.state.musicFiles.slice(0, 10).forEach(file => {
        mediaStream.addTrack(new MediaStreamTrack())
      })
    }
  },
  mounted () {
    this.addTracks()
  }
}
</script>

<style lang="sass" scoped>
.icn
  width: 30px
  height: 30px
  fill: white
  cursor: pointer
</style>
