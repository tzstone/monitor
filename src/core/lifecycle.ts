import { fill, eventTrigger, on, uuidCache, isObjectLike, getAbsoluteUrl, throttle } from '../utils'
import { Monitor, FetchDetail, XhrDetail } from '../../types'

function wrapXMLHttpRequest(monitor: Monitor) {
  const monitorUrl = monitor.options.url
  // 兼容IE9及以上
  fill(XMLHttpRequest.prototype, 'open', function (original) {
    return function (method, url) {
      this._requestUrl = getAbsoluteUrl(url)
      this._requestMethod = method
      // eslint-disable-next-line
      return original.apply(this, arguments)
    }
  })

  fill(XMLHttpRequest.prototype, 'send', function (originalSend) {
    return function (body) {
      // eslint-disable-next-line
      const xhr: XMLHttpRequest = this
      const startTime = +new Date()
      if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
        fill(xhr, 'onreadystatechange', function (originalChange) {
          return function (...changeArgs) {
            if (xhr.readyState === 4 && monitorUrl !== xhr._requestUrl) {
              const endTime = +new Date()
              const delay = endTime - startTime
              const method = xhr._requestMethod

              let _body
              // json/x-www-form-urlencoded
              if (typeof body === 'string') {
                _body = body
              }

              // 修复ie兼容性问题
              xhr._responseURL = xhr.responseURL || xhr._requestUrl

              const detail: XhrDetail = {
                delay,
                xhr,
                body: _body,
                method
              }
              eventTrigger('xhrLoadEnd', detail)
            }

            return originalChange.apply(this, changeArgs)
          }
        })
      }
      // eslint-disable-next-line
      originalSend.apply(this, arguments)
    }
  })
}

function wrapFetch(monitor: Monitor) {
  if (!window.fetch || typeof window.fetch !== 'function') return

  const monitorUrl = monitor.options.url
  fill(window, 'fetch', function (original) {
    return function (resource, init) {
      const startTime = +new Date()
      let body
      let method = 'GET'

      if (resource instanceof Request) {
        // TODO: resource.body is a ReadableStream
        body = resource.body
        method = resource.method
      } else if (isObjectLike(init)) {
        // json/x-www-form-urlencoded
        if (typeof init.body === 'string') {
          body = init.body
        }
        method = init.method
      }

      // eslint-disable-next-line
      return original.apply(this, arguments).then((res: Response) => {
        if (monitorUrl !== res.url) {
          const endTime = +new Date()
          const delay = endTime - startTime
          const detail: FetchDetail = {
            delay,
            res: res.clone(),
            body,
            method
          }
          eventTrigger('fetchLoadEnd', detail)
        }
        return res
      })
    }
  })
}

function send(url: string, data: any[]) {
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'text/plain;charset=UTF-8'
    })
    navigator.sendBeacon(url, blob)
  } else {
    const img = (window['beaconImg' + Date.now()] = new Image()) // img挂载在window下, 防止请求未发送前被垃圾回收
    img.onload = img.onerror = function () {
      img.onload = img.onerror = null
    }
    img.src = `${url}?${JSON.stringify(data)}`

    // or 同步xhr
    // const xhr = new XMLHttpRequest()
    // xhr.open('POST', url, false) // 同步
    // // 需在 open 和 send 之间调用
    // xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    // xhr.send(JSON.stringify(data))
  }
}

function start2send(monitor: Monitor) {
  const { options, $tracker } = monitor
  const data = $tracker.getWaiting2SendData()
  if (data && data.length > 0) {
    send(options.url, data)
  }
}

let alreadySent = false

function initUnloadListener(monitor: Monitor) {
  function unloadHandler() {
    if (alreadySent) return
    alreadySent = true
    start2send(monitor)
  }

  on(window, 'unload', unloadHandler)
  on(window, 'beforeunload', unloadHandler)
}

function initUuid() {
  const uuid = uuidCache.get()
  if (!uuid) {
    uuidCache.set()
  }
}

const idleTime = 30000
function initIdleTimer(monitor: Monitor) {
  let timer
  const handler = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      start2send(monitor)
    }, idleTime)
  }
  handler() // 启动

  // idleTime内无以下事件发生, 判定为进入idle状态
  ;['mousemove', 'mousedown', 'keyup', 'touchstart', 'scroll'].forEach(event => {
    on(document, event, throttle(handler, 300))
  })
}

export function initLifecycle(monitor) {
  initUuid()
  wrapXMLHttpRequest(monitor)
  wrapFetch(monitor)
}

export function initEvent(monitor) {
  initIdleTimer(monitor)
  initUnloadListener(monitor)
}
