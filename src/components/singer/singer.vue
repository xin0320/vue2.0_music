<template>
  <div class="singer">
    <list-view @select="selectSinger" :data="singers"></list-view>
    <router-view></router-view> <!-- 挂载歌手详情页的路由-->
  </div>
</template>

<script type="text/ecmascript-6">
import {getSingerList} from 'api/singer'
import {ERR_OK} from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
import {mapMutations} from 'vuex'

const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10
export default {
  data() {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer) // 实现了对一个mutation的提交，相当于网state中谢了
       // console.log(`${singer.id}`)
      },
    _getSingerList() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = res.data.list
          // console.log(this._normalizeSinger(this.singers))
          this.singers = this._normalizeSinger(this.singers)
        }
      })
    },
    _normalizeSinger(list) { // 规范化数据，list=this.singers
      let map = {
        hot: {
          title: HOT_NAME, // 以‘热门’开头的歌手名
          items: [] // title下的歌手列表
        }
      }
      list.forEach((item, index) => {
        // 热门数据，十条之内都添加到map中
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({ // 某个歌手热门歌曲的前十条
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        const key = item.Findex // Findex: "X"
        // 如果没有以这个k为对象的聚合的话，就添加一个k,创建这个对象，因为有的姓氏开头的字母很少见
        // 表示以前没有这个歌手名的首字母就直接添加
        if (!map[key]) { // 以字母A B C D开头的歌手，但是存到map里的ABCD是无序的
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
      })
       // 为了得到有序列表，我们需要处理 map
       let hot = []
       let ret = []
       for (let key in map) {
         let val = map[key] // 对应一个title和items
         if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val) // 将title对应的val push到ret数组中
         } else if (val.title === HOT_NAME) {
            hot.push(val)
         }
       }
       // 对title是A-Z的ret数组进行排序
       ret.sort((a, b) => {
         return a.title.charCodeAt(0) - b.title.charCodeAt(0) // a-b>0 return true，升序
       })
       return hot.concat(ret) // 两部分数组拼接,ret即为一个有序的数组
    },
    // 通过扩展运算符的方式调用mapMutations,去做一个对象的映射，将mutation的修改映射成一个方法名
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>