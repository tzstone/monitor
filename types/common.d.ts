export interface InitOptions {
  limit?: number
  url: string
  appKey: string
  appVersion?: string
  userId: string
  userName?: string
}

export interface Tracker {
  getNotSentData(): any[]
  track(data, options?: { [key: string]: any }): void
}

export interface Monitor {
  options: InitOptions
  $tracker: Tracker
  track(data, options?: { [key: string]: any }): void
}

export interface CommonInfo {
  userId?: string
  userName?: string
  // customerKey: string // 用户唯一标识
  appKey: string
  appVersion?: string
  // uploadType: string // 日志类型
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
  History = 'HISTORY'
}
