const WebSocket = require('ws')
const http = require('http')

/**
 * Нода будет сама торчать в Интернет
 * ufw будет настроен на допуск запросов только с моего домашнего роутера
 */
const websocketServer = new WebSocket.Server({
  port: process.env.WS_PORT
})

websocketServer.broadcast = function broadcast(data) {
  websocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

websocketServer.on('connection', function connection(ws) {
  ws.send('hi')
})

/**
 * хттп-сервер слушает запросы о новых сокращенных ссылках
 * при новом запросе с ним вместе с телом приходит инфа
 * эту инфу дальше бродкастим по вебсокетам всем клиентам
 */
const httpServer = http.createServer((request, response) => {
  websocketServer.broadcast('_msg_')
  response.end()
})


const hookPort = process.env.HOOK_PORT

httpServer.listen(hookPort, err => {
  if (err) {
    return console.error('Something bad happened', err)
  } else {

    console.log(`HTTP server is listening on ${hookPort}`)
  }
})
