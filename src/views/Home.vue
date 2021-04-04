<template>
  <div class="music-list-container">
    <div class="music-list-header row justify-between main-glass">
      <div
        class="btn menu"
        :class="{ active: $store.state.leftMenu }"
        @click="openLeftMenu()"
      >
        <Menu />
      </div>

      <input
        type="search"
        v-model="$store.state.searchText"
        placeholder="Search library"
      />
    </div>

    <div
      :class="{
        'music-left-menu': true,
        'main-glass': true,
        'full-height': !$store.state.musicFiles.length,
        active: $store.state.leftMenu,
      }"
    >
      <div class="top-group">
        <router-link class="item" name="Music list" to="/list">
          <Disc :class="{ spin: $store.state.musicState === 'playing' }" />
        </router-link>
        <router-link class="item" name="Stats" to="/stats">
          <Stats />
        </router-link>
        <router-link class="item" name="Expand your music library" to="/youtube-mp3">
          <VideoPlayer />
        </router-link>
      </div>

      <div class="bottom-group">
        <router-link class="item" name="Settings" to="/settings">
          <Settings />
        </router-link>
      </div>
    </div>

    <!-- main view -->
    <router-view class="main-container" />

    <Music-Player v-if="$store.state.musicFiles.length" />
  </div>
</template>

<script>
import MusicPlayer from '../components/music-player'
import Menu from '../assets/icons/menu.svg'
import Disc from '../assets/icons/music-disc.svg'
import Stats from '../assets/icons/stats.svg'
import Settings from '../assets/icons/settings.svg'
import VideoPlayer from '../assets/icons/video-player.svg'

const UIAudio = new Audio()
UIAudio.volume = 0.25

export default {
  name: 'MusicList',
  components: {
    MusicPlayer,
    Menu,
    Disc,
    Stats,
    Settings,
    VideoPlayer
  },
  async mounted () {
    // get music directories
    this.$store.state.musicDirectories = await this.$db.musicDirectories.toArray()

    if (this.$store.state.musicDirectories.length === 0) {
      // go to settings
      if (this.$route.path !== '/settings') {
        this.$router.push({ path: 'settings' })
      }

      alert('You should select a library path before using the player.')
    } else {
      this.$store.commit('load-musics', await this.$db.musicFiles.toArray())
    }
  },
  methods: {
    openLeftMenu () {
      this.$store.state.leftMenu = !this.$store.state.leftMenu
      const audio = require('../assets/audio/slide.mp3')
      UIAudio.src = audio

      if (this.$store.state.leftMenu) {
        UIAudio.play()
      }
    }
  }
}
</script>

<style lang="sass">
.music-list-container
  overflow: hidden
  background-color: black
  position: absolute
  width: 100%
  height: 100%
  .music-list-header
    display: flex
    align-items: center
    position: fixed
    z-index: 1
    top: 30px
    left: 0
    right: 0
    height: $music-list-header-height
    color: #fff
    box-shadow: 0 4px 20px #000
    border-bottom: 1px solid #333
    [type=search]
      padding: 4px
      margin: 5px 8px
      font-size: 12px
      border-radius: 4px
      border: 1px solid transparent
      outline: 0
      &:focus
        border: 1px solid #ccc
    .btn
      display: flex
      justify-content: center
      align-items: center
      &.menu
        width: 50px
        height: 20px
        opacity: .8
        cursor: pointer
        transition: opacity .2s
        &.active, &:hover
          opacity: 1
        svg
          width: 20px
          height: 20px
          fill: white
  .music-left-menu
    position: fixed
    left: -50px
    bottom: $music-player-height - 1px
    top: $music-list-header-height + 30px
    z-index: 2
    transition: left .2s $cubic-bezier-1
    width: 50px
    border-right: 1px solid #333
    display: flex
    flex-direction: column
    justify-content: space-between
    &.full-height
      bottom: 0
    &::before
      content: ""
      height: 95%
      top: 2.5%
      width: 0
      right: 0
      box-shadow: 0 0 20px 4px #000
      position: absolute
    &.active
      left: 0
    .item
      cursor: pointer
      svg
        width: 20px
        height: 20px
        fill: white
        animation: spin-disc 2s infinite
        animation-timing-function: linear
        animation-play-state: paused
        &.spin
          animation-play-state: running
    .item.router-link-active
      svg
        // fill: $secondary
        fill: $yellow
    [class*=group]
      display: flex
      flex-direction: column
      .item
        position: relative
        margin: 0 auto
        padding: 15px 5px
        opacity: .8
        display: flex
        align-items: center
        &:hover
          opacity: 1
        &.active svg
          fill: $secondary
        &::after
          display: block
          content: attr(name)
          color: #fff
          background-color: lighten(black, 40%)
          border-radius: 4px
          padding: 4px 8px
          font-size: 12px
          opacity: 0
          pointer-events: none
          box-shadow: 0 0 12px #000
          transition: opacity .1s $cubic-bezier-1
          position: absolute
          left: 45px
          min-width: 30px
          max-width: auto
          white-space: nowrap
        &:hover::after
          pointer-events: visibleFill
          opacity: 1
        &:hover::after:hover
          opacity: 0
  .music-left-menu.active + .main-container
    padding-left: 50px
</style>
