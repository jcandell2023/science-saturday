const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static('public'))

const port = process.env.PORT || 5000

const users = {}
let day = 1

function User(id, name) {
    return { id, name, infected: false }
}

function getRandUser() {
    const keys = Object.keys(users)
    const randInd = Math.floor(keys.length * Math.random())
    const randKey = keys[randInd]
    return users[randKey]
}

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        users[socket.id] = User(socket.id, data.name)
        io.emit('users', { users, day })
        if (Object.keys(users).length == 5) {
            const infected = getRandUser()
            infected.infected = true
            io.to(infected.id).emit('infected')
            console.log('someone is infected')
        }
    })

    socket.on('infect', (data) => {
        if (!users[data.id].infected && data.id != socket.id) {
            users[data.id].infected = true
            io.to(data.id).emit('infected')
            io.emit('users', { users, day })
        }
    })

    socket.on('disconnect', () => {
        delete users[socket.id]
        io.emit('users', { users, day })
    })
})

http.listen(port, console.log(`Server running on http://localhost:${port}`))
