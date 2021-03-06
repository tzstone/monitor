import { on, fill, formatJSError, isError, errorReason2String } from '../utils'
import {
  Monitor,
  JsErrorInfo,
  ResourceErrorInfo,
  RequestErrorInfo,
  UploadType,
  XhrDetail,
  FetchDetail
} from '../../types'

// js
function initJSErrorListener(monitor: Monitor) {
  // window.onerror
  function onErrorHandler(original) {
    return function (msg, url, line, col, error) {
      const data = formatJSError({ msg, url, line, col, error }) as JsErrorInfo
      monitor.track(data, UploadType.JsError, { immediate: true })

      if (typeof original === 'function') {
        original.call(this, msg, url, line, col, error)
      }
    }
  }

  fill(window, 'onerror', onErrorHandler)
  // iframe onerror
  // TODO: dynamic iframe
  // MutationObserver https://cloud.tencent.com/developer/article/1650697
  for (let i = 0; i < window.frames.length; i++) {
    fill(window.frames[i], 'onerror', onErrorHandler)
  }

  // unhandledrejection
  on(window, 'unhandledrejection', function (e: any) {
    const reason = e.reason
    const data = formatJSError({
      msg: errorReason2String(reason),
      error: isError(reason) ? reason : undefined,
      type: 'Unhandledrejection'
    }) as JsErrorInfo
    monitor.track(data, UploadType.JsError, { immediate: true })
  })
}

// resource
function initResourceErrorListener(monitor: Monitor) {
  on(
    window,
    'error',
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
  on(window, 'xhrLoadEnd', function (e: CustomEventInit) {
    const { delay, xhr, body, method } = e.detail as XhrDetail
    const { status, statusText, responseType, _responseURL } = xhr

    if (!((status >= 200 && status < 300) || [304, 401, 0].includes(status))) {
      let responseText
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseText
      if (!responseType || responseType === 'text') {
        responseText = xhr.responseText
      }

      const data: RequestErrorInfo = {
        errorUrl: _responseURL,
        errorStatus: status,
        errorStatusText: statusText,
        errorResponseText: responseText,
        errorDelay: delay,
        requestBody: body,
        requestMethod: method
      }

      monitor.track(data, UploadType.RequestError, { immediate: true })
    }
  })

  on(window, 'fetchLoadEnd', function (e: CustomEventInit) {
    const { delay, res, body, method } = e.detail as FetchDetail
    if (!res.ok) {
      const { status, statusText, url } = res
      res.text().then(responseText => {
        const data: RequestErrorInfo = {
          errorUrl: url,
          errorStatus: status,
          errorStatusText: statusText,
          errorResponseText: responseText,
          errorDelay: delay,
          requestBody: body,
          requestMethod: method
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
