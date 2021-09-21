import { on, fill } from '../utils'
import { Monitor, HistoryInfo, UploadType } from '../types'

export function initHistoryCollect(monitor: Monitor) {
  let startTime, endTime, from, to
  let stayTimeMap: { [url: string]: number }

  on(window, 'load', function () {
    startTime = +new Date()
    from = window.location.href
  })

  on(window, 'beforeunload', function () {
    const stayTime = getStayTime(from)
    const initData: HistoryInfo = {
      from,
      to: null,
      stayTime
    }
    monitor.track(initData, UploadType.History)
  })

  on(document, 'visibilitychange', function () {
    const nowTime = +new Date()
    if (document.visibilityState === 'visible') {
      startTime = nowTime
    } else {
      // hidden
      const stayTime = nowTime - startTime
      if (!stayTimeMap[from]) {
        stayTimeMap[from] = stayTime
      } else {
        stayTimeMap[from] += stayTime
      }
    }
  })

  function getStayTime(url: string): number {
    if (!endTime) endTime = +new Date()
    const stayTime = endTime - startTime
    const cacheStayTime = stayTimeMap[url] || 0
    return stayTime + cacheStayTime
  }

  function urlChangeHandler(e?) {
    if (e && e.singleSpa) return

    endTime = +new Date()
    to = window.location.href
    const stayTime = getStayTime(from)
    const data: HistoryInfo = {
      from,
      to,
      stayTime
    }
    monitor.track(data, UploadType.History)

    from = to
    startTime = endTime
  }

  on(window, 'hashchange', urlChangeHandler)
  on(window, 'popstate', urlChangeHandler)
  ;['pushState', 'replaceState'].forEach(key => {
    fill(window.history, key, function (original) {
      return function (...args) {
        // 先触发路由变化
        original.apply(this, args)
        urlChangeHandler()
      }
    })
  })
}
