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
          @click="
            dir.active = !dir.active;
            $db.musicDirectories.update(dir.id, { active: dir.active });
          "
          :title="dir.path"
        >
          <span>{{
            dir.path.length > 40
              ? dir.path.slice(0, 15) + "..." + dir.path.slice(-10)
              : dir.path
          }}</span>

          <div class="checkbox">
            <Tick v-if="dir.active" />
          </div>
        </div>
        <div
          class="path-box add-new"
          title="Add new directory"
          v-text="'+'"
          @click="addNewDirectory()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Settings from '../assets/icons/settings.svg'
import Directory from '../assets/icons/directory.svg'
import Tick from '../assets/icons/tick.svg'

// will be moved to background server
import { readdir } from 'fs'
import { join } from 'path'

import { ipcRenderer } from 'electron'
export default {
  components: {
    Settings,
    Directory,
    Tick
  },
  // data () {
  //   return {
  //     musicDirectories: [
  //       {
  //         path: 'D:Music/',
  //         active: false
  //       }
  //     ]
  //   }
  // },
  methods: {
    async addNewDirectory () {
      ipcRenderer.send('select-directory')
    },
    updateMusicDirAndLoadMusic (dir) {
      if (dir.active) {
        readdir(
          join(dir.path),
          async (err, files) => {
            if (err) {
              console.log(err)
              throw err
            }

            // filter mp3 files
            files = files
              .filter((file) => {
                const ext = file.substr(-3, 3)
                if (ext.includes('mp3')) {
                  return true
                }
              })
              .map((file) => {
                return { path: join(dir.path, file), name: file, dir: dir.id }
              })
            console.log(files.length, 'dosya yükleniyor')

            // save music paths
            await this.$db.transaction('rw', this.$db.musicFiles, async () => {
              await this.$db.musicFiles.bulkAdd(files)
            })

            this.$store.commit('load-musics', await this.$db.musicFiles.toArray())
          },
          (err, files) => {
            if (err) throw err
            console.log('yükleme başarılı', files.length, 'dosya')
          }
        )
      } else {
        console.log('remove musics from this path')
      }
    }
  },
  mounted () {
    ipcRenderer.on('get-directory', async (event, arg) => {
      if (arg) {
        // arg = directory
        const item = {
          path: arg,
          active: true
        }
        if (
          this.$store.state.musicDirectories.filter(
            (dir) => dir.path === item.path
          ).length === 0
        ) {
          this.$db.musicDirectories.add(item).then(lastId => {
            item.id = lastId

            this.$store.state.musicDirectories.push(item)
            this.updateMusicDirAndLoadMusic(item)
          })
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
    padding: 1rem 2rem 1rem .25rem
    &.active
      background-color: #fff
      color: #000
      border: 1px solid #aaa
      .checkbox > svg
        fill: #000
    &.add-new
      cursor: pointer
      padding: 0 0 .5rem 0
      font-size: xxx-large
      &:hover
        background-color: rgba(255,255,255,.1)
    .checkbox
      cursor: pointer
      width: 20px
      height: 20px
      position: absolute
      right: 8px
      top: 8px
      border: 1px solid #fff
      display: flex
      align-items: center
      justify-content: center
      svg
        fill: #fff
        width: 14px
        height: 14px
</style>
