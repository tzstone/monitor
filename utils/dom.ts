export const on = (function () {
  if (document.addEventListener) {
    return function (event: string, handler: EventListenerOrEventListenerObject, capture = false) {
      window.addEventListener(event, handler, capture)
    }
  } else {
    return function (event: string, handler: EventListenerOrEventListenerObject) {
      window['attachEvent']('on' + event, handler)
    }
  }
})()

export const off = (function () {
  if (document.addEventListener) {
    return function (event: string, handler: EventListenerOrEventListenerObject, capture = false) {
      window.removeEventListener(event, handler, capture)
    }
  } else {
    return function (event: string, handler: EventListenerOrEventListenerObject) {
      window['detachEvent']('on' + event, handler)
    }
  }
})()

export function eventTrigger(type: string, detail: any) {
  const event = new CustomEvent(type, { detail })
  window.dispatchEvent(event)
}
