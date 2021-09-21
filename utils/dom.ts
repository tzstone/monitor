export const on = (function () {
  if (document.addEventListener) {
    return function (
      el: Window | Document | HTMLElement,
      event: string,
      handler: EventListenerOrEventListenerObject,
      capture = false
    ) {
      el.addEventListener(event, handler, capture)
    }
  } else {
    return function (el: Window | Document | HTMLElement, event: string, handler: EventListenerOrEventListenerObject) {
      el['attachEvent']('on' + event, handler)
    }
  }
})()

export const off = (function () {
  if (document.addEventListener) {
    return function (
      el: Window | Document | HTMLElement,
      event: string,
      handler: EventListenerOrEventListenerObject,
      capture = false
    ) {
      el.removeEventListener(event, handler, capture)
    }
  } else {
    return function (el: Window | Document | HTMLElement, event: string, handler: EventListenerOrEventListenerObject) {
      el['detachEvent']('on' + event, handler)
    }
  }
})()

export function eventTrigger(type: string, detail: any) {
  const event = new CustomEvent(type, { detail })
  window.dispatchEvent(event)
}
