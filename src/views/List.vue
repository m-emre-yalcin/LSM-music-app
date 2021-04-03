<template>
  <div class="music-list-container">
    <div class="music-list-header row justify-between">
      <div
        class="btn menu"
        :class="{ active: leftMenu }"
        @click="openLeftMenu()"
      >
        <Menu />
      </div>

      <input type="search" v-model="searchText" placeholder="Search your library">
    </div>

    <div :class="{ 'music-left-menu': true, active: leftMenu }">
      <div class="top-group">
        <div class="item" name="Stats">
          <Stats/>
        </div>
      </div>

      <div class="bottom-group">
        <router-link class="item" name="Settings" to="/settings">
          <Settings/>
        </router-link>
      </div>
    </div>

    <transition-group
      tag="div"
      class="music-list"
      name="staggered-fade"
      :css="false"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <div
        :class="{ item: true, active: music.id == musicFiles[currentMusicIndex].id }"
        v-for="(music, i) in searchText ? musicFiles.filter(music=>music.name.toLowerCase().includes(searchText.toLowerCase())) : musicFiles"
        :key="music.id"
        @click="currentMusicIndex = musicFiles.findIndex((msc)=>msc.id == music.id)"
      >
        <div class="column">{{ i + 1 }}</div>
        <div class="column">{{ music.name }}</div>
      </div>
    </transition-group>

    <Music-Player
      v-if="musicFiles.length"
      :musicFiles="musicFiles"
      :currentMusicIndex="currentMusicIndex"
      @change-music-index="currentMusicIndex = $event"
    />
  </div>
</template>

<script>
import { readdir } from 'fs'
import { join } from 'path'
import Velocity from 'velocity-animate'

import MusicPlayer from '../components/music-player'
import Menu from '../assets/icons/menu.svg'
import Stats from '../assets/icons/stats.svg'
import Settings from '../assets/icons/settings.svg'

const UIAudio = new Audio()

export default {
  name: 'MusicList',
  components: {
    MusicPlayer,
    Menu,
    Stats,
    Settings
  },
  data () {
    return {
      musicDir: 'D:/Music/',
      musicFiles: [],
      currentMusicIndex: 0,
      leftMenu: false,
      searchText: null
    }
  },
  async mounted () {
    // get music files
    this.musicFiles = await this.$db.musicFiles.toArray()

    if (this.musicFiles.length === 0) {
      readdir(join(this.musicDir), (err, files) => {
        if (err) throw err

        // filter mp3 files
        files = files
          .filter((file) => {
            const ext = file.substr(-3, 3)
            if (ext.includes('mp3')) {
              return true
            }
          })
          .map((file) => {
            return { path: this.musicDir + file, name: file }
          })

        // save music paths
        this.$db.transaction('rw', this.$db.musicFiles, async () => {
          await this.$db.musicFiles.bulkAdd(files)
        })

        this.musicFiles = files
      })
    }
  },
  methods: {
    openLeftMenu () {
      this.leftMenu = !this.leftMenu
      const audio = require('../assets/audio/slide.mp3')
      UIAudio.src = audio

      if (this.leftMenu) {
        UIAudio.play()
      }
    },
    beforeEnter (el) {
      el.style.opacity = 0
      el.style.height = 0
    },
    enter (el, done) {
      const delay = el.dataset.index * 150
      setTimeout(function () {
        Velocity(el, { opacity: 1, height: '30px' }, { complete: done })
      }, delay)
    },
    leave (el, done) {
      const delay = el.dataset.index * 150
      setTimeout(function () {
        Velocity(el, { opacity: 0, height: 0 }, { complete: done })
      }, delay)
    }
  }
}
</script>

<style lang="sass" scoped>
$music-list-header-height: 50px
$music-player-height: 138px

.music-list-container
  float: left
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
    background-color: rgba(0,0,0,.6)
    -webkit-backdrop-filter: blur(8px)
    backdrop-filter: blur(8px)
    box-shadow: 0 4px 20px #000
    border-bottom: 1px solid #333
    .btn
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
    bottom: $music-player-height
    transition: left .2s $cubic-bezier-1
    z-index: 2
    top: $music-list-header-height + 30px
    width: 50px
    background-color: rgba(0,0,0,.6)
    -webkit-backdrop-filter: blur(8px)
    backdrop-filter: blur(8px)
    box-shadow: 4px 0 20px #000
    border-right: 1px solid #333
    display: flex
    flex-direction: column
    justify-content: space-between
    &.active
      left: 0
    .item
      cursor: pointer
      svg
        width: 20px
        height: 20px
        fill: white
    .item.active
      svg
        fill: $secondary
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
        &:hover::after
          pointer-events: visibleFill
          opacity: 1
        &:hover::after:hover
          opacity: 0
  .music-list
    -webkit-overflow-scrolling: touch
    display: flex
    flex-direction: column
    overflow-y: overlay
    overflow-x: hidden
    position: fixed
    top: 30px
    bottom: 0
    left: 0
    right: -30px
    padding-top: $music-list-header-height
    padding-bottom: $music-player-height
    transition: padding .2s $cubic-bezier-1
    .item
      padding: 8px
      display: flex
      align-items: center
      text-align: left
      border-bottom: 1px solid rgba(255,255,255,.1)
      color: #fff
      font-size: 12px
      &:nth-child(2n)
        background-color: #000000
      &:nth-child(2n+1)
        background-color: #101010
      &:hover
        background-color: #fefefe
        color: #666
        cursor: pointer
      .column
        padding: 4px
        // white-space: nowrap
    .item.active
      background-color: $secondary
      color: #fff
  .music-left-menu.active + .music-list
    padding-left: 50px
</style>
