import {app} from './app'
import * as _io from 'socket.io'
import {createServer} from 'http'
import {v4 as uuid} from 'uuid'

const server = createServer(app)
const io = _io(server)
interface PlayerSocket extends _io.Socket {
  x: number
  y: number
  spdX: number
  spdY: number
  id: string
  number: number
}

const socketList:Record<string, PlayerSocket> = {}

io.on('connection', (socket: PlayerSocket) => {
  const id = uuid()
  console.log(`socket ${id} connected`)
  socket.x = Math.random() * 500
  socket.y = Math.random() * 500
  socket.spdY = 5
  socket.spdX = 10
  socket.id = id
  socket.number = Math.floor(Math.random() * 100)
  socketList[id] = socket
  socket.on('disconnect', () => {
    console.log(`socket ${id} disconnected`)
    delete socketList[id]
  })
})

interface PlayerPosition {
  x: number
  y: number
  spdX: number
  spdY: number
} 
function updatePosition(currentPosition: PlayerPosition): PlayerPosition {
  let {x,y, spdX, spdY} = currentPosition
  
  if(x >= 500){
    spdX = -30
    // spdY = - 5
  } 
  if(x <= 0){
    spdX = 30
  }
  if(y >= 500){
    spdY = -5
  }
  if(y <= 0){
    spdY = 5
  }
  return {x: x+spdX, y: y+spdY, spdX, spdY }
}
setInterval(() => {
  let pack = []
  for(let key in socketList){
    const socket = socketList[key]
    const currentPlayerPosition:PlayerPosition = {x: socket.x, y: socket.y, spdX: socket.spdX, spdY: socket.spdY}
    const newPlayerPosition:PlayerPosition = updatePosition(currentPlayerPosition)
    socketList[key] = Object.assign(socket, newPlayerPosition)
    
    pack.push({id: socket.id, number: socket.number,x:socket.x, y:socket.y})
  }
  for(let key in socketList){
    const socket = socketList[key]
    socket.emit('players', pack)
  }
}, 1000/25)

server.listen(3000, ()=> {
  console.log('server is listening on port 3000')
})