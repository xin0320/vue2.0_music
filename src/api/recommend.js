import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config.js'
import axios from 'axios'
export function getRecommend() { // 利用jsonp抓取推荐数据
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
    const data = Object.assign({}, commonParams, { // assign合并对象
        platform: 'h5',
        uni: 0,
        needNewCode: 1
    })

    return jsonp(url, data, options)
}

export function getDiscList() {
    const url = '/api/getDiscList'
    const data = Object.assign({}, commonParams, {
      platform: 'yqq',
      hostUin: 0,
      sin: 0,
      ein: 29,
      sortId: 5,
      needNewCode: 0,
      categoryId: 10000000,
      rnd: Math.random(),
      format: 'json' // 将format从jsonp修改为json
    })
    return axios.get(url, {
      params: data
    }).then((res) => {
      return Promise.resolve(res.data)
    })
}