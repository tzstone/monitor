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
