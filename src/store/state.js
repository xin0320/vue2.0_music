import {playMode} from 'common/js/config'

const state = {
    singer: {},
    playing: false, // 播放状态
    fullScreen: false, // 全屏
    playlist: [], // 播放器后退会出现播放列表
    sequenceList: [], // 是否顺序播放
    mode: playMode.sequence, // 默认为顺序播放
    currentIndex: -1 // 当前播放的歌曲，前进后退播放修改currentIndex
}

export default state