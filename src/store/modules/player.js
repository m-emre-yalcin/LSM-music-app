export default {
  state: {
    value: 'my value'
  },
  getters: {
    value: state => {
      return state.value
    }
  },
  mutations: {
    'next-music-index'(state) {
      console.log()
    },
    'prev-music-index'(state) {

    }
  },
  actions: {
    updateValue({ commit }, payload) {
      commit('updateValue', payload)
    }
  }
}
