import {app} from './app'
import * as _io from 'socket.io'
import {createServer} from 'http'
const server = createServer(app)
const io = _io(server)

io.on('connection', (socket) => {
  console.log('socket started on server')

  socket.on('hello-world', () => {
    console.log('hello world back')
  })
})

server.listen(3000, ()=> {
  console.log('server is listening on port 3000')
})