/**
 * @0
 */
const I2CLCDConnection = require('lcdi2c')
const WebSocket = require('ws')

/**
 * @1
 */
const I2C_ADDR = 0x3f

/**
 * @2
 */
const lcdConnection = new I2CLCDConnection(1, I2C_ADDR, 16, 2)
lcdConnection.println('short.taxnuke.ru', 1)

/**
 * @3
 */
const ws = new WebSocket(
  `ws://${process.env.WS_HOST}:${process.env.WS_PORT}`
)

/**
 * @4
 */
ws.on('open', () => {
  lcdConnection.println('connected', 2)
  console.info('WebSocket connection established')
})

/**
 * @5
 */
ws.on('close', function close() {
  console.warn('WebSocket connection closed')
  lcdConnection.println('conn closed', 2)
})

/**
 * @6
 */
ws.on('message', data => {
  console.log(data)

  lcdConnection.clear()

  try {
    data = JSON.parse(data)
  } catch (e) {
    console.error(data)
  } finally {
    lcdConnection.println('short.taxnuke.ru', 1)
    lcdConnection.println(
      `links: ${data.link_count || 'Error =('}`,
      2
    )
  }
})

