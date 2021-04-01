<template>
  <div class="player-container" v-if="musicFiles.length">
    <div class="row justify-around">
      <span class="btn prev" @click="prev()">
        <Previous width="20" class="light" />
      </span>
      <span class="btn pause/play" @click="play()">
        <Pause width="20" class="light" v-if="state === 'playing'" />
        <Play width="20" class="light" v-else />
      </span>
      <span class="btn next" @click="next()">
        <Next width="20" class="light" />
      </span>
    </div>

    <div class="row center player column">
      <div class="title">{{ musicFiles[currentMusicIndex].name }}</div>
      <div
        class="progress"
        :currentTime="currentTime | secondsToHms"
        :duration="duration | secondsToHms"
        @click.stop.prevent="changeCurrentTime($event)"
      >
        <div
          class="track"
          :style="{
            width: (currentTime / duration) * 100 + '%',
          }"
        ></div>
        <div class="pointer" />
      </div>
      <div class="volume"></div>
    </div>
  </div>
</template>

<script>
import Next from '../assets/icons/next.svg'
import Previous from '../assets/icons/previous.svg'
import Pause from '../assets/icons/pause.svg'
import Play from '../assets/icons/play.svg'

const Music = new Audio()
export default {
  components: {
    Next,
    Previous,
    Pause,
    Play
  },
  props: {
    musicFiles: Array,
    currentMusicIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      state: 'pause',
      currentTime: 0,
      duration: 0
    }
  },
  filters: {
    secondsToHms (second) {
      const d = Number(second)
      const h = Math.floor(d / 3600)
      const m = Math.floor((d % 3600) / 60)
      const s = Math.floor((d % 3600) % 60)
      const hDisplay =
        h > 0 ? `${h.toString().length > 1 ? `${h}` : `${0}${h}`}` : '00'
      const mDisplay =
        m > 0 ? `${m.toString().length > 1 ? `${m}` : `${0}${m}`}` : '00'
      const sDisplay =
        s > 0 ? `${s.toString().length > 1 ? `${s}` : `${0}${s}`}` : '00'
      if (h === 0) {
        return `${mDisplay}:${sDisplay}`
      } else {
        return `${hDisplay}:${mDisplay}:${sDisplay}`
      }
    }
  },
  methods: {
    play () {
      if (this.state === 'playing') {
        Music.pause()
      } else {
        Music.play()
      }
    },
    prev () {
      const index = this.currentMusicIndex - 1
      if (index >= 0) {
        this.$emit('change-music-index', index)
      }
    },
    next () {
      const index = this.currentMusicIndex + 1
      if (index < this.musicFiles.length) {
        this.$emit('change-music-index', index)
      }
    },
    changeCurrentTime (e) {
      const progressDOM = document.querySelector('.progress')
      const currentTime =
        Music.duration * ((e.layerX - 8) / progressDOM.clientWidth)
      Music.currentTime = currentTime
      this.currentTime = currentTime
    }
  },
  watch: {
    currentMusicIndex (newIndex, oldIndex) {
      Music.src = this.musicFiles[newIndex].path
      if (newIndex !== oldIndex) {
        if (this.state === 'playing') {
          Music.play()
          setTimeout(() => {
            this.duration = Music.duration
            this.currentTime = Music.currentTime
          }, 100)
        } else Music.pause()
      }
    },
    state (newB, oldB) {
      let interval
      if (newB !== oldB) {
        if (newB === 'playing') {
          interval = setInterval(() => {
            this.currentTime = Music.currentTime
          }, 1000)

          this.duration = Music.duration
        } else if (newB === 'pause') {
          clearInterval(interval)
        }
      }
    }
  },
  mounted () {
    if (this.musicFiles.length) {
      Music.src = this.musicFiles[this.currentMusicIndex].path

      // set current music timing
      this.duration = Music.duration
      this.currentTime = Music.currentTime

      Music.addEventListener('play', () => {
        this.state = 'playing'
      })
      Music.addEventListener('playing', () => {
        this.state = 'playing'
      })
      Music.addEventListener('pause', () => {
        this.state = 'pause'
      })
      Music.addEventListener('ended', () => {
        Music.pause()

        const index = this.currentMusicIndex + 1
        this.$emit('change-music-index', index)

        Music.src = this.musicFiles[this.currentMusicIndex].path
        setTimeout(() => {
          Music.play()
          setTimeout(() => {
            this.duration = Music.duration
            this.currentTime = Music.currentTime
          }, 100)
        }, 100)
      })
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
    .progress
      width: 90%
      background: -moz-linear-gradient(180deg, black 0%, black 40%, #666 40%, #666 60%, black 60%, black 100%)
      background: -webkit-linear-gradient(180deg, black 0%, black 40%, #666 40%, #666 60%, black 60%, black 100%)
      background: linear-gradient(180deg, black 0%, black 40%, #666 40%, #666 60%, black 60%, black 100%)
      display: flex
      align-items: center
      cursor: pointer
      position: relative
      &::before, &::after
        font-size: 10px
        color: white
        position: absolute
      &::before
        left: -30px
        content: attr(currentTime)
      &::after
        right: -30px
        content: attr(duration)
      .track
        height: 10px
        transition: width .2s
        background: -moz-linear-gradient(180deg, black 0%, black 40%, white 40%, white 60%, black 60%, black 100%)
        background: -webkit-linear-gradient(180deg, black 0%, black 40%, white 40%, white 60%, black 60%, black 100%)
        background: linear-gradient(180deg, black 0%, black 40%, white 40%, white 60%, black 60%, black 100%)
        &:hover
          background-color: #fafafa
      .pointer
        width: 8px
        height: 8px
        border-radius: 2px
        background-color: #fff
        border: 1px solid #eee
        cursor: pointer
</style>
