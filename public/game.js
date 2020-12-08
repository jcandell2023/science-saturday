let socket = io()

const urlParams = new URLSearchParams(window.location.search)

const name = urlParams.get('username')

if (name === '!!ADMIN!!') {
    socket.emit('admin-join')
    $('#healthy').hide()
    $('#admin').show()
} else {
    socket.emit('join', { name })
}

socket.on('reset', () => {
    window.location = '/'
})

$('.name').text(name)

socket.on('users', (data) => {
    $('.users').html('')
    for (let user in data.infected) {
        $('.users').append(
            $('<li>').text(data.infected[user].name).addClass('text-danger')
        )
    }
    for (let user in data.susceptible) {
        $('.users').append(
            $('<li>').text(data.susceptible[user].name).addClass('text-success')
        )
    }
    for (let user in data.removed) {
        $('.users').append(
            $('<li>').text(data.removed[user].name).addClass('text-primary')
        )
    }
    $('#numPeople').text(data.num)
})

socket.on('personAffected', (data) => {
    if (data.infected) {
        $('#affected').append($('<p>').text(`You successfully infected ${data.name}`))
    } else {
        $('#affected').append(
            $('<p>').text(
                `You attempted to infect ${data.name}, but failed because they were already infected`
            )
        )
    }
})

$('#infect-button').click(() => {
    socket.emit('infect')
    $('#infect').hide()
    $('#healthy').hide()
    $('#infected').show()
    $('#affected').html('')
})

socket.on('infected', () => {
    $('#healthy').hide()
    $('#infect').show()
    $('#infected').hide()
})

socket.on('newGame', () => {
    if (name !== '!!ADMIN!!') {
        $('#healthy').show()
        $('#infect').hide()
        $('#infected').hide()
    }
})

function infect(id) {
    socket.emit('infect', { id })
}

$('#start-button').click(() => {
    socket.emit('start')
})

$('#stop-button').click(() => {
    socket.emit('stop')
})

$('#reset-button').click(() => {
    socket.emit('reset')
})
