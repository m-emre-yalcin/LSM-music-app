<template>
  <div class="player-container">
      <audio ref="audio" :src="currentMusic.path"/>

      <div class="row justify-around">
        <span class="btn prev" @click="prev()">
          <Previous width="20" class="light" />
        </span>
        <span class="btn pause/play" @click="play()">
          <Pause width="20" class="light" v-if="currentMusic.playing"/>
          <Play width="20" class="light" v-else/>
        </span>
        <span class="btn next" @click="next()">
          <Next width="20" class="light" />
        </span>
      </div>

      <div class="row center player column">
        <div class="title">{{ currentMusic.name }}</div>
        <progress :value="currentMusic.curDuration" :max="currentMusic.maxDuration"></progress>
      </div>
  </div>
</template>

<script>
import Next from '../assets/icons/next.svg'
import Previous from '../assets/icons/previous.svg'
import Pause from '../assets/icons/pause.svg'
import Play from '../assets/icons/play.svg'
export default {
  components: {
    Next,
    Previous,
    Pause,
    Play
  },
  props: {
    currentMusic: Object
  },
  methods: {
    play (audio) {
      audio = this.$refs.audio

      console.log('playing:', audio)

      if (this.currentMusic.playing) audio.pause()
      else audio.play()

      // change playing state
      this.$emit('change-music-state', { playing: !this.currentMusic.playing })
    },
    prev () {
      const index = this.currentMusic.index - 1
      this.$emit('change-music-state', { index })
    },
    next () {
      const index = this.currentMusic.index + 1
      this.$emit('change-music-state', { index })
    }
  },
  watch: {
    'currentMusic.index' (newIndex, oldIndex) {
      if (newIndex !== oldIndex) {
        setTimeout(() => {
          if (this.currentMusic.playing) this.$refs.audio.play()
          else this.$refs.audio.pause()
        }, 100)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.player-container
  position: fixed
  bottom: 0
  left: 0
  right: 0
  padding: 16px 4px 8px 4px
  z-index: 1
  background-color: var(--color-black-100)
  display: flex
  justify-content: space-around
  flex-direction: column
  .btn
    cursor: pointer
    opacity: .7
    transition: opacity .15s
    &:hover
      opacity: 1
      box-shadow: 0 0 5px #000
    &:focus
      box-shadow: 0 0 5px #666
      opacity: 1
  .player
    margin: 4px 0
    .title
      padding: 2px
      color: var(--color-white-100)
</style>
