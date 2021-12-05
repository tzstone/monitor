import { InitOptions, UploadType } from '../../types'
import { uuidCache, getUserInfo } from '../utils'

const screen = (() => {
  const { width, height } = window.screen
  return `${width}x${height}`
})()

let uuid
export function getCommonInfo(options: InitOptions, uploadType: UploadType) {
  const { userId, userName } = getUserInfo()
  const { appKey, appVersion } = options
  if (!uuid) {
    uuid = uuidCache.get()
  }

  return {
    userId,
    userName,
    appKey,
    appVersion,
    happenTime: +new Date(),
    url: window.location.href,
    screen,
    uploadType,
    ua: navigator.userAgent,
    uuid // 访客唯一标识, 可以与userId进行关联
  }
}
