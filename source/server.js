const WebSocket = require('ws')
const http = require('http')
const hookPort = 8813
const wsPort = 9897 // todo: в переменных окружения

/**
 * Нода будет сама торчать в Интернет
 * ufw будет настроен на допуск запросов только с моего домашнего роутера
 */
const websocketServer = new WebSocket.Server({
  port: wsPort
})

websocketServer.broadcast = function broadcast(data) {
  websocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

websocketServer.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
  })

  ws.send('something')
})

const requestHandler = (request, response) => {
  websocketServer.broadcast('test')

  response.end()
}

const httpServer = http.createServer(requestHandler)
/**
 * хттп-сервер слушает запросы о новых сокращенных ссылках
 * при новом запросе с ним вместе с телом приходит инфа
 * эту инфу дальше бродкастим по вебсокетам всем клиентам
 */

httpServer.listen(hookPort, err => {
  if (err) {
    return console.log('Something bad happened', err)
  } else {

    console.log(`HTTP server is listening on ${hookPort}`)
  }
})
