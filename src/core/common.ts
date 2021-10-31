import { InitOptions, UploadType } from '../types'

const screen = (() => {
  const { clientWidth, clientHeight } = document.documentElement
  return `${clientWidth}x${clientHeight}`
})()

export function getCommonInfo(options: InitOptions, uploadType: UploadType) {
  const { userId, userName, appKey, appVersion } = options
  return {
    userId,
    userName,
    appKey,
    appVersion,
    happenTime: +new Date(),
    url: window.location.href,
    screen,
    uploadType,
    ua: navigator.userAgent
  }
}