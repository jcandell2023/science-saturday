const ctx = document.getElementById('myChart').getContext('2d')
const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Infections',
                backgroundColor: '#FF0000',
                data: [],
            },
        ],
    },
    options: {},
})

socket.on('infections', (data) => {
    chart.data.labels.push(chart.data.labels.length + 1)
    chart.data.datasets[0].data = data.infections
    chart.update()
})
