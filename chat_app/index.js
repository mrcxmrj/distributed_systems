const net = require("net")

const address = "127.0.0.1"
const port = "9000"

const server = net.createServer()
server.listen(port, address, () => console.log(`Server is listening on port ${port}`))

server.on('connection', socket => console.log(`New connnection from ${socket}`))
server.on('close', () => console.log("Closing server"))
