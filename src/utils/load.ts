// 首屏时间FCP(First Contentful Paint)
// Aegis的实现
const ignoreEleList = ['script', 'style', 'link', 'br']

// 查看当前元素及其祖先元素是否在数组中
function isEleInArray(target, arr) {
  if (!target || target === document.documentElement) {
    return false
  } else if (arr.indexOf(target) !== -1) {
    return true
  } else {
    return isEleInArray(target.parentElement, arr)
  }
}

// 判断对应target是否在首屏中
function isInFirstScreen(target) {
  if (!target || !target.getBoundingClientRect) return false
  const rect = target.getBoundingClientRect()
  const screenHeight = window.innerHeight
  const screenWidth = window.innerWidth
  return rect.left >= 0 && rect.left < screenWidth && rect.top >= 0 && rect.top < screenHeight
}

function getFCP() {
  return new Promise<any[]>((resolve, reject) => {
    const details = []
    const observer = new MutationObserver(mutations => {
      if (!mutations || !mutations.forEach) return

      const detail = {
        time: performance.now(),
        roots: []
      }
      mutations.forEach(mutation => {
        if (!mutation || !mutation.addedNodes || !mutation.addedNodes.forEach) return

        mutation.addedNodes.forEach(ele => {
          if (
            ele.nodeType === 1 && // 元素节点
            !ignoreEleList.includes(ele.nodeName.toLocaleLowerCase()) &&
            !isEleInArray(ele, detail.roots) // 当前元素或者其祖先元素还没被收集
          ) {
            // 收集新增节点
            detail.roots.push(ele)
          }
        })
      })

      if (detail.roots.length) {
        details.push(detail)
      }
    })

    observer.observe(document, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      resolve(details)
    }, 5000)
  }).then(details => {
    let result

    // 判断哪一个detail是首屏渲染中最后一个完成的
    details.forEach(detail => {
      for (let i = 0; i < detail.roots.length; i++) {
        if (isInFirstScreen(detail.roots[i])) {
          result = detail.time
          break
        }
      }
    })

    // 遍历当前请求的图片中，如果有开始请求时间在首屏dom渲染期间的，则表明该图片是首屏渲染中的一部分，
    // 所以dom渲染时间和图片返回时间中大的为首屏渲染时间
    window.performance.getEntriesByType('resource').forEach((resource: any) => {
      if (resource.initiatorType === 'img' && resource.fetchStart < result && resource.responseEnd > result) {
        result = resource.responseEnd
      }
    })

    return result
  })
}

export const fcpPromise = getFCP()

// TODO: 首次有效绘制FMP(First Meaningful Paint)
