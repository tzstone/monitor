export type InitOptions = {
  limit?: number
  url: string
  appKey: string
  appVersion?: string
  debug?: boolean
  plugins?: any[]
  errorLimit?: number
  disable?: boolean // TODO:
}

export class Tracker {
  getNotSentData(): any[]
  track(data, uploadType: UploadType, options?: { [key: string]: any }): void
}

export class Monitor {
  options: InitOptions
  $tracker: Tracker
  track(data, uploadType: UploadType, options?: { [key: string]: any }): void
}

export interface CommonInfo {
  userId?: string
  userName?: string
  // customerKey: string // 用户唯一标识
  appKey: string
  appVersion?: string
  uploadType: string // 日志类型
  happenTime: number
  url: string // 页面url
  screen: string
  ua: string
  // deviceName: string // 设备名称
  // os: string // 系统信息
  // browserName: string // 浏览器名称
  // browserVersion: string // 浏览器版本
}

export enum UploadType {
  JsError = 'ERROR_JS',
  ResourceError = 'ERROR_RESOURCE',
  RequestError = 'ERROR_REQUEST',
  History = 'HISTORY',
  ResponseTime = 'RESPONSE_TIME',
  Performance = 'PERFORMANCE'
}

export type ViewModel = {
  _isVue: boolean
  $root: ViewModel
  $parent?: ViewModel
  $props: { [key: string]: any }
  $options: {
    name?: string
    propsData?: { [key: string]: any }
    _componentTag?: string
    __file?: string
  }
}

export type Plugin = {
  install(monitor: Monitor): void
}
