import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    musicDirectories: [],
    musicFiles: [],
    Music: new Audio(),
    musicState: 'pause',
    currentMusicIndex: Number(localStorage.getItem('music-index')) || 0,
    leftMenu: false,
    searchText: null,
    themes: [
      'background-color: rgba(0,0,0,.6); background-image: none;',
      'background-color: rgba(255,0,0,.6); background-image: none;',
      'background-color: rgba(0,255,0,.6); background-image: none;',
      'background-color: rgba(0,0,255,.6); background-image: none;',
      'background-color: background-color: rgba(255,255,255,.6); background-image: radial-gradient( circle 1192px at 21.5% 49.5%,  rgba(91,21,55,.8) 0.1%, rgba(0,0,0,.1) 100.2% );',
      'background-color: #4158D0;background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);',
      'background-color: #0093E9;background-image: linear-gradient(160deg, #0093E9 0%, #80D0C7 100%);',
      'background-color: #0093E9;background-image: linear-gradient(160deg, #0093E9 0%, #80D0C7 100%);',
      'background-color: #85FFBD;background-image: linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%);',
      'background-color: #85FFBD;background-image: linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%);',
      'background-image: linear-gradient( 68.2deg,  rgba(255,202,88,1) 0%, rgba(139,73,255,1) 100.2% );',
      'background-image: linear-gradient( 178.2deg,  rgba(118,8,23,1) 10.9%, rgba(158,12,33,1) 62.6% );',
      'background-image: radial-gradient( circle 602px at 2.1% 5.1%,  rgba(233,0,120,1) 0%, rgba(0,0,0,1) 90.1% );',
      'background-image: radial-gradient( circle 732px at -23.9% -25.1%,  rgba(30,39,107,1) 6.1%, rgba(188,104,142,1) 100.2% );',
      'background-image: linear-gradient( 181deg,  rgba(225,109,245,1) 6.9%, rgba(78,248,231,1) 112.8% );',
      'background-image: linear-gradient( 65.9deg,  rgba(85,228,224,1) 5.5%, rgba(75,68,224,0.74) 54.2%, rgba(64,198,238,1) 55.2%, rgba(177,36,224,1) 98.4% );',
      'background-image: linear-gradient( 293.5deg,  rgba(181,149,208,1) 3.2%, rgba(251,148,207,1) 9.9%, rgba(181,149,208,1) 22.9%, rgba(251,148,207,1) 36.4%, rgba(181,149,208,1) 50.1%, rgba(251,148,207,1) 61.1%, rgba(181,149,208,1) 71.2%, rgba(251,148,207,1) 84.2%, rgba(181,149,208,1) 92.2% );',
      'background-image: linear-gradient( 76.3deg,  rgba(44,62,78,1) 12.6%, rgba(69,103,131,1) 82.8% );',
      'background-image: linear-gradient( 94.3deg,  rgba(26,33,64,1) 10.9%, rgba(81,84,115,1) 87.1% );',
      'background-image: linear-gradient( 110.3deg,  rgba(73,93,109,1) 4.3%, rgba(49,55,82,1) 96.7% );',
      'background-image: linear-gradient( 76.9deg,  rgba(255,90,90,1) 27.2%, rgba(130,5,255,1) 79.9% );',
      'background-image: linear-gradient( 111.6deg,  rgba(174,68,223,1) 27.3%, rgba(246,135,135,1) 112.7% );',
      'background-image: linear-gradient( 135.9deg,  rgba(109,25,252,1) 16.4%, rgba(125,31,165,1) 56.1% );',
      'background-image: linear-gradient( 89.8deg,  rgba(204,156,223,1) 0.3%, rgba(155,219,245,1) 20.4%, rgba(245,183,208,1) 40.2%, rgba(250,186,98,1) 62.9%, rgba(234,238,240,1) 81.9%, rgba(250,245,171,1) 99.2% );'
    ]
  },
  mutations: {
    'change-music-index'(state, index) {
      if (index >= 0 && index < state.musicFiles.length) {
        state.currentMusicIndex = index
        state.Music.src = state.musicFiles[state.currentMusicIndex].path

        localStorage.setItem('music-index', index)

        if (state.musicState === 'playing') state.Music.play()
      }
    },
    'change-music-state'(state, newState) {
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
    'load-first-music'(state) {
      if (state.musicFiles.length) {
        let musicIndexFromPrevSession = Number(localStorage.getItem('music-index')) || 0
        let musicTimeFromPrevSession = Number(localStorage.getItem('music-time')) || 0
        const musicVolumeFromPrevSession = Number(localStorage.getItem('music-volume')) || 1
        if (typeof state.musicFiles[musicIndexFromPrevSession] === 'undefined') {
          musicIndexFromPrevSession = 0
          musicTimeFromPrevSession = 0
          localStorage.setItem('music-index', 0)
          localStorage.setItem('music-time', 0)
        }

        state.currentMusicIndex = musicIndexFromPrevSession
        state.Music.src = state.musicFiles[musicIndexFromPrevSession].path
        state.Music.currentTime = musicTimeFromPrevSession
        state.Music.volume = musicVolumeFromPrevSession
      } else {
        console.log('there is no music to load')
      }
    },
    async 'load-active-directories'(state) {
      const activeDirs = state.musicDirectories
        .filter((dir) => dir.active)
        .map((dir) => dir.id)

      state.musicFiles = await this._vm.$db.musicFiles
        .where('dir')
        .anyOf(activeDirs)
        .toArray()
    },
    'next-state'(state) { }
  },
  actions: {
  },
  modules: {

  }
})
