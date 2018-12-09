/**
 * Подключение библиотек, оформленных как CommonJS-модули, синтаксис
 * ES2015-моделй не используется по причине отсутствия поддержки такого
 * синтаксиса более старыми версиями Node.
 */
const I2CLCDConnection = require('lcdi2c')
const WebSocket = require('ws')

/**
 * Задание константы с адресом I2C чипа, для определения этого адреса, нужно
 * подключиться к Raspberry Pi по SSH или другим удобным способом и отдать
 * команду i2cdetect 1.
 */
const I2C_ADDR = 0x3f

/**
 * Создание экземпляра соединения с дисплеем, передаются аргументы: поколение
 * Raspberry Pi, адрес I2C, ширина экрана и количество строк на нем.
 */
const lcdConnection = new I2CLCDConnection(1, I2C_ADDR, 16, 2)
lcdConnection.println('short.taxnuke.ru', 1)

/**
 * Создание нового вебсокет-соединения, подключение к хосту и порту из
 * переменных окружения WS_HOST и WS_PORT соответственно.
 */
const ws = new WebSocket(
  `ws://${process.env.WS_HOST}:${process.env.WS_PORT}`
)

/**
 * Навешивание обработчика на событие открытия соединения ws.
 */
ws.on('open', () => {
  lcdConnection.println('connected', 2)
  console.info('WebSocket connection established')
})

/**
 * Навешивание обработчика на событие закрытия соединения ws.
 */
ws.on('close', function close() {
  console.warn('WebSocket connection closed')
  lcdConnection.println('conn closed', 2)
})

/**
 * Навешивание обработчика на событие получения нового сообщения по ws
 */
ws.on('message', data => {
  console.log(data)

  lcdConnection.clear()

  try {
    // В случае успешного разбора сериализованных данных, они выводятся на экран
    data = JSON.parse(data)
  } catch (e) {
    // Иначе в поток ошибок, и на экран идет сообщение об ошибке.
    console.error(data)
  } finally {
    lcdConnection.println('short.taxnuke.ru', 1)
    lcdConnection.println(
      `links: ${data.link_count || 'Error =('}`,
      2
    )
  }
})

