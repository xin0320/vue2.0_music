<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"  
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="cdWrapper" :class="cdCls"> 
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" 
                   class="text"
                   :class="{'current': currentLineNum === index}"
                   v-for="(line, index) in currentLyric.lines"
                   :key="index">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd' }"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
            <div class="progress-wrapper">
                <span class="time time-l">{{format(currentTime)}}</span>
                <div class="progress-bar-wrapper">
                   <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar> 
                </div>
                <span class="time time-r">{{format(currentSong.duration)}}</span>
            </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i  @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
           <progress-circle :radius="radius" :percent="percent">
               <!-- class="icon-mini"将i 包裹进去-->
                <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
            </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio @ended="end" ref="audio" @timeupdate="updateTime" :src="currentSong.url" @play="ready" @error="error"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'

const transitionDuration = prefixStyle('transitionDuration')
const transform = prefixStyle('transform')
export default {
    data() {
        return {
            songReady: false,
            currentTime: 0,
            radius: 32,
            currentLyric: null, // 当前这首歌的歌词
            currentLineNum: 0, // 当前歌词所在的行 
            currentShow: 'cd'
        }
    },
    computed: {
        ...mapGetters([
            'fullScreen',
            'playlist',
            'currentSong',
            'playing', // 获取播放的状态
            'currentIndex',
            'mode',
            'sequenceList'
        ]),
        playIcon() {
            return this.playing ? 'icon-pause' : 'icon-play' 
        },
        miniIcon() {
            return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
        },
        cdCls() {
            return this.playing ? 'play' : 'play_pause'
        },
        disableCls() {
            return this.songReady ? '' : 'disable'
        },
        percent() {
            return this.currentTime / this.currentSong.duration
        },
        iconMode() {
          // 在config中定义了mode为常亮0,1,2，要要先把他们拿出来
          return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        }
    },
    created() { // touch不需要添加getter和setter，座椅定义在created中
      this.touch = {} // 用来关联touchStart等动作的
    },
    methods: {
      end() {
        if (this.mode === playMode.loop) { // 单曲循环
          this.loop()
        } else {
          this.next() // 之前定义过了
        }
      },
      loop () {
        // 歌曲回到起点并重新播放
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      },
      changeMode() { // 每点击一下就加一
        const mode = (this.mode + 1) % 3
        // 去mapMutations中去映射一个
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.random) {
          // 对sequenceList洗牌
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        // 切换播放模式的时候currentSong并不改变，重新设置currentSong的id
        this.resetCurrentIndex(list)
        // 修改当前的playlist为改变mode之后的list，在getMutations中拿到playlist
        this.setPlaylist(list)
      },
      resetCurrentIndex(list) {
        // findIndex是es6的一个语法，接受一个函数，函数可以拿到每一个list元素
        let index = list.findIndex((item) => {
          // 将当前歌曲的索引赋值给item的索引
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index) // setMutaions方法
      },
        onProgressBarChange(percent) {
            // 设置audio的currentTime，当前歌曲的总时间乘以percent
            const currentTime = this.currentSong.duration * percent
            this.$refs.audio.currentTime = currentTime
            if (!this.playing) { // 若是拖动进度条之后暂停了，就变为继续播放
                this.togglePlaying()
            }
        },
        next () {
            if (!this.songReady) {
                return
            }
            let index = this.currentIndex + 1
            if(index === this.playlist.length) {
                index = 0
            }
            this.setCurrentIndex(index) // 修改index
            if (!this.playing) { // 暂停的时候通过toggleplaing是改变playing的状态，让其变成播放状态
                this.togglePlaying()
            }
            this.songReady = false // 重置，下一首还没准备好呢
        },
        prev() {
            if (!this.songReady) {
                return
            }
            let index = this.currentIndex - 1
            if(index === -1) {
                index = this.playlist.length 
            }
            this.setCurrentIndex(index)
             if (!this.playing) { // 暂停的时候通过toggleplaing是改变playing的状态，让其变成播放状态
                this.togglePlaying()
            }
            this.songReady = false // 重置，下一首还没准备好呢
        },
        ready() {
            this.songReady = true
        },
        error() {
            // 当歌曲加载失败时出发error函数
             this.songReady = true
        },
        back() {
            // 此处通过mutation改变fullScreen，引入mapMutations,通过...mapMutations取得映射
            this.setFullScreen(false)

        },
        open() {
            this.setFullScreen(true)
        },
        updateTime(e) { // target就是audio标签,有currentTime属性
            this.currentTime = e.target.currentTime
        },
        format(interval) {
            interval = interval | 0 // 一个正数的向下取整
            const minute = interval / 60 | 0
            const second = this._pad(interval % 60)
            return `${minute}:${second}`
        },
        getLyric() {
          // 对应result中的lyric，在zhen中拿到lyric的值
          this.currentSong.getLyric().then((lyric) => {
            this.currentLyric = new Lyric(lyric, this.handleLyric)
            // 输出lyric-parser之后，字符串被解析的样式
           // console.log(this.currentLyric)
           if (this.playing){ // 当歌曲正在播放时
             this.currentLyric.play() // 调用play，歌词播放,但是不能滚动
           }
          })
        },
        // 歌词发生改变的时候就进行的回调函数
        handleLyric({lineNum, txt}) { // 第几行歌词，和这行歌词的内容
          // 绑定DOM的:class,使当前的歌词变高亮
          this.currentLineNum = lineNum
          // 前5行是不用滚动scroll的
          if (lineNum > 5) {
            // 定位当前滚动的p标签的位置
            let lineEl = this.$refs.lyricLine[lineNum - 5]
            // 滚动到p标签的位置，并有1s的动画时间
            this.$refs.lyricList.scrollToElement(lineEl, 1000)
          } else { // 5行之内直接滚动到顶部
            this.$refs.lyricList.scrollTo(0, 0, 1000)
          }
        },
        middleTouchStart(e) {
          // 设置标志位表示已经初始化了
          this.touch.initiated = true
          const touch = e.touches[0]
          this.touch.startX = touch.pageX
          this.touch.stratY = touch.pageY
        },
        middleTouchMove(e) {
          if (!this.touch.initiated) {
            return
          }
          const touch = e.touches[0]
          // 拿到差值
          const deltaX = touch.pageX - this.touch.startX
          const deltaY = touch.pageY - this.touch.stratY
          // 歌词在纵向滚动，当纵向偏移大于左右偏移的时候，我们就不应该左右移动
          if (Math.abs(deltaY) > Math.abs(deltaX)) {
            return 
          }
          // 拿到滚动过程中middle-r距离左右两侧的屏幕的差值
          const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
          const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
          this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
          // lyricList是一个Vue组件，是无法直接造作它的dom的，用$el来代替它的dom
          this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
          this.$refs.lyricList.$el.style[transitionDuration] = 0
         // 透明度的渐变
         this.$refs.middleL.style.opacity = 1 - this.touch.percent
         this.$refs.middleL.style[transitionDuration] = 0
        },
        middleTouchEnd() {
          // 用来决定停在哪个位置
          let offsetWidth
          let opacity
          if (this.currentShow === 'cd') {
            // 从右向左滑，只需要滑10%就行
            if (this.touch.percent > 0.1) {
              offsetWidth = -window.innerWidth // 最终停止的位置
              opacity = 0
              this.currentShow = 'lyric' // 改变dot的css样式
            } else { 
              offsetWidth = 0 // 否则就回到原来的位置 
              opacity = 1
            }
          } else { // 从右向左滑，看的是0.9 
            if(this.touch.percent < 0.9) {
              offsetWidth = 0
              this.currentShow = 'cd'
              opacity = 1
            } else {
              offsetWidth = -window.innerWidth
              opacity = 0
            }
          }
          const time = 300
          this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
          // 添加动画效果
          this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
          this.$refs.middleL.style.opacity = opacity
          this.$refs.middleL.style[transitionDuration] = `${time}ms`
          this.touch.initiated = false
        },
        _pad(num, n = 2) { // 设计补位，补0,默认是两位数
            let len = num.toString().length
            while(len < n) {
                num = '0' + num
                len++
            }
            return num
        },
        enter(el, done) { // DOM， 动作，done执行完机会跳入下一个
            // 首先要获取图片在animal播放器的具体位置
            const {x, y, scale} = this._getPosAndScale()
            // 定义animation
            let animation = {
                0: {
                    transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
                },
                60: {
                    transform: `translate3d(0,0,0) scale(1.1)`
                },
                100: {
                    transform: `translate3d(0,0,0) scale(1)`
                }
            }
            // 注册animation
            animations.registerAnimation({
                name: 'move',
                animation,
                presets: {
                    duration: 400,
                    easing: 'linear'
                }
            })
            // 运行animation,绑定dom
            animations.runAnimation(this.$refs.cdWrapper, 'move', done)
        },
        afterEnter() { // 清空animation
            animations.unregisterAnimation('move')
            this.$refs.cdWrapper.style.animation = ''
        },
        leave(el, done) { // leave执行完之后就会跳入afterLeave
            this.$refs.cdWrapper.style.transition = 'all 0.4s'
            // 最终目标运行的位置
            const {x, y, scale} = this._getPosAndScale()
            this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
            // 监听事件transitionend，执行完之后就执行afterLeave
            this.$refs.cdWrapper.addEventListener('transitionend', done)
        },
        afterLeave() {
            this.$refs.cdWrapper.style.transition = ''
            this.$refs.cdWrapper.style[transform] = ''
        },
        togglePlaying() {
            this.setPlayingState(!this.playing)
        },
        _getPosAndScale() {
            const targetWidth = 40 // min播放器的宽度
            const paddingLeft = 40 // min图片的圆心距离左侧有40的偏移
            const paddingBottom = 30
            const paddingTop = 80 // 顶部名字和歌手的高度
            const width = window.innerWidth * 0.8 // cd-wrapper的宽度
            const scale = targetWidth / width // 初始的缩放比例
            const x = -(window.innerWidth / 2 - paddingLeft) // 初始的x,y坐标
            const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
            return {
                x,
                y,
                scale
            }

        },
        ...mapMutations({
           setFullScreen: 'SET_FULL_SCREEN',
           setPlayingState: 'SET_PLAYING_STATE',
           setCurrentIndex: 'SET_CURRENT_INDEX',
           setPlayMode: 'SET_PLAY_MODE',
           setPlaylist: 'SET_PLAYLIST'
        })
    },
    watch: {
        currentSong(newSong, oldSong) {
           // 切换之后id没变我们就什么都不做
          if (newSong.id === oldSong.id) {
            return
          }
            // dom ready之后才可以掉用src,此处用nextTick加一个延时
            this.$nextTick(() => {
                this.$refs.audio.play()
                // 测试歌词的输出
                // this.currentSong.getLyric() 
                this.getLyric()
            })
        },
        playing(newPlaying) {
            this.$nextTick(() => {
                const audio = this.$refs.audio
                newPlaying ? audio.play() : audio.pause() 
            })
        }
    },
    components: {
        ProgressBar,
        ProgressCircle,
        Scroll
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>