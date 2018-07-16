<template>
  <div class="slider" ref="slider"> <!-- 外层容器 -->
    <div class="slider-group" ref="sliderGroup"> <!-- 内部元素，要设置sliderGroup的宽度-->
      <slot>
      </slot>
    </div>
    <div class="dots">
        <span class="dot" v-for="(item,index) in dots" :key="item, index" :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
    import {addClass} from 'common/js/dom'
    import BScroll from 'better-scroll'
    export default {
        data() {
            return {
                dots: [],
                currentPageIndex: 0
            }
        },
        props: {
            loop: { // 循环轮播
                type: Boolean,
                default: true
            },
            autoPlay: { // 自动轮播
                type: Boolean,
                default: true
            },
            interval: { // 轮播间隔
                type: Number,
                default: 4000
            }
        },
        mounted() {
            // 保证DOM成功渲染的话可以加一个延时,也可以用nextTick()
            setTimeout(() => {
                // 将初始化代码封装到methods中
                this._setSliderWidth()
                this._initDots() 
                this._initSlider()

                if (this.autoPlay) { // 是否要自动播放
                    this._play()
                }
            }, 20) // 浏览器刷新通常是17毫秒一次

            window.addEventListener('resize', () => {
                if (!this.slider) { // bScroll没有初始化的时候
                    return
                }
                // 窗口大小改变时重新计算宽度
                this._setSliderWidth(true)
                this.slider.refresh()
            })
        },
        deactivated() {
            clearTimeout(this.timer)
        },
        methods: {
            // 横向滚动初始化bscroll之前要下计算宽度，因为横向不能被自动撑宽
            _setSliderWidth(isResize) {
                this.children = this.$refs.sliderGroup.children
               
                let width = 0
                let sliderWidth = this.$refs.slider.clientWidth
                for (let i = 0; i < this.children.length; i++) {
                    // 获取到每一张图片
                    let child = this.children[i]
                    // 为child添加样式
                    addClass(child, 'slider-item')
                    // 为每张图片设置宽度
                    child.style.width = sliderWidth + 'px'
                    // 计算所有图片的总宽度
                    width += sliderWidth
                }
                // loop轮播实现的时候会左右克隆两个DOM，所以长度要增加
                if (this.loop && !isResize) {
                    width += 2 * sliderWidth
                }
                // 设置slider-group(内容区的宽度)
                this.$refs.sliderGroup.style.width = width + 'px'
            },
            _initDots() {
                this.dots = new Array(this.children.length)
            },
            // 轮播
            _initSlider() {
                this.slider = new BScroll(this.$refs.slider, {
                    scrollX: true,
                    scrollY: false,
                    momentum: false, // 惯性
                    snap: true, 
                    snapLoop: this.loop,
                    snapThreshold: 0.3,
                    snapSpeed: 400
                   // click: true // 超链接不能点击的问题，fastClick的问题
                })

// 每一次滚动完一张图片时更新currentPageIndex的值，若是在自动轮播模式下，要添加play方法
                this.slider.on('scrollEnd', () => {
                    let pageIndex = this.slider.getCurrentPage().pageX 
                    if (this.loop) { // 循环模式下添加拷贝，所以index要减一
                        pageIndex -= 1
                    }
                    this.currentPageIndex = pageIndex
                
                    // 自动轮播一次就会停止问题，添加自动播放函数
                    if (this.autoPlay) {
                        clearTimeout(this.timer)
                        this._play()
                    }
                })
            },
            _play() { // 自动轮播
                let pageIndex = this.currentPageIndex + 1
                if (this.loop) {
                    pageIndex += 1
                    // 设置定时器自动播放
                    this.timer = setTimeout(() => {
                        // goToPage是BScroll的方法，下标，方向，0代表x方向，间隔400
                        this.slider.goToPage(pageIndex, 0, 400)
                    }, this.interval)
                }
            }
        }
    }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    position relative
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>