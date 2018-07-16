import { getLyric } from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'

export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
 
  // 调用getLyric api接口
  getLyric() {
    // 已经有lyric的歌曲不必每次都执行获取歌词操作
    if (this.lyric) {
      return Promise.resolve(this.lyric) // 因为getLyric返回的是一个promise
    }
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric) // 获得歌词
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer), // 处理一首歌有两个歌手的情况
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval, // 歌曲的时长
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    // url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=32`
    // url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songid}.m4a?fromtag=38`
     // url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?guid=106795008&vkey=AE1D90F43963ABF97FAE0968D8581710AF21B640A32A93C45FF503192B6D352DCCE278E904C9FCC09D883B9AA30BEEDDBE7112C05DA7603D&fromtag=38`
    url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?guid=6925689185&vkey=FC8A2D541E751BD37E80AA099D4762196B6B7E9C26B8AFB70F25C16D30A73E39FC8E4597AFB47483D4747FB5774740FFCACEAE5288D188A3&fromtag=66`

  })
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
