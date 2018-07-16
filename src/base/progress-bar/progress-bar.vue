<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div> <!-- 进度条走过的位置-->
      <!-- 小圆点按钮表示当前的一个位置-->
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16 // 原点按钮的长度
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {} // 在不同的回调函数中将共享数据挂载到touch对象上
    },
    methods: {
      progressTouchStart(e) {
        this.touch.initiated = true // 已经被初始化了
        this.touch.startX = e.touches[0].pageX // 横向坐标
        this.touch.left = this.$refs.progress.clientWidth // 进度条的初始偏移量
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX // 计算偏移量
        // this.touch.left + deltaX为相对于整个界面的偏移，但是不能超出整个进度条的宽度
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
        // 设置进度条的偏移和btn的transform
        this._offset(offsetWidth)
      },
      progressTouchEnd() { // 重置为false
        this.touch.initiated = false
        this._triggerPercent()  // 派发事件，将拖动进度条信息派发出去
      },
      /*
      progressClick(e) {
        // 设置偏移量即可
        this._offset(e.offsetX)
        // 派发函数
        this._triggerPercent()
      },
      */ 
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
        // this._offset(e.offsetX)
        this._triggerPercent()
      },
      _triggerPercent() {
         // 进度条的长度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 运动的percent
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      },
      _offset(offsetWidth) {
        // 已经走过的进度条的长度
        this.$refs.progress.style.width = `${offsetWidth}px`
        // 小球按钮的长度
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      }
    },
    watch: {
      percent(newPercent) {
        if (newPercent >= 0 && !this.touch.initiated) { // 没有在拖动的时候采取改变percent
         // 整个进度条的宽度，要减去按钮的宽度，通过常量定义
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
         // 偏移的宽度
          const offsetWidth = newPercent * barWidth
         //  设置progress的宽度，即进度条走过的长度
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>