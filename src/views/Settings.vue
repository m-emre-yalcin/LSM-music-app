<template>
  <div class="settings">
    <h1>
      <Settings />
      <span>Settings</span>
    </h1>
    <div class="group">
      <h2>
        <Directory />
        <span>Library Paths</span>
      </h2>
      <div class="body">
        <div
          :class="{ 'path-box': true, active: dir.active }"
          v-for="dir in $store.state.musicDirectories"
          :key="dir.id"
          @click="changeActivePath(dir)"
          :title="dir.path"
        >
          <span>{{
            dir.path.length > 40
              ? dir.path.slice(0, 15) + "..." + dir.path.slice(-10)
              : dir.path
          }}</span>

          <div
            class="checkbox"
            :title="dir.active ? 'Deactive this path' : 'Activate this path'"
          >
            <Tick v-if="dir.active" />
          </div>
          <div
            class="delete"
            v-if="!dir.active"
            @click.stop="removeDirectory(dir.id)"
            title="Remove this path"
          >
            <Cancel />
          </div>
        </div>
        <div
          class="path-box add-new"
          title="Add new directory"
          v-text="'+'"
          @click.stop.prevent="addNewDirectory()"
        />
      </div>
    </div>

    <div class="group">
      <h2>
        <Theme />
        <span>Theme Preferences</span>
      </h2>

      <div class="body">
        <div class="theme" v-for="(theme,i) in $store.state.themes" :key="i" :style="theme" @click="changeTheme(i)"/>
      </div>
    </div>

    <div class="group">
      <h2>
        <Storage />
        <span>Clear Storage</span>
      </h2>
      <div class="btn clear" @click="clearStorage()">Clear</div>
    </div>
  </div>
</template>

<script>
import Settings from '../assets/icons/settings.svg'
import Theme from '../assets/icons/theme.svg'
import Directory from '../assets/icons/directory.svg'
import Tick from '../assets/icons/tick.svg'
import Cancel from '../assets/icons/cancel.svg'
import Storage from '../assets/icons/database.svg'

// will be moved to background server
import { readdir } from 'fs'
import { join } from 'path'

import { ipcRenderer } from 'electron'
export default {
  components: {
    Settings,
    Directory,
    Tick,
    Theme,
    Cancel,
    Storage
  },
  methods: {
    async addNewDirectory () {
      ipcRenderer.send('select-directory')
    },
    async addMusicDirAndLoadMusic (dir) {
      console.log('directory id:', dir.id, 'addMusicDirAndLoadMusic')
      if (
        this.$store.state.musicDirectories.filter(
          (Dir) => Dir.path === dir.path
        ).length === 0
      ) {
        if (dir.active) {
          readdir(dir.path, async (err, files) => {
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
                return {
                  path: join(dir.path, file),
                  name: file,
                  dir: dir.id
                }
              })
            console.log(files.length, 'dosya yükleniyor')

            // save music paths
            await this.$db.musicFiles.bulkAdd(files)
            await this.$store.state.musicDirectories.push(dir)
            await this.$store.commit('load-active-directories')
            await this.$store.commit('load-first-music')
            window.location.reload(true)
          })
        }
      }
    },
    async removeDirectory (dirId) {
      if (confirm('All your stats in this path will be gone')) {
        const dirIndex = this.$store.state.musicDirectories.findIndex(
          (dir) => dir.id === dirId
        )
        await this.$store.state.musicDirectories.splice(dirIndex, 1)
        await this.$db.musicDirectories.delete(dirId)

        await this.$db.musicFiles.bulkDelete(
          await this.$db.musicFiles.where('dir').equals(dirId).primaryKeys()
        )
        this.$store.commit('load-active-directories')
        this.$store.commit('load-first-music')
      }
    },
    async changeActivePath (dir) {
      dir.active = !dir.active
      this.$db.musicDirectories.update(dir.id, { active: dir.active })
      this.$store.commit('load-active-directories')
    },
    async clearStorage () {
      if (confirm('Are you sure you want to clear all of your data?')) {
        // await this.$db.musicDirectories.clear()
        // await this.$db.musicFiles.clear()
        this.$db.delete()
        this.$store.state.musicFiles = []
        this.$store.state.musicDirectories = []
        localStorage.clear()
        window.location.reload(true)
      }
    },
    changeTheme (preference) {
      document.querySelectorAll('.main-glass').forEach((dom) => {
        dom.style = this.$store.state.themes[preference]
        localStorage.setItem('theme', preference)
      })
    }
  },
  mounted () {
    ipcRenderer.on('get-directory', async (event, arg) => {
      if (arg) {
        // arg = directory
        var Dir = {
          path: arg,
          active: true
        }
        if (
          (await this.$db.musicDirectories
            .where('path')
            .equals(arg)
            .count()) === 0
        ) {
          // check if exists
          Dir.id = await this.$db.musicDirectories.add(Dir) // last id
          await this.addMusicDirAndLoadMusic(Dir)
        } else {
          alert('This directory already exists!')
        }
      }
    })
  }
}
</script>

<style lang="sass" scoped>
.body
  display: grid
  gap: 8px
  grid-template-columns: repeat(auto-fill, 200px)
  .path-box
    width: 200px
    height: 80px
    border: 1px solid #eee
    display: flex
    align-items: center
    justify-content: center
    font-size: 14px
    position: relative
    box-sizing: border-box
    padding: 30px 4px 4px 4px
    &.active
      background-color: #fff
      color: #000
      border: 1px solid #aaa
      div > svg
        fill: #000
    &.add-new
      cursor: pointer
      padding: 0 0 .5rem 0
      font-size: xxx-large
      &:hover
        background-color: rgba(255,255,255,.1)
    .checkbox, .delete
      cursor: pointer
      width: 20px
      height: 20px
      position: absolute
      display: flex
      align-items: center
      justify-content: center
      svg
        fill: #fff
        width: 14px
        height: 14px
    .checkbox
      right: 8px
      top: 8px
      border: 1px solid #fff
    .delete
      top: 8px
      left: 8px
  .theme
    cursor: pointer
    width: auto
    height: 50px
    margin: 8px
    border-radius: 4px
    box-shadow: 0 0 10px black
.btn.clear
  border-radius: 4px
  border: 1px solid #fff
  text-align: center
  padding: 4px 8px
  font-size: 12px
  width: 100px
  margin: 10px 30px
  cursor: pointer
</style>
