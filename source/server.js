const WebSocket = require('ws')
const hookPort = process.env.HOOK_PORT

/**
 * @1
 */
const url = `mongodb://localhost:${process.env.MONGO_PORT}`
require('mongodb').MongoClient
  .connect(url)
  .then(mongoConnection => {
    let latestData = null

    /**
     * @2
     */
    const httpServer = require('express')()
    const websocketServer = new WebSocket.Server({
      port: process.env.WS_PORT
    })

    /**
     * @3
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
     * @4
     */
    websocketServer.on('connection', function connection(ws) {
      ws.send('hi')

      setTimeout(() => {
        ws.send(latestData)
      }, 3000)
    })

    /**
     * @5
     */
    httpServer.use('*', (req, res) => {
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

    httpServer.listen(hookPort)
      .on('listening', () => {
        console.log('proverka')
        console.log(`HTTP server listening on port ${hookPort}`)
      })
  })
  .catch(console.error)
