import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex) // 注册插件

// 调试工具
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({ // 我们要去export store的一个实例，单例模式
    actions,
    getters,
    state,
    mutations,
    strict: debug, // 检测state的修改是不是来源于mutation
    plugins: debug ? [createLogger()] : [] // 通过mutation修改state的时候会在控制台打印logger
})