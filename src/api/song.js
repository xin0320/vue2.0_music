import {commonParams} from './config'
import axios from 'axios'
export function getLyric(mid) { // 传递一个歌曲的id
    const url = '/api/lyric' // 后端的代理地址

    const data = Object.assign({}, commonParams, {
        songmid: mid,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        g_tk: 254191688,
        pcachetime: +new Date(), // 当前的时间戳
        format: 'json' // 不是jsonp，是json 
    })
    return axios.get(url, {
        params: data // 参数通过params传进去
    }).then((res) => { // 拿到response,，放入promise中
        return Promise.resolve(res.data)
    })
}