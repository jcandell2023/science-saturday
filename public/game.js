let socket = io()

const urlParams = new URLSearchParams(window.location.search)

const name = urlParams.get('username')

socket.emit('join', { name })

$('#name').text(name)

socket.on('users', (data) => {
    $('.users').html('')
    for (let user in data.users) {
        $('.users').append(
            $('<option>').text(data.users[user].name).val(data.users[user].id)
        )
    }
})

$('#infect-button').click(() => {
    infect($('#infect1').val())
    infect($('#infect2').val())
    $('#infect').hide()
    $('#infected').show()
})

socket.on('infected', () => {
    $('#healthy').hide()
    $('#infect').show()
})

function infect(id) {
    socket.emit('infect', { id })
}
