<template>
  <div class="music-list-container">
    <div class="list">
      <div :class="{ item: true, active: i==currentMusic.index }" v-for="(music, i) in musicFiles" :key="i" @click="playMusic(i)">
        <div class="column">{{ i+1 }}</div>
        <div class="column">{{ music.name }}</div>
      </div>
    </div>

    <Music-Player
      v-if="musicFiles.length"
      :currentMusic="currentMusic"
      @change-music-state="({index, playing}) => playMusic(index, playing)"
    />
  </div>
</template>

<script>
import { readdir } from 'fs'
import { join } from 'path'

import MusicPlayer from '../components/music-player'
export default {
  name: 'MusicList',
  components: {
    MusicPlayer
  },
  data () {
    return {
      musicDir: 'D:/Music/',
      musicFiles: [],
      currentMusic: {
        index: 0,
        name: null,
        path: null,
        playing: false,
        maxDuration: 422,
        curDuration: 322
        // audio,
      }
    }
  },
  methods: {
    playMusic (index, playing) {
      if (typeof index !== 'undefined') this.$set(this.currentMusic, 'index', index)
      if (typeof playing !== 'undefined') this.$set(this.currentMusic, 'playing', playing)
      if (typeof this.musicFiles[index] !== 'undefined') {
        this.$set(this.currentMusic, 'path', this.musicFiles[index].path)
        this.$set(this.currentMusic, 'name', this.musicFiles[index].name)
      }
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
    } else {
      // set first music
      this.currentMusic.name = this.musicFiles[this.currentMusic.index].name
      this.currentMusic.path = this.musicFiles[this.currentMusic.index].path
    }
  }
}
</script>

<style lang="sass" scoped>
.music-list-container
  position: relative
  .list
    padding-bottom: 94px
    -webkit-overflow-scrolling: touch
    display: flex
    flex-direction: column
    scroll-snap-type: both mandatory
    .item
      scroll-snap-align: start
      padding: 8px 4px
      text-align: left
      display: flex
      align-items: center
      height: 40px
      color: #999
      background-color: #fff
      border-top: 1px solid #eee
      border-bottom: 1px solid #eee
      &:hover
        background-color: #fafafa
        color: #666
        cursor: pointer
      .column
        padding: 4px
    .item.active
      background-color: #000
      color: #fff
      border-top: 1px solid #aaa
      border-bottom: 1px solid #aaa
</style>
