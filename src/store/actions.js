import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import { shuffle } from 'common/js/util'

function findIndex (list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}
// commit方法和state属性，可以拿到state，第二个参数是一个payload，告知列表和索引
export const selectPlay = function ({commit, state}, {list, index}) {
    // 提交mutations,设置list，默认是顺序播放
    commit(types.SET_SEQUENCE_LIST, list) 
    // 点击随机播放之后，我们在歌手的歌曲列表中在重新点击一首歌，发现播放的是另一首歌，
    // 因为我们在点击歌曲列表的时候调用的是actions.js中的selectPlay，不是randomPlay，所以在selectPlay函数中做一个判断
    if (state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        // 顺序列表中的index对应到随机列表中的index是怎样的
        index = findIndex(randomList, list[index])
    } else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}
// randomPlay是不需要索引index的
export const randomPlay = function ({commit}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random) // 首先设置播放模式
    commit(types.SET_SEQUENCE_LIST, list)
    // 对顺序播放的列表进行重新洗牌
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0) // 从第一个开始播放就可以了
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}