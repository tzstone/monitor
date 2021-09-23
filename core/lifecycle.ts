import { fill, eventTrigger, on } from '../utils'
import { Monitor } from '../types'
// import { CACHE_KEY } from '../shared/constants'

function wrapXMLHttpRequest(monitor: Monitor) {
  const url = monitor.options.url
  // 兼容IE9及以上
  fill(XMLHttpRequest.prototype, 'open', function (original) {
    return function (method, url) {
      this._requestUrl = url
      // eslint-disable-next-line
      return original.apply(this, arguments)
    }
  })

  fill(XMLHttpRequest.prototype, 'send', function (originalSend) {
    return function (...sendArgs) {
      // eslint-disable-next-line
      const xhr: XMLHttpRequest = this
      const startTime = +new Date()
      if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
        fill(xhr, 'onreadystatechange', function (originalChange) {
          return function (...changeArgs) {
            if (xhr.readyState === 4) {
              if (url !== (xhr as any)._requestUrl) {
                const endTime = +new Date()
                const delay = endTime - startTime
                eventTrigger('xhrLoadEnd', { delay, xhr })
              }
            }

            return originalChange.apply(this, changeArgs)
          }
        })
      }
      originalSend.apply(this, sendArgs)
    }
  })
}

function wrapFetch(monitor: Monitor) {
  if (!window.fetch || typeof window.fetch !== 'function') return

  const url = monitor.options.url
  fill(window, 'fetch', function (original) {
    return function (...args) {
      const startTime = +new Date()
      return original.apply(this, args).then((res: Response) => {
        if (url !== res.url) {
          const endTime = +new Date()
          const delay = endTime - startTime
          eventTrigger('fetchLoadEnd', { delay, res: res.clone() })
        }
        return res
      })
    }
  })
}

function send(url: string, data: any[]) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, JSON.stringify(data))
  } else {
    // 也可用new Image
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, false) // 同步
    // 需在 open 和 send 之间调用
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhr.send(JSON.stringify(data))
  }
}

let alreadySent = false

function initUnloadListener(monitor: Monitor) {
  function unloadHandler() {
    if (alreadySent) return
    alreadySent = true
    const { options, $tracker } = monitor
    const data = $tracker.getNotSentData()
    if (data && data.length > 0) {
      send(options.url, data)
    }
  }

  on(window, 'unload', unloadHandler)
  on(window, 'beforeunload', unloadHandler)

  // 缓存未发送数据, 考虑打开多tab
  // on(window, 'unload', function () {
  //   const { $tracker } = monitor
  //   const data = $tracker.getNotSentData()
  //   let cacheData = localStorage.getItem(CACHE_KEY)
  //   cacheData = (cacheData && JSON.parse(cacheData)) || []
  //   // @ts-ignore
  //   cacheData = cacheData.concat(data)
  //   localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  // })
}

export function initLifecycle(monitor) {
  wrapXMLHttpRequest(monitor)
  wrapFetch(monitor)
}

export function initEvent(monitor) {
  initUnloadListener(monitor)
}
