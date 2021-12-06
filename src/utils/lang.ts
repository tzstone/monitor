import { getTag } from './object'

export function isObjectLike(obj): boolean {
  return typeof obj === 'object' && obj !== null
}

export function isPlainObject(obj): boolean {
  return getTag(obj) === '[object Object]'
}

// https://github.com/lodash/lodash/blob/master/isError.js
export function isError(obj): boolean {
  if (!isObjectLike(obj)) {
    return false
  }

  const tag = getTag(obj)
  return (
    tag === '[object Error]' ||
    tag === '[object DOMException]' ||
    (typeof obj.message === 'string' && typeof obj.name === 'string' && !isPlainObject(obj))
  )
}

export function isDevEnv(): boolean {
  return /^http(s)?:\/\/localhost/.test(location.href)
}
