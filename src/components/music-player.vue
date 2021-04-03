<template>
  <div class="player-container music-player" v-if="musicFiles.length">
    <div class="row justify-between controls">
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

    <div
      class="row center player column"
      @mousedown="enterMusicTrack = true"
      @mouseleave="enterMusicTrack = false"
      @mouseup="enterMusicTrack = false"
    >
      <div class="title">{{ musicFiles[currentMusicIndex].name }}</div>
      <div
        class="progress"
        ref="progress"
        :currentTime="currentTime | secondsToHms"
        :duration="duration | secondsToHms"
        @click="changeDuration($event, $refs.progress)"
        @mousemove="
          enterMusicTrack ? changeDuration($event, $refs.progress) : false
        "
      >
        <div class="track-container">
          <div
            :class="{ 'track-flow': true, 'transition-flow': !enterMusicTrack }"
            :style="{
              width: (currentTime / duration) * 100 + '%',
            }"
          />
        </div>
      </div>
      <div class="row justify-around" style="padding-top: 6px">
        <div :class="{ shuffle: true, active: shuffle }" @click="shuffleAll()">
          <Shuffle />
        </div>

        <div class="volume-container">
          <Volume
            :class="{
              [`layer-${Math.ceil((currentVolume * 100) / 33.3)}`]: true,
            }"
            @click="changeVolume($event, $refs.volume, true)"
          />
          <div
            class="volume"
            ref="volume"
            @mousedown="enterVolumeTrack = true"
            @mouseleave="enterVolumeTrack = false"
            @mouseup="enterVolumeTrack = false"
            @click="changeVolume($event, $refs.volume)"
            @mousemove="
              enterMusicTrack ? changeVolume($event, $refs.volume) : false
            "
          >
            <div class="track-container">
              <div
                :class="{
                  'track-flow': true,
                  'transition-flow': !enterVolumeTrack,
                }"
                :style="{
                  width: Math.round(currentVolume * 100) + '%',
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Next from '../assets/icons/next.svg'
import Previous from '../assets/icons/previous.svg'
import Pause from '../assets/icons/pause.svg'
import Play from '../assets/icons/play.svg'
import Volume from '../assets/icons/volume.svg'
import Shuffle from '../assets/icons/shuffle.svg'

