import { UploadType } from './index'

export interface JsErrorInfo {
  errorMsg: string
  errorUrl: string
  errorLine?: number
  errorCol?: number
  errorStack?: string | null
  errorType: string
  uploadType: UploadType
}

export interface ResourceErrorInfo {
  errorMsg: string
  errorUrl: string
  errorType: string // link, script, img
  uploadType: UploadType
}

export interface RequestErrorInfo {
  errorUrl: string
  errorStatus: number
  errorStatusText: string
  errorResponseText: string
  errorDelay: number
  uploadType: UploadType
}
