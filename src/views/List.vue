<template>
  <div class="group">
    <header class="fixed main-glass">
      <div class="column-header" @click="sortBy('size')">Size</div>
      <div class="column-header">Name</div>
    </header>
    <transition-group
      tag="div"
      class="music-list"
      name="staggered-fade"
      :css="false"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
      v-if="$store.state.musicFiles.length"
    >
      <div
        :class="{
          item: true,
          active:
            music.id ==
            $store.state.musicFiles[$store.state.currentMusicIndex].id,
        }"
        v-for="music in $store.state.searchText
          ? $store.state.musicFiles.filter((music) =>
              music.name
                .toLowerCase()
                .includes($store.state.searchText.toLowerCase())
            )
          : $store.state.musicFiles"
        :key="music.id"
        @click="
          () => {
            if (
              music.id ==
              $store.state.musicFiles[$store.state.currentMusicIndex].id
            ) {
              $store.commit('change-music-state');
            } else {
              $store.commit(
                'change-music-index',
                $store.state.musicFiles.findIndex((msc) => msc.id == music.id)
              );
            }
          }
        "
        @dblclick="
          () => {
            if (
              music.id !=
              $store.state.musicFiles[$store.state.currentMusicIndex].id
            ) {
              $store.commit('change-music-state');
            }
          }
        "
      >
        <div class="column">
          {{ Math.floor(music.fileStats.size / (1024 * 1000)) + " Mb" }}
        </div>
        <div class="column">{{ music.name }}</div>
      </div>
    </transition-group>

    <div v-else class="group music-list">
      There is no music in your list. Go to the
      <router-link to="/settings">Settings</router-link> for import some...
    </div>
  </div>
</template>

<script>
import Velocity from 'velocity-animate'
export default {
  data () {
    return {
      sorted: 'desc'
    }
  },
  methods: {
    sortBy (column) {
      if (this.sorted === 'asc') {
        this.$store.state.musicFiles = this.$store.state.musicFiles.sort(
          (a, b) => a.fileStats[column] - b.fileStats[column]
        )
        this.sorted = 'desc'
      } else if (this.sorted === 'desc') {
        this.$store.state.musicFiles = this.$store.state.musicFiles.sort(
          (a, b) => b.fileStats[column] - a.fileStats[column]
        )
        this.sorted = 'asc'
      }
      this.$store.commit('next-state')
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
  },
  mounted () {
    const interval = setInterval(() => {
      if (document.querySelector('.music-list')) {
        document.querySelector('.music-list').scrollTop =
          this.$store.state.currentMusicIndex * 39
        clearInterval(interval)
      }
    }, 100)
  }
}
</script>

<style lang="sass" scoped>
header
  width: 100%
  height: 20px
  display: flex
  align-items: center
  &.fixed
    top: $music-list-header-height + 30
    position: fixed
  .column-header
    padding: 2px 10px
    font-size: 14px
    cursor: pointer
    color: lighten($secondary, 20%)
    &:hover
      color: #fff
.music-list
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
      white-space: nowrap
  .item.active
    // background-color: $secondary
    background-image: radial-gradient( circle 1192px at 21.5% 49.5%, rgba(91,21,55,1) 0.1%, rgba(0,0,0,1) 100.2% )
    color: #fff
</style>
