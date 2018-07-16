export const singer = state => state.singer // 使用getter取到组件里的数据

export const playing = state => state.playing 

export const fullScreen = state => state.fullScreen 

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => { // 可以担任计算属性
    return state.playlist[state.currentIndex] || {}
}
