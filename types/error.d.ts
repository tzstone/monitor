export interface JsErrorInfo {
  errorMsg: string
  errorUrl: string
  errorLine?: number
  errorCol?: number
  errorStack?: string | null
  errorType: string
}

export interface VueErrorInfo extends JsErrorInfo {
  componentName: string
  trace: string
}

export interface ResourceErrorInfo {
  errorMsg: string
  errorUrl: string
  errorType: string // link, script, img
}

export interface RequestErrorInfo {
  errorUrl: string
  errorStatus: number
  errorStatusText: string
  errorResponseText: string
  errorDelay: number
}
