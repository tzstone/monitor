export type InitOptions = {
  limit?: number
  url: string
  appKey: string
  appVersion?: string
  userId: string
  userName?: string
  debug?: boolean
  plugins?: any[]
}

export interface Tracker {
  getNotSentData(): any[]
  track(data, uploadType: UploadType, options?: { [key: string]: any }): void
}

export interface Monitor {
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
  JsError = 'JS_ERROR',
  ResourceError = 'RESOURCE_ERROR',
  RequestError = 'REQUEST_ERROR',
  History = 'HISTORY',
  ResponseTime = 'RESPONSE_TIME'
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
