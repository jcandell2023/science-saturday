const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static('public'))

const port = process.env.PORT || 5000

const users = {}
let day = 0
let dailyInfections = [1]
let dayTimer = null
let adminId = null

function User(id, name) {
    return { id, name, infected: false }
}

function getRandUser() {
    const keys = Object.keys(users)
    const randInd = Math.floor(keys.length * Math.random())
    const randKey = keys[randInd]
    return randKey
}

function newDay() {
    day++
    io.emit('infections', { infections: dailyInfections })
    dailyInfections.push(0)
}

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        users[socket.id] = User(socket.id, data.name)
        io.to(adminId).emit('users', { users, day })
    })

    socket.on('admin-join', () => {
        if (adminId) {
            socket.emit('reset')
        } else {
            adminId = socket.id
            socket.emit('users', { users, day })
        }
    })

    socket.on('infect', () => {
        let id1 = getRandUser()
        while (id1 == socket.id) {
            id1 = getRandUser()
        }
        let id2 = getRandUser()
        while (id2 == socket.id || id1 === id2) {
            id2 = getRandUser()
        }
        if (!users[id1].infected) {
            users[id1].infected = true
            io.to(id1).emit('infected')
            dailyInfections[day]++
            socket.emit('personAffected', { name: users[id1].name, infected: true })
        } else {
            socket.emit('personAffected', { name: users[id1].name, infected: false })
        }
        if (!users[id2].infected) {
            users[id2].infected = true
            io.to(id2).emit('infected')
            dailyInfections[day]++
            socket.emit('personAffected', { name: users[id2].name, infected: true })
        } else {
            socket.emit('personAffected', { name: users[id2].name, infected: false })
        }
        io.to(adminId).emit('users', { users, day })
    })

    socket.on('start', () => {
        if (socket.id == adminId && dayTimer == null) {
            const infected = getRandUser()
            users[infected].infected = true
            io.to(infected).emit('infected')
            console.log('Simulation has started')
            dayTimer = setInterval(newDay, 10000)
            io.to(adminId).emit('users', { users, day })
        }
    })

    socket.on('reset', () => {
        if (socket.id == adminId) {
            clearInterval(dayTimer)
            dayTimer = null
            day = 0
            dailyInfections = [1]
            for (let id in users) {
                users[id].infected = false
            }
            io.emit('newGame')
        }
    })

    socket.on('disconnect', () => {
        if (socket.id == adminId) {
            adminId = null
        } else {
            delete users[socket.id]
            io.to(adminId).emit('users', { users, day })
        }
    })
})

http.listen(port, console.log(`Server running on http://localhost:${port}`))
