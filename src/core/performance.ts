import { Monitor, UploadType, XhrDetail, FetchDetail, ResponseTimeInfo } from '../../types'
import { on, firstScreenPromise, fpPromise, fcpPromise, fmpPromise } from '../utils'

function initPerformanceListener(monitor: Monitor) {
  on(window, 'load', function (e) {
    setTimeout(() => {
      const times = {} as any
      let t = window.performance.timing as PerformanceTiming
      if (typeof window.PerformanceNavigationTiming === 'function') {
        try {
          const nt2Timing = window.performance.getEntriesByType('navigation')[0]
          if (nt2Timing) {
            // @ts-ignore
            t = nt2Timing as PerformanceNavigationTiming
            // 不统计刷新/前进/后退类型, 避免缓存影响
            // @ts-ignore
            if (t.type !== 'navigate') return
          }
        } catch (err) {
          // do no-thing
        }
      }

      // 重定向时间
      times.redirect = t.redirectEnd - t.redirectStart

      // dns查询耗时
      times.dnsLookup = t.domainLookupEnd - t.domainLookupStart

      // DNS 缓存时间
      times.appcache = t.domainLookupStart - t.fetchStart

      // 卸载页面的时间
      times.unloadEvent = t.unloadEventEnd - t.unloadEventStart

      // 执行onload回调时间
      times.loadEvent = t.loadEventEnd - t.loadEventStart

      // tcp连接耗时
      times.tcp = t.connectEnd - t.connectStart

      // ssl安全连接耗时
      times.ssl = t.secureConnectionStart === 0 ? 0 : t.connectEnd - t.secureConnectionStart

      // TTFB 读取页面第一个字节的时间
      times.ttfb = t.responseStart - t.requestStart

      // 数据传输耗时
      times.contentDownload = t.responseEnd - t.responseStart

      // 解析dom树耗时
      times.domParse = t.domInteractive - (t.domLoading || t.responseEnd)

      // 白屏时间
      times.blank = (t.domLoading || t.responseEnd) - t.fetchStart

      // domReady
      times.domReady = t.domContentLoadedEventEnd - t.fetchStart

      // 首次可交互时间
      times.tti = t.domInteractive - t.fetchStart

      // load
      times.loadPage = t.loadEventStart - t.fetchStart

      // 资源加载
      times.resourceDownload = t.loadEventStart - t.domInteractive
      // resourceDownload 有时会出现一个极大的负数, 简单兼容处理
      if (times.resourceDownload < 0) {
        times.resourceDownload = 1070
      }

      Promise.all([fpPromise, fcpPromise, fmpPromise, firstScreenPromise]).then(([fp, fcp, fmp, firstScreen]) => {
        times.fp = fp
        times.fcp = fcp
        times.fmp = fmp
        times.firstScreen = firstScreen // 首屏时间
        monitor.track(times, UploadType.Performance)
      })
    }, 100)
  })
}

function initResponseTimeListener(monitor: Monitor) {
  on(window, 'xhrLoadEnd', function (e: CustomEventInit) {
    const { delay, xhr, body, method } = e.detail as XhrDetail
    const { status, statusText, _responseURL } = xhr
    if ((status >= 200 && status < 300) || status === 304) {
      const data: ResponseTimeInfo = {
        responseTime: delay,
        responseUrl: _responseURL,
        responseStatus: status,
        responseStatusText: statusText,
        requestBody: body,
        requestMethod: method,
        type: 'xhr'
      }
      monitor.track(data, UploadType.ResponseTime)
    }
  })

  on(window, 'fetchLoadEnd', function (e: CustomEventInit) {
    const { delay, res, body, method } = e.detail as FetchDetail
    if (res.ok) {
      const { status, statusText, url } = res
      const data: ResponseTimeInfo = {
        responseTime: delay,
        responseUrl: url,
        responseStatus: status,
        responseStatusText: statusText,
        requestBody: body,
        requestMethod: method,
        type: 'fetch'
      }
      monitor.track(data, UploadType.ResponseTime)
    }
  })
}

export function initPerformanceCollect(monitor) {
  initPerformanceListener(monitor)
  initResponseTimeListener(monitor)
}
