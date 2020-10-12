import { createServer } from 'http'

import * as _io from 'socket.io'
import { v4 as uuid } from 'uuid'

import { app } from './app'

const server = createServer(app)
const io = _io(server)
interface GameState {
  players: Record<string, Player>
  bullets: Record<string, Bullet>
}
interface BoardPosition {
  x: number
  y: number
  xSpd: number
  ySpd: number
}

type Bullet = BoardPosition
type Player = BoardPosition
const activeSockets: Record<string, _io.Socket> = {}
const gameState: GameState = {
  players: {},
  bullets: {},
}
function Player(x: number, y: number): Player {
  return { x, y, xSpd: 10, ySpd: 5 }
}

io.on('connection', (socket: _io.Socket) => {
  const id = uuid()
  socket.id = id

  activeSockets[id] = socket
  gameState.players[id] = Player(0, 0)
  console.log(`socket ${id} connected`)
  socket.emit('connected', { id: id })
  socket.on('disconnect', () => {
    console.log(`socket ${id} disconnected`)
    delete activeSockets[id]
  })

  socket.on('playerMoved', ({ id, direction }) => {
    console.log('player pre move', gameState.players[id])
    const player = gameState.players[id]

    gameState.players[id] = {
      ...player,
      ...updatePlayerPosition(player, direction),
    }
    console.log('player post move', gameState.players[id])
  })
})

function updateBulletPosition(currentPosition: BoardPosition): BoardPosition {
  const { x, y } = currentPosition
  let { xSpd, ySpd } = currentPosition

  if (x >= 500) {
    xSpd = -30
  } else if (x <= 0) {
    xSpd = 30
  }
  if (y >= 500) {
    ySpd = -5
  } else if (y <= 0) {
    ySpd = 5
  }
  return { x: x + xSpd, y: y + ySpd, xSpd: xSpd, ySpd: ySpd }
}
function updatePlayerPosition(
  currentPosition: BoardPosition,
  direction: string
): BoardPosition {
  const { x, y } = currentPosition
  const { xSpd, ySpd } = currentPosition
  let moveX = x
  let moveY = y
  const movements = {
    up: y - ySpd,
    down: y + ySpd,
    left: x - xSpd,
    right: x + xSpd,
  }
  console.log(direction, x, y, xSpd, ySpd)
  if (direction === 'left' || direction === 'right') {
    if (x > 0 && x < 500) {
      moveX = movements[direction]
    } else if (x <= 0) {
      moveX = movements['right']
    } else if (x >= 500) {
      moveX = movements['left']
    }
  } else if (direction === 'up' || direction === 'down') {
    if (y > 0 && y < 500) {
      moveY = movements[direction]
    } else if (y <= 0) {
      moveY = movements['right']
    } else if (y >= 500) {
      moveY = movements['left']
    }
  }
  return { x: moveX, y: moveY, xSpd: xSpd, ySpd: ySpd }
}
gameState.bullets = {
  test: {
    x: 0,
    y: 0,
    xSpd: 30,
    ySpd: 5,
  },
}
setInterval(() => {
  const { bullets } = gameState

  for (const key in bullets) {
    const bullet = bullets[key]
    bullets[key] = { ...bullet, ...updateBulletPosition(bullet) }
  }

  for (const key in activeSockets) {
    const socket = activeSockets[key]
    socket.emit('game-state-update', gameState)
  }
}, 1000 / 25)

server.listen(3000, () => {
  console.log('server is listening on port 3000')
})
