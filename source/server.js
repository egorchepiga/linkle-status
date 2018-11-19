const express = require('express')
const WebSocket = require('ws')

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

const app = express()

/**
 * хттп-сервер слушает запросы о новых сокращенных ссылках
 * при новом запросе с ним вместе с телом приходит инфа
 * эту инфу дальше бродкастим по вебсокетам всем клиентам
 */
app.use('*', (req, res, next) => {
  websocketServer.broadcast(req.query)

  res.end()
})


const hookPort = process.env.HOOK_PORT

app.listen(hookPort)
  .on('listening', () => {
    console.log(`HTTP hook is listening on ${hookPort}`)
  })
