/**
 * Подключение библиотеки ws, оформленной как CommonJS-модули, синтаксис
 * ES2015-моделй не используется по причине отсутствия поддержки такого
 * синтаксиса более старыми версиями Node.
 */
const WebSocket = require('ws')

/**
 * Установление соединения с базой данных MongoDB посредствам официального
 * нативного драйвера, функциональная природа JavaScript позволяет в одну строку
 * подключить библиотеку, обратиться к синглтону клиента БД, и вызвать функцию
 * подключения, которая в свою очередь возвращает Promise - специальный объект
 * для упрощения работы с асинхронным кодом (чтобы не использовать вложенные
 * коллбэки).
 */
const url = `mongodb://localhost:${process.env.MONGO_PORT}`
require('mongodb').MongoClient
  .connect(url)
  .then(mongoConnection => {
    let latestData = null

    /**
     * Далее после успешного подключения происходит создание экземпляра
     * http-сервера, и websocket-сервера, @2, первый используется для
     * прослушивания вебхуков (легковесных http-запросов в роли уведомлений).
     * Порты оба сервера получают из переменных окружения, выставлением которых
     * занимается утилита развертывания, встроенная в pm2.
     */
    const httpServer = require('express')()
    const websocketServer = new WebSocket.Server({
      port: process.env.WS_PORT
    })

    /**
     * Добавление метода вещания для сервера websocket.
     * Эта функция по сути рассылает всем активным клиентам данные, которые в
     * нее передали.
     */
    websocketServer.broadcast = function broadcast(data) {
      console.info(`broadcasting ${JSON.stringify(data)}...`)

      websocketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data)
        }
      })
    }

    /**
     * Создание нового обработчика события при подключении нового клиента.
     * Клиенту отправляется тестовое сообщение
     */
    websocketServer.on('connection', function connection(ws) {
      ws.send('hi')

      setTimeout(() => {
        /**
         * И через 3 секунды последние актуальные данные.
         */
        ws.send(latestData)
      }, 3000)
    })

    /**
     * Навешивание обработчика запросов любым методом в любой эндпоинт
     */
    httpServer.use('*', (req, res) => {

      /**
       * Обращение к базе с целью подсчета сокращенных ссылок, далее
       * формируется объект и он передается всем клиентам websocket-сервера.
       */
      mongoConnection.db('url-shortener').collection('aliases')
        .countDocuments()
        .then(count => {
          res.end()

          const data = JSON.stringify({
            link_count: count
          })

          websocketServer.broadcast(data)

          latestData = data
        })
        .catch(console.error)
    })

    /**
     * Просшуливание веб-хуков на порту из переменной окружения HOOK_PORT.
     */
    const hookPort = process.env.HOOK_PORT

    httpServer.listen(hookPort)
      .on('listening', () => {
        console.log('proverka')
        console.log(`HTTP server listening on port ${hookPort}`)
      })
  })
  .catch(console.error)
