<template>
  <div class="settings">
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
        <div
          class="theme"
          v-for="(theme, i) in $store.state.themes"
          :key="i"
          :style="theme"
          @click="changeTheme(i)"
        />
      </div>
    </div>

    <div class="group">
      <h2>
        <Storage />
        <span>Storage</span>
      </h2>
      <div class="btn clear" @click="clearStorage()">Clear</div>
      <div class="btn clear">Export</div>
    </div>
  </div>
</template>

<script>
import Theme from "../assets/icons/theme.svg";
import Directory from "../assets/icons/directory.svg";
import Tick from "../assets/icons/tick.svg";
import Cancel from "../assets/icons/cancel.svg";
import Storage from "../assets/icons/database.svg";

// will be moved to background server
import { readdir, promises } from "fs";
import { join, extname } from "path";

import { ipcRenderer } from "electron";
export default {
  components: {
    Directory,
    Tick,
    Theme,
    Cancel,
    Storage,
  },
  methods: {
    async addNewDirectory() {
      ipcRenderer.send("select-directory");
    },
    async addMusicDirAndLoadMusic(dir) {
      dir.id = await this.$db.musicDirectories.add(dir); // last id
      this.$store.state.musicDirectories.push(dir);

      if (
        (await this.$db.musicDirectories
          .where("path")
          .equals(dir.path)
          .count()) === 1
      ) {
        if (dir.active) {
          const musicFiles = [];
          readdir(dir.path, async (err, files) => {
            if (err) throw err;

            files // file names
              .filter((file) => extname(file) === ".mp3")
              .map((file) => {
                file = {
                  // convert file names into file object
                  path: join(dir.path, file),
                  name: file,
                  dir: dir.id,
                };
                musicFiles.push(file);
              });
            console.log(musicFiles);

            await Promise.all(
              musicFiles.map(async (file, i) => {
                musicFiles[i].fileStats = await promises.stat(file.path);
                return file;
              })
            );

            console.log(musicFiles.length);
            await this.$db.musicFiles.bulkAdd(musicFiles);
            await this.$store.commit("load-active-directories");
            await this.$store.commit("load-first-music");
            // window.location.reload(true)
          });
        }
      } else {
        alert("This directory already exists!");
      }
    },
    async removeDirectory(dirId) {
      if (confirm("All your stats in this path will be gone")) {
        const dirIndex = this.$store.state.musicDirectories.findIndex(
          (dir) => dir.id === dirId
        );
        await this.$store.state.musicDirectories.splice(dirIndex, 1);
        await this.$db.musicDirectories.delete(dirId);

        await this.$db.musicFiles.bulkDelete(
          await this.$db.musicFiles.where("dir").equals(dirId).primaryKeys()
        );
        this.$store.commit("load-active-directories");
        this.$store.commit("load-first-music");
      }
    },
    async changeActivePath(dir) {
      dir.active = !dir.active;
      this.$db.musicDirectories.update(dir.id, { active: dir.active });
      this.$store.commit("load-active-directories");
    },
    async clearStorage(dontask = false) {
      if (
        dontask ||
        confirm("Are you sure you want to clear all of your data?")
      ) {
        // await this.$db.musicDirectories.clear()
        // await this.$db.musicFiles.clear()
        this.$db.delete();
        this.$store.state.musicFiles = [];
        this.$store.state.musicDirectories = [];
        localStorage.clear();
        window.location.reload(true);
      }
    },
    changeTheme(preference) {
      document.querySelectorAll(".main-glass").forEach((dom) => {
        dom.style = this.$store.state.themes[preference];
        localStorage.setItem("theme", preference);
      });
    },
  },
  mounted() {
    ipcRenderer.on("get-directory", async (event, arg) => {
      if (arg) {
        // arg = directory
        const dir = {
          path: arg,
          active: true,
        };
        await this.addMusicDirAndLoadMusic(dir);
      }
    });

    ipcRenderer.on("clearstore", () => {
      this.clearStorage(true);
    });
  },
};
</script>

<style lang="scss" scoped>
.body {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, 200px);
  .path-box {
    width: 200px;
    height: 80px;
    border: 1px solid #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    position: relative;
    box-sizing: border-box;
    padding: 30px 4px 4px 4px;
    &.active {
      background-color: #fff;
      color: #000;
      border: 1px solid #aaa;
      div > svg {
        fill: #000;
      }
    }
    &.add-new {
      cursor: pointer;
      padding: 0 0 0.5rem 0;
      font-size: xxx-large;
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
    .checkbox,
    .delete {
      cursor: pointer;
      width: 20px;
      height: 20px;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  svg {
    fill: #fff;
    width: 14px;
    height: 14px;
  }
  .checkbox {
    right: 8px;
    top: 8px;
    border: 1px solid #fff;
  }
  .delete {
    top: 8px;
    left: 8px;
  }
  .theme {
    cursor: pointer;
    width: auto;
    height: 50px;
    margin: 8px;
    border-radius: 4px;
    box-shadow: 0 0 10px black;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
.btn.clear {
  border-radius: 4px;
  border: 1px solid #fff;
  text-align: center;
  padding: 4px 8px;
  font-size: 12px;
  width: 100px;
  margin: 10px 30px;
  cursor: pointer;
}
</style>
