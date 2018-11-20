const I2CLCDConnection = require('lcdi2c')
const WebSocket = require('ws')

/**
 * адрес, в консоли `i2cdetect 1` для обнаружения чипов I2C
 */
const I2C_ADDR = 0x3f

/**
 * устройство: 0 для старой ревизии, 1 для новой ревизии.
 * адрес устройства I2C
 * колонки: 16 или 20
 * ряды: 2 или 4
 */
const lcdConnection = new I2CLCDConnection(1, I2C_ADDR, 16, 2)
lcdConnection.println('short.taxnuke.ru', 1)

const ws = new WebSocket(`ws://${process.env.WS_HOST}:${process.env.WS_PORT}`)

ws.on('open', () => {
  lcdConnection.println('connected', 2)
  console.info('WebSocket connection established')
})

ws.on('close', function close() {
  console.warn('WebSocket connection closed')
  lcdConnection.println('conn closed', 2)
})

ws.on('message', data => {
  console.log(data)

  try {
    data = JSON.parse(data)
  } catch (e) {
    console.error(data)
  } finally {
    lcdConnection.println(`links: ${data.link_count || 'Error =('}`, 2)
  }
})

