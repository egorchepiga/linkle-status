const WebSocket = require('ws')
const hookPort = process.env.HOOK_PORT

let latestCount = null

// todo: такой порт монги на дэве только
const url = `mongodb://localhost:${process.env.MONGO_PORT}`;

require('mongodb').MongoClient
  .connect(url)
  .then(mongoConnection => {
    const server = require('express')()

    server.use('*', (req, res, next) => {
      mongoConnection.db('url-shortener').collection('aliases')
        .countDocuments
        .then(count => {
          latestCount = count
          console.log(count + 'доков всего сокращено')
          websocketServer.broadcast(JSON.stringify({ link_count: count }))

          res.end()
        })
        .catch(console.error)
    })

    server.listen(hookPort)
      .on('listening', () => {
        console.log(`HTTP server for hooks is listening on ${hookPort}`)
      })
  })
  .catch(console.error);

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

  setTimeout(() => {
    ws.send(latestCount)
  }, 3000)
})
