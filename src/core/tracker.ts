import { getCommonInfo } from './common'
import { http, warn, on, throttle } from '../utils'
import { InitOptions, UploadType } from '../../types'

interface ConfigInit {
  immediate: boolean
}

const defOptions = {
  limit: 30
}

const ERROR_LIMIT = 15
const IDLE_TIME = 30000

export class Tracker {
  private queue: any[]
  private options: InitOptions
  private errorCount = 0
  private isIdle = false
  constructor(options: InitOptions) {
    this.options = Object.assign({}, defOptions, options)
    this.initIdleTimer()
  }
  track(data, uploadType: UploadType, config?: ConfigInit) {
    const { debug, disable } = this.options
    const commonInfo = getCommonInfo(this.options, uploadType)
    const info = Object.assign({}, commonInfo, data)

    if (debug) {
      console.log('[monitor track]:', info)
    }

    if (disable) return

    if (config && config.immediate) {
      this.send([info])
    } else {
      this.queue.push(info)
      this.checkSend()
    }
  }
  private checkSend() {
    const { limit, disable } = this.options
    if (disable) return

    if (this.queue.length >= limit || this.isIdle) {
      const buffer = this.queue.splice(0, limit)
      this.send(buffer)
    }
  }
  private send(data: any[]) {
    const { url, disable } = this.options
    if (disable) return

    if (this.errorCount >= ERROR_LIMIT) {
      warn('reached errorLimit:', ERROR_LIMIT)
      return
    }

    http(
      url,
      data,
      function success() {
        // reset
        this.errorCount = 0
      },
      function error() {
        this.errorCount++
        this.queue = data.concat(this.queue)
      }
    )
  }
  private initIdleTimer() {
    let timer
    const handler = () => {
      this.isIdle = false
      clearTimeout(timer)

      timer = setTimeout(() => {
        this.isIdle = true
        this.checkSend()
      }, IDLE_TIME)
    }
    handler() // 启动

    // IDLE_TIME内无以下事件发生, 判定为进入idle状态
    ;['mousemove', 'mousedown', 'mousewheel', 'keyup', 'touchstart', 'scroll'].forEach(event => {
      on(document, event, throttle(handler, 300))
    })
  }
  getWaiting2SendData(): any[] {
    return this.queue.splice(0)
  }
}
