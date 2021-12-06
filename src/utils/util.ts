export function genUuid() {
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  const uuid = s.join('')
  return uuid
}

import Cookies from 'js-cookie'

export const uuidCache = {
  get(): string {
    return Cookies.get('monitor_uuid')
  },
  set(): void {
    Cookies.set('monitor_uuid', genUuid(), { expires: new Date(9999, 11, 31) }) // 永不过期
  }
}

const defUserInfo = {
  userId: '',
  userName: ''
}
// 可能在运行期间改变, 不做缓存
export function getUserInfo(): { userId; userName } {
  let info: any = localStorage.getItem('monitorUserInfo')
  try {
    if (info) {
      info = JSON.parse(info)
    } else {
      info = defUserInfo
    }
  } catch (e) {
    info = defUserInfo
  }
  return info
}