const Music = new Audio()
export default {
  components: {
    Next,
    Previous,
    Pause,
    Play,
    Volume,
    Shuffle
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
      duration: 0,
      currentVolume: 1,
      interval: null,
      shuffle: false,
      enterMusicTrack: false,
      enterVolumeTrack: false
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
      if (this.state === 'pause') {
        this.state = 'playing'
        Music.play()
        this.interval = setInterval(() => {
          this.currentTime = Music.currentTime
          this.duration = Music.duration
        }, 1000)
      } else if (this.state === 'playing') {
        this.state = 'pause'
        Music.pause()
        clearInterval(this.interval)
      }
    },
    prev () {
      const index = this.currentMusicIndex - 1
      if (index >= 0) {
        this.$emit('change-music-index', index)
      }
    },
    next () {
      let index

      if (this.shuffle) {
        index = Math.floor(Math.random() * this.musicFiles.length)
        this.$emit('change-music-index', index)
      } else {
        index = this.currentMusicIndex + 1
        if (index < this.musicFiles.length) {
          this.$emit('change-music-index', index)
        }
      }
    },
    changeDuration (e, progressDOM) {
      const currentTime =
        Music.duration * (e.layerX / progressDOM.clientWidth) + 3

      if (currentTime < 0) {
        // duration below 0
        Music.currentTime = 0
        this.currentTime = 0
      } else if (Music.duration < currentTime) {
        // limit exceed duration
        Music.currentTime = this.duration
        this.currentTime = this.duration
      } else {
        Music.currentTime = currentTime
        this.currentTime = currentTime
      }
    },
    changeVolume (e, volumeDOM, auto) {
      if (auto) {
        if (Music.volume < 0.33) {
          Music.volume = 1
        } else {
          if (this.currentVolume - 0.33 > 0) {
            Music.volume = Music.volume - 0.33
          } else {
            Music.volume = 0
          }
        }

        this.currentVolume = Math.round(Music.volume * 10) / 10
      } else {
        let currentVolume = Number((e.layerX + 3) / volumeDOM.clientWidth)
        if (currentVolume > 1) currentVolume = 1
        else if (currentVolume < 0) currentVolume = 0

        Music.volume = currentVolume
        this.currentVolume = currentVolume
      }
    },
    audioController (newIndex, oldIndex) {
      Music.src = this.musicFiles[newIndex].path
      if (newIndex !== oldIndex || typeof oldIndex === 'undefined') {
        if (this.state === 'playing') {
          Music.play()
        } else Music.pause()
      }
    },
    shuffleAll () {
      this.shuffle = true
    }
  },
  watch: {
    currentMusicIndex (newIndex, oldIndex) {
      this.audioController(newIndex, oldIndex)
    }
  },
  mounted () {
    if (this.musicFiles.length) {
      this.audioController(this.currentMusicIndex)

      Music.addEventListener('loadeddata', () => {
        this.duration = Music.duration
        this.currentTime = Music.currentTime
      })
      // Music.addEventListener('play', () => {
      //   this.state = 'playing'
      // })
      // Music.addEventListener('playing', () => {
      //   this.state = 'playing'
      // })
      // Music.addEventListener('pause', () => {
      //   this.state = 'pause'
      // })
      Music.addEventListener('ended', () => {
        setTimeout(() => {
          this.next()
        }, 3000)
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.player-container
  position: fixed
  left: 0
  right: 0
  bottom: 0
  overflow: hidden
  padding: 16px 4px 8px 4px
  z-index: 1
  background-color: var(--color-black-100)
  display: flex
  justify-content: space-around
  flex-direction: column
  background-color: rgba(0,0,0,.6)
  -webkit-backdrop-filter: blur(8px)
  backdrop-filter: blur(8px)
  box-shadow: 0 -4px 20px #000
  border-top: 1px solid #333
  .controls
    width: 57.5%
    margin: 0 auto
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
      white-space: nowrap
      overflow-x: auto
      width: 90%
      color: var(--color-white-100)
    .progress, .volume
      display: flex
      align-items: center
      cursor: pointer
      position: relative
      padding: 10px 0
      &::before, &::after
        font-size: 10px
        color: white
        position: absolute
        pointer-events: none
      &::before
        left: -45px
        content: attr(currentTime)
      &::after
        right: -45px
        content: attr(duration)
      .track-container
        width: 100%
        height: 4px
        position: relative
        background-color: lighten(black, 20%)
        display: flex
        .track-flow
          background-color: $secondary
          height: 100%
          position: relative
          display: flex
          align-items: center
          &::after // pointer
            content: ""
            width: 8px
            height: 8px
            border-radius: 2px
            background-color: #fff
            border: 1px solid #eee
            cursor: pointer
            position: absolute
            display: block
            right: -2px
        .transition-flow
          transition: width .25s
    .progress
      width: 50%
      &:hover .track-flow
        background-color: #fafafa
    .volume-container
      display: flex
      align-items: center
      position: relative
      .volume
        width: 120px
        display: flex
        &:hover .track-flow
          background-color: #fafafa
      svg
        cursor: pointer
        position: absolute
        left: -35px
        width: 20px
        height: 20px
        fill: white
        &.layer-0
          .layer-1, .layer-2, .layer-3
            display: none
        &.layer-1
          .layer-2, .layer-3
            display: none
        &.layer-2
          .layer-3
            display: none
    .shuffle
      cursor: pointer
      opacity: .5
      transition: opacity .5s ease
      &.active
        opacity: 1
      svg
        width: 25px
        height: 25px
        fill: white
</style>
