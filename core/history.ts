import { on, fill } from '../utils'
import { Monitor, HistoryInfo, UploadType } from '../types'

export function initHistoryListener(monitor: Monitor) {
  let startTime, endTime, from, to

  on('load', function () {
    const initData: HistoryInfo = {
      from: null,
      to: window.location.href,
      stayTime: null,
      uploadType: UploadType.History
    }
    monitor.track(initData)

    // init
    startTime = +new Date()
    from = window.location.href
  })

  function urlChangeHandler(e?) {
    if (e && e.singleSpa) return

    endTime = +new Date()
    to = window.location.href
    const stayTime = endTime - startTime
    const data: HistoryInfo = {
      from,
      to,
      stayTime,
      uploadType: UploadType.History
    }
    monitor.track(data)

    from = to
    startTime = endTime
  }

  on('hashchange', urlChangeHandler)
  on('popstate', urlChangeHandler)
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
