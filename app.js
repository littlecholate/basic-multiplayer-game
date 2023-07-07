const express = require('express')
const app = express()

// create http server at the backend (since socket.io does not accept express server)
const http = require('http')
const server = http.createServer(app)
// socket.io setup
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })
// the frontend should ping the backend about every 2s, timeout if the response is invalid over 5s (at lease ping 3 times)

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backendPlayers = {}

io.on('connection', (socket) => {
  console.log('a user connected')
  backendPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${360 * Math.random()}, 100%, 50%)`,
    sequenceNumber: 0
  }

  // broadcast msg to others whenever a new player comes in
  io.emit('updatePlayers', backendPlayers)

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backendPlayers[socket.id]
    io.emit('updatePlayers', backendPlayers)
  })

  const SPEED = 10
  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    backendPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'KeyW':
        backendPlayers[socket.id].y -= SPEED
        break
      case 'KeyA':
        backendPlayers[socket.id].x -= SPEED
        break
      case 'KeyS':
        backendPlayers[socket.id].y += SPEED
        break
      case 'KeyD':
        backendPlayers[socket.id].x += SPEED
        break
    }
  })
})

// emit players positions
setInterval(() => {
  io.emit('updatePlayers', backendPlayers)
}, 15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server did load')
