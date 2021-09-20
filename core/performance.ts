import { Monitor, UploadType, XhrDetail, FetchDetail, ResponseTimeInfo } from '../types'
import { on } from '../utils'

function initPerformanceListener(monitor: Monitor) {
  //
}

function initResponseTimeListener(monitor: Monitor) {
  on('xhrLoadEnd', function (e: CustomEventInit) {
    const { delay, xhr } = e.detail as XhrDetail
    const { status, statusText, responseText, responseURL } = xhr
    if ((status >= 200 && status < 300) || status === 304) {
      const data: ResponseTimeInfo = {
        responseTime: delay,
        responseUrl: responseURL,
        responseText,
        responseStatus: status,
        responseStatusText: statusText
      }
      monitor.track(data, UploadType.ResponseTime)
    }
  })

  on('fetchLoadEnd', function (e: CustomEventInit) {
    const { delay, res } = e.detail as FetchDetail
    if (res.ok) {
      const { status, statusText, url } = res
      res.text().then(responseText => {
        const data: ResponseTimeInfo = {
          responseUrl: url,
          responseStatus: status,
          responseStatusText: statusText,
          responseText,
          responseTime: delay
        }
        monitor.track(data, UploadType.ResponseTime)
      })
    }
  })
}

export function initPerformanceCollect(monitor) {
  initPerformanceListener(monitor)
  initResponseTimeListener(monitor)
}
