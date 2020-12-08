const ctx1 = document.getElementById('dayChart').getContext('2d')
const dayChart = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Infections',
                backgroundColor: 'red',
                data: [],
            },
        ],
    },
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        min: 0,
                    },
                    scaleLabel: {
                        labelString: 'Infections',
                        display: true,
                    },
                },
            ],
            xAxes: [
                {
                    scaleLabel: {
                        labelString: 'Day',
                        display: true,
                    },
                },
            ],
        },
    },
})

socket.on('infections', (data) => {
    dayChart.data.labels = Array.from({ length: data.infections.length }, (x, i) => i + 1)
    dayChart.data.datasets[0].data = data.infections
    dayChart.update()
})

const ctx2 = document.getElementById('pieChart').getContext('2d')
const pieChart = new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: ['Susceptible', 'Infected', 'Removed'],
        datasets: [
            {
                data: [1, 0, 0],
                backgroundColor: ['green', 'red', 'blue'],
            },
        ],
    },
})

socket.on('pie', (data) => {
    pieChart.data.datasets[0].data = data
    pieChart.update()
})
