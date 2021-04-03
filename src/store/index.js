import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    musicDir: 'D:/Music/',
    musicFiles: [],
    Music: new Audio(),
    musicState: 'pause',
    currentMusicIndex: Number(localStorage.getItem('music-index')) || 0,
    leftMenu: false,
    searchText: null
  },
  mutations: {
    'change-music-index' (state, index) {
      state.currentMusicIndex = index
      state.Music.src = state.musicFiles[state.currentMusicIndex].path

      localStorage.setItem('music-index', index)

      if (state.musicState === 'playing') state.Music.play()
    },
    'change-music-state' (state, newState) {
      if (typeof newState === 'undefined') {
        if (state.musicState === 'playing') {
          newState = 'pause'
        } else if (state.musicState === 'pause') {
          newState = 'playing'
        }
      }

      if (state.musicState !== newState) {
        if (newState === 'playing') {
          setTimeout(() => {
            state.Music.play()
          }, 100)
        } else if (newState === 'pause') {
          setTimeout(() => {
            state.Music.pause()
          }, 100)
        }
      }

      state.musicState = newState
    },
    'load-first-music' (state) {
      const musicIndexFromPrevSession = Number(localStorage.getItem('music-index')) || 0
      const musicTimeFromPrevSession = Number(localStorage.getItem('music-time')) || 0
      const musicVolumeFromPrevSession = Number(localStorage.getItem('music-volume')) || 1
      state.currentMusicIndex = musicIndexFromPrevSession
      state.Music.src = state.musicFiles[musicIndexFromPrevSession].path
      state.Music.currentTime = musicTimeFromPrevSession
      state.Music.volume = musicVolumeFromPrevSession
    }
  },
  actions: {
  },
  modules: {
  }
})
