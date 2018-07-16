<template>
  <transition name="slide">
      <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex' // vuex为取出数据提供的语法糖
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'

export default {
    data() {
        return {
            songs: []
        }
    },
    computed: { // getter映射的就是computed
        title() {
            return this.singer.name
        },
        bgImage() {
            return this.singer.avatar
        },
        ...mapGetters([
            'singer' // 对应到store中的getters定义的singer
        ])
    },
    created() {
      //  console.log(this.singer) // 测试输出singer数据
      // 调用方法获取数据
      this._getDetail()
    },
    methods: {
        _getDetail() {
            if (!this.singer.id) { // 在详情界面刷新找不到id的情况，回退到歌手列表界面
                this.$router.push('/singer')
                return
            }
            // 因为我们已经获取到了singer数据，此处可以通过this.singer直接调用获取歌手的id
            getSingerDetail(this.singer.id).then((res) => { 
                if (res.code === ERR_OK) {
                    this.songs = this._normalizeSongs(res.data.list)
                    console.log(this.songs)
                }
            })
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
            let {musicData} = item
                if (musicData.songid && musicData.albummid) {
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    },
    components: {
        MusicList
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
.slide-enter-active, .slide-leave-active
    transition all 0.3s
.slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
</style>
