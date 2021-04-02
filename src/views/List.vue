<template>
  <div class="music-list-container">
    <div class="music-list-header">
      <div
        class="btn menu"
        :class="{ active: leftMenu }"
        @click="openLeftMenu()"
      >
        <Menu />
      </div>
    </div>

    <div :class="{ 'music-left-menu': true, active: leftMenu }"></div>

    <div class="music-list">
      <div
        :class="{ item: true, active: i == currentMusicIndex }"
        v-for="(music, i) in musicFiles"
        :key="i"
        @click="currentMusicIndex = i"
      >
        <div class="column">{{ i + 1 }}</div>
        <div class="column">{{ music.name }}</div>
      </div>
    </div>

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

import MusicPlayer from '../components/music-player'
import Menu from '../assets/icons/menu.svg'

const UIAudio = new Audio()

export default {
  name: 'MusicList',
  components: {
    MusicPlayer,
    Menu
  },
  data () {
    return {
      musicDir: 'D:/Music/',
      musicFiles: [],
      currentMusicIndex: 0,
      leftMenu: false
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
    }
  }
}
</script>

<style lang="sass" scoped>
$music-list-header-height: 50px
$music-player-height: 123px

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
        height: 25px
        opacity: .8
        cursor: pointer
        transition: opacity .2s
        &.active, &:hover
          opacity: 1
        svg
          width: 25px
          height: 25px
          fill: white
  .music-left-menu
    position: fixed
    left: -50px
    transition: left .2s cubic-bezier(0.72, 0.11, 0.58, 0.39)
    z-index: 2
    top: $music-list-header-height + 30px
    bottom: $music-player-height
    width: 50px
    background-color: rgba(0,0,0,.6)
    -webkit-backdrop-filter: blur(8px)
    backdrop-filter: blur(8px)
    box-shadow: 4px 0 20px #000
    border-right: 1px solid #333
    &.active
      left: 0
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
    transition: padding .2s cubic-bezier(0.72, 0.11, 0.58, 0.39)
    .item
      padding: 8px 4px
      text-align: left
      display: flex
      align-items: center
      height: 40px
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
      background-color: #D7276F
      color: #fff
  .music-left-menu.active + .music-list
    padding-left: 50px
</style>
