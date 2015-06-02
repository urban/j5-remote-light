import http from 'http'
import socketIo from 'socket.io'
import fs from 'fs'
import five from 'johnny-five'

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'

const app = http.createServer(handler)
const io = socketIo(app)
const port = process.env.PORT || 3000
const board = new five.Board({ repl: isDev })

// declare led variable
let led

// start app
app.listen(port)
console.log(`Starting app on port: ${port}`)

board.on('ready', () => {
  // initialize LED to pin 13
  led = new five.Led(13)

  if (isDev) {
    // inject LED into REPL
    board.repl.inject({ led })
  }
})

io.on('connection', (socket) => {
  socket.on('on', () => {
    if (board.isReady) {
      console.log('State = ON')
      led.on()
    }
  })
  socket.on('off', () => {
    if (board.isReady) {
      console.log('State = OFF')
      led.off()
    }
  })
})

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
    (err, data) => {
      if (err) {
        res.writeHead(500)
        return res.end('Error loading index.html')
      }

      res.writeHead(200)
      res.end(data)
    })
}
