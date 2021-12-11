export function http(url: string, data: any[], success?, error?) {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success && success()
      } else {
        error && error()
      }
    }
  }
  xhr.open('POST', url, true) // 异步
  // setRequestHeader需在 open 和 send 之间调用
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify(data))
}
