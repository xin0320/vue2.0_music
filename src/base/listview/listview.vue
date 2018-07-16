<template>
<!-- 传入数据才可以滚动，没有高度的问题-->
  <scroll class="listview" :data="data" 
                            ref="listview"
                            :probeType = "probeType"
                            :listenScroll = "listenScroll"
                            @scroll="scroll"> <!-- 将listenScroll的值传给scroll,并监听子组件scroll传过来的事件scroll--> 
    <ul>
        <li v-for="group in data" :key="group.id" class="list-group" ref="listGroup">
            <h2 class="list-group-title">{{group.title}}</h2>
            <ul>
                <li @click="selectItem(item)" v-for="item in group.items" :key="item.id" class="list-group-item">
                    <img :src="item.avatar" class="avatar" v-lazy="item.avatar">
                    <span class="name">{{item.name}}</span>
                </li>
            </ul>
        </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove"> <!-- touchstart是BScroll自带的事件-->
        <ul>
            <li v-for="(item, index) in shortcutList" 
                :key="item.id, index" 
                class="item"
                :class="{'current':currentIndex===index}"
                :data-index="index"> <!-- 变量data-index要进行v-bind-->
                {{item}}
            </li>
        </ul>
    </div>
    <!-- 顶部固定标题-->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed"> <!-- fixedTitle为空时不显示-->
        <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length">
        <loading></loading>
    </div>
  </scroll>
</template>
<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'
import Loading from 'base/loading/loading'
const ANCHOR_HEIGHT = 18 // 通过css样式计算出来一个锚点的高度为18
const TITLE_HEIGHT = 30
export default {
    created() {
        this.touch = {}
        this.listenScroll = true
        this.listHeight = []
        this.probeType = 3 // 滑动很长的列表的时候右侧要连续给出高亮 
    },
    props: {
        data: {
            type: Array,
            defalut: []
        }
    },
    data() {
        return {
            scrollY: 1,
            currentIndex: 0, // 默认第一个是高亮的
            diff: -1 
        }
    },
    computed: {
      shortcutList() {
          return this.data.map((group) => {
              return group.title.substr(0, 1)
          })
      },
      fixedTitle() {
          if (this.scroll > 0) { // 超出顶部了
            return ''
          }
          return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }  
    },
    methods: {
      selectItem(item) {
         // console.log('aaa')
          this.$emit('select', item)
      },
      onShortcutTouchStart(e) {
        // 点击的时候要先获取元素的索引
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        // 当前的y值
        this.touch.y1 = firstTouch.pageY
        // 当前的锚点
        this.touch.anchorIndex = anchorIndex
        // console.log(anchorIndex) // 0 1 2
        // 然后利用BScroll将$refs.listview滚动到$refs.listGroup相应的位置,封装在_scrollTo中了
        // this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex], 0)
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
    // touchstart的时候要获取当前滚动的一个Y值，touchmove的时候也要获取当前滚动的一个Y值
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
    // 计算出偏移了几个锚点
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
    // 滚动之后的锚点,更新anchorIndex的值
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta // 字符串转化为int类型
        // console.log(anchorIndex)
        this._scrollTo(anchorIndex)
      },
      _scrollTo(index) {
          if (!index && index !== 0) { // 点击最顶部的情况
              return 
          }
          if (index < 0) { // 处理滑动时的边界情况
                index = 0
            } else if (index > this.listHeight.length - 2) {
                index = this.listHeight.length - 2
            }
          // 点击时更新scrollY的值才会出现高亮,定义为每一个listHeight的上限位置，是一个负值
          this.scrollY = -this.listHeight[index] 
          this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 第二个参数需不需要缓动时间
      },
      scroll(pos) {
          this.scrollY = pos.y // 实时获取到bscroll滚动到Y轴的网距离
      },
      _calculateHeight() {
          this.listHeight = [] // 每次滚动时高度计算都重新开始
          const list = this.$refs.listGroup
          let height = 0
          this.listHeight.push(height) // '热'的高度为0，第一个元素
          for (let i = 0; i < list.length; i++) {
              let item = list[i]
              height += item.clientHeight
              this.listHeight.push(height)
          }
      }
    },
    watch: {
        data() {
            setTimeout(() => { // 数据到DOM的变化有一个延时
                this._calculateHeight()
            }, 20)
        },
        scrollY(newY) {
            const listHeight = this.listHeight
            // 当滚动到顶部， newY > 0
            if (newY > 0) {
                this.currentIndex = 0
                return 
            }
            // 中间部分滚动
            for (let i = 0; i < listHeight.length - 1; i++) {
                let height1 = listHeight[i]
                let height2 = listHeight[i + 1]
                if (-newY >= height1 && -newY < height2) { // !height2表示列表的最后一项
                    this.currentIndex = i
                    this.diff = height2 + newY
                   // console.log(this.currentIndex)
                    return 
                }
            }
            // 当滚动到底部，且-newY大于最后一个元素的上限
            this.currentIndex = listHeight.length - 2
        },
        diff(newVal) {
            let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
            if (this.fixedTop === fixedTop) {
                return
            }
            this.fixedTop = fixedTop
            this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
        } 
    },
    components: {
        Scroll,
        Loading
    }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
