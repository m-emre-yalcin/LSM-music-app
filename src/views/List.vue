<template>
  <div class="music-list-container">
    <div class="list">
      <div class="item" v-for="(music, i) in musicFiles" :key="i">
        {{ music }}
      </div>
    </div>

    <div class="player-container" v-if="musicFiles.length">
      <!-- <audio :src="'D:/Music/' + musicFiles[currentMusic.index].name" controls></audio> -->

      <div class="row justify-around">
        <span class="btn prev" @click="prev(currentMusic)">
          <Previous width="20" class="light" />
        </span>
        <span class="btn stop" @click="play(currentMusic)">
          <Play width="20" class="light" />
        </span>
        <span class="btn next" @click="next(currentMusic)">
          <Next width="20" class="light" />
        </span>
      </div>

      <div class="row center player column">
        <div class="title">{{ currentMusic.name() }}</div>
        <progress :value="currentMusic.state" :max="currentMusic.maxDuration"></progress>
      </div>
    </div>
  </div>
</template>

<script>
import { readdir } from 'fs'
import { join } from 'path'

import Next from '../assets/icons/next.svg'
import Previous from '../assets/icons/previous.svg'
// import Pause from '../assets/icons/pause.svg'
import Play from '../assets/icons/play.svg'
export default {
  name: 'MusicList',
  components: {
    Next,
    Previous,
    // Pause,
    Play
  },
  data () {
    return {
      musicDir: 'D:/Music/',
      musicFiles: [],
      currentMusic: {
        index: 0,
        playing: false,
        name: () => this.musicFiles[this.currentMusic.index].name,
        maxDuration: 400,
        state: 253
      }
    }
  },
  methods: {
    play (currentMusic) {
      new Audio(this.musicFiles[currentMusic.index].path).play()
    },
    prev (currentMusic) {
      if (currentMusic.index > 0) {
        currentMusic.index--
      }
    },
    next (currentMusic) {
      currentMusic.index++
    }
  },
  async mounted () {
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
  }
}
</script>

<style lang="sass" scoped>
.music-list-container
  position: relative
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
