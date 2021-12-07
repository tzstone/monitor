export type XhrDetail = {
  delay: number
  xhr: XMLHttpRequest
  body?: string
  method: string
}

export type FetchDetail = {
  delay: number
  res: Response
  body?: string
  method: string
}

declare global {
  interface XMLHttpRequest {
    _responseURL: string
    _requestUrl: string
    _requestMethod: string
  }
}
