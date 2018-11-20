const I2CLCDConnection = require('lcdi2c')
const WebSocket = require('ws')

// todo: пояснить магические числа
const lcdConnection = new I2CLCDConnection(1, 0x3f, 16, 2)
lcdConnection.println('short.taxnuke.ru', 1)

const ws = new WebSocket(`ws://${process.env.WS_HOST}:${process.env.WS_PORT}`)

ws.on('open', () => {
  // вывести на экран, что соединение установлено
  lcdConnection.println('connected', 2)
  console.log('WebSocket connection established')
})

ws.on('close', function close() {
  // вывести на экран, что соединение разорвано (-лось?)
  console.log('WebSocket connection closed')
})

ws.on('message', data => {
  try {
    console.log(data)
    data = JSON.parse(data)
    lcdConnection.println(`links: ${data.link_count}`, 2)
  } catch (e) {
    console.error(data)
  }
})

