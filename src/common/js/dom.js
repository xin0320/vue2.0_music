export function hasClass(el, className) { // 如果DOM已经有class了就不用再添加了
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className) // 满足class的定义方式就返回true
}
// DOM对象，DOM对象的className（样式的class）
export function addClass(el, className) { 
  if (hasClass(el, className)) {
    return
  }
  // 添加class，添加之前可能已经有别的class了，新旧class拼接
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function getData(el, name, val) { // DOM对象，name val
  const prefix = 'data-'
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  return el.getAttribute(prefix + name)
}

// 创建了一个div的style
let elementStyle = document.createElement('div').style

// 立即执行函数，返回一个浏览器类型
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false // 所有的类型都不支持的返回false
})()

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1) // 首字母大写再加上剩余部分
}
