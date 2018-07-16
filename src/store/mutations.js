import * as types from './mutation-types'

const mutations = { // mutation相关的修改方法
    [types.SET_SINGER](state, singer) { // 当前状态树的state，提交mutation时传的payload
        state.singer = singer
    },
    [types.SET_PLAYING_STATE](state, flag) { // boolean用flag来表示
        state.playing = flag
    },
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag
    },
    [types.SET_PLAYLIST](state, list) {
        state.playlist = list
    },
    [types.SET_SEQUENCE_LIST](state, list) {
        state.sequenceList = list
    },
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode
    },
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index
    }
}

export default mutations