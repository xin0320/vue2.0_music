<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  export default {
      props: {
            probeType: {
                type: Number,
                default: 1
            },
            click: {
                type: Boolean,
                default: true
            },
            data: {
                type: Array, // refresh 数据
                default: null
            },
            listenScroll: { // 要不要监听滚动事件
                type: Boolean,
                default: false
            }
      },
      mounted() {
          setTimeout(() => {
              this._initScroll()
          }, 20)
      },
      methods: {
          _initScroll() {
              if (!this.$refs.wrapper) { 
                  return
              }
              this.scroll = new BScroll(this.$refs.wrapper, {
                  probeType: this.probeType,
                  click: this.click
              })
              // 如果要监听滚动事件，在初始化列BScroll之后要派发一个监听事件
              if (this.listenScroll) {
                  // BScroll 中的this是默认指向scroll的，所以要在me中保留vue实例的this
                  let me = this
                // 监听scroll,拿到pos后，派发一个函数将pos传出去
                this.scroll.on('scroll', (pos) => {
                    me.$emit('scroll', pos)
                })      
              }
          },
          enable() { // 代理方法
              this.scroll && this.scroll.enable()
          },
          disable() {
              this.scroll && this.scroll.disable()
          },
          refresh() {
              this.scroll && this.scroll.refresh()
          },
          scrollTo() {
              this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments) // applay引用到上下文中
          },
          scrollToElement() {
              this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
          }
      },
      // 要随时watch data的变化
      watch: {
          data() {
             setTimeout(() => {
                 this.refresh()
             }, 20)
          }
      }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
