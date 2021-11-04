import Cookies from 'js-cookie'
import { InitOptions, UploadType } from '../../types'

const screen = (() => {
  const { clientWidth, clientHeight } = document.documentElement
  return `${clientWidth}x${clientHeight}`
})()

let uuid
export function getCommonInfo(options: InitOptions, uploadType: UploadType) {
  const { userId, userName, appKey, appVersion } = options
  if (!uuid) {
    uuid = Cookies.get('monitor_uuid')
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
