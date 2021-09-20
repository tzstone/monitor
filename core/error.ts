import { on, fill, formatJSError } from '../utils'
import { Monitor, JsErrorInfo, ResourceErrorInfo, RequestErrorInfo, UploadType, XhrDetail, FetchDetail } from '../types'

// js
function initJSErrorListener(monitor: Monitor) {
  // window.onerror
  fill(window, 'onerror', function (original) {
    return function (msg, url, line, col, error) {
      const data = formatJSError({ msg, url, line, col, error }) as JsErrorInfo
      monitor.track(data, UploadType.JsError, { immediate: true })

      if (typeof original === 'function') {
        original.call(this, msg, url, line, col, error)
      }
    }
  })

  // unhandledrejection
  on('unhandledrejection', function (e: any) {
    const data = formatJSError({ msg: e.reason, type: 'Unhandledrejection' }) as JsErrorInfo
    monitor.track(data, UploadType.JsError, { immediate: true })
  })
}

// resource
function initResourceErrorListener(monitor: Monitor) {
  on(
    'onerror',
    function (e: Event) {
      const target = (e.target || e.srcElement) as Element
      const type = target.localName
      if (target instanceof HTMLElement && ['link', 'script', 'img'].includes(type)) {
        const url = (target as HTMLScriptElement | HTMLImageElement).src || (target as HTMLLinkElement).href
        const data: ResourceErrorInfo = {
          errorMsg: target.outerHTML,
          errorUrl: url,
          errorType: type
        }
        monitor.track(data, UploadType.ResourceError, { immediate: true })
      }
    },
    true
  )
}

// request
function initRequestErrorListener(monitor: Monitor) {
  on('xhrLoadEnd', function (e: CustomEventInit) {
    const { delay, xhr } = e.detail as XhrDetail
    const { status, statusText, responseText, responseURL } = xhr
    if (!((status >= 200 && status < 300) || status === 304)) {
      const data: RequestErrorInfo = {
        errorUrl: responseURL,
        errorStatus: status,
        errorStatusText: statusText,
        errorResponseText: responseText,
        errorDelay: delay
      }
      monitor.track(data, UploadType.RequestError, { immediate: true })
    }
  })

  on('fetchLoadEnd', function (e: CustomEventInit) {
    const { delay, res } = e.detail as FetchDetail
    if (!res.ok) {
      const { status, statusText, url } = res
      res.text().then(responseText => {
        const data: RequestErrorInfo = {
          errorUrl: url,
          errorStatus: status,
          errorStatusText: statusText,
          errorResponseText: responseText,
          errorDelay: delay
        }
        monitor.track(data, UploadType.RequestError, { immediate: true })
      })
    }
  })
}

export function initErrorCollect(monitor) {
  initJSErrorListener(monitor)
  initRequestErrorListener(monitor)
  initResourceErrorListener(monitor)
}
