const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io() // create a connection to the backend when calling io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontendPlayers = {}

// listen to the broadcast topic
socket.on('updatePlayers', (backendPlayers) => {
  // add any player if connect
  for (const id in backendPlayers) {
    const backendPlayer = backendPlayers[id]

    if (!frontendPlayers[id]) {
      frontendPlayers[id] = new Player({
        x: backendPlayer.x,
        y: backendPlayer.y,
        radius: 10,
        color: backendPlayer.color
      })
    }
  }

  // check if any player disconnect
  for (const id in frontendPlayers) {
    if (!backendPlayers[id]) {
      delete frontendPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontendPlayers) {
    const player = frontendPlayers[id]
    player.draw()
  }
}

animate()
