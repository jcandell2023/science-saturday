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
let susceptible = []
let infected = []
let removed = []

function User(id, name) {
    return { id, name, infected: false }
}

function getPieData() {
    let sus = susceptible.length
    let inf = infected.length
    let rem = removed.length
    return [sus, inf, rem]
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
        susceptible.push(users[socket.id])
        io.emit('pie', getPieData())
        io.to(adminId).emit('users', {
            susceptible,
            infected,
            removed,
            num: Object.keys(users).length,
        })
    })

    socket.on('admin-join', () => {
        if (adminId) {
            socket.emit('reset')
        } else {
            adminId = socket.id
            io.to(adminId).emit('users', {
                susceptible,
                infected,
                removed,
                num: Object.keys(users).length,
            })
        }
    })

    socket.on('infect', () => {
        if (Object.keys(users).length < 5) {
            let id = getRandUser()
            if (!users[id].infected) {
                users[id].infected = true
                io.to(id).emit('infected')
                dailyInfections[day]++
                socket.emit('personAffected', { name: users[id].name, infected: true })
                susceptible = susceptible.filter((user) => user.id != id)
                infected.push(users[id])
            } else {
                socket.emit('personAffected', { name: users[id].name, infected: false })
            }
        } else {
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
                susceptible = susceptible.filter((user) => user.id != id1)
                infected.push(users[id1])
            } else {
                socket.emit('personAffected', { name: users[id1].name, infected: false })
            }
            if (!users[id2].infected) {
                users[id2].infected = true
                io.to(id2).emit('infected')
                dailyInfections[day]++
                socket.emit('personAffected', { name: users[id2].name, infected: true })
                susceptible = susceptible.filter((user) => user.id != id2)
                infected.push(users[id2])
            } else {
                socket.emit('personAffected', { name: users[id2].name, infected: false })
            }
        }
        removed.push(users[socket.id])
        infected = infected.filter((user) => user.id !== socket.id)
        io.to(adminId).emit('users', {
            susceptible,
            infected,
            removed,
            num: Object.keys(users).length,
        })
        io.emit('pie', getPieData())
    })

    socket.on('start', () => {
        if (socket.id == adminId && dayTimer == null) {
            const infectedID = getRandUser()
            users[infectedID].infected = true
            infected.push(users[infectedID])
            susceptible = susceptible.filter((user) => user.id != infectedID)
            io.to(infectedID).emit('infected')
            console.log('Simulation has started')
            dayTimer = setInterval(newDay, 10000)
            io.to(adminId).emit('users', {
                susceptible,
                infected,
                removed,
                num: Object.keys(users).length,
            })
            io.emit('pie', getPieData())
        }
    })

    socket.on('reset', () => {
        if (socket.id == adminId) {
            clearInterval(dayTimer)
            dayTimer = null
            day = 0
            dailyInfections = [1]
            susceptible = []
            removed = []
            infected = []
            for (let id in users) {
                users[id].infected = false
                susceptible.push(users[id])
            }
            io.emit('newGame')
            io.emit('infections', { infections: [] })
            io.to(adminId).emit('users', {
                susceptible,
                infected,
                removed,
                num: Object.keys(users).length,
            })
        }
    })

    socket.on('stop', () => {
        if (socket.id == adminId) {
            clearInterval(dayTimer)
        }
    })

    socket.on('disconnect', () => {
        if (socket.id == adminId) {
            adminId = null
        } else {
            delete users[socket.id]
            susceptible = susceptible.filter((user) => user.id != socket.id)
            infected = infected.filter((user) => user.id != socket.id)
            removed = removed.filter((user) => user.id != socket.id)
            io.to(adminId).emit('users', {
                susceptible,
                infected,
                removed,
                num: Object.keys(users).length,
            })
            io.emit('pie', getPieData())
        }
    })
})

http.listen(port, console.log(`Server running on http://localhost:${port}`))
