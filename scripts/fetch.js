var targetDate = new Date('2020-10-27');
var selectedView = 'rms';
var selectedSensor = '00:13:A2:00:41:A8:5A:7C';
var chartOn = null;

const getRMS = document.querySelector('#sensor-data-rms');
getRMS.addEventListener('click', () =>  getSensorData('rms', targetDate, '00:13:A2:00:41:A8:5A:7C'), false);
const getMin = document.querySelector('#sensor-data-min');
getMin.addEventListener('click', () =>  getSensorData('min', targetDate, '00:13:A2:00:41:A8:5A:7C'), false);
const getMAX = document.querySelector('#sensor-data-max');
getMAX.addEventListener('click', () =>  getSensorData('max', targetDate, '00:13:A2:00:41:A8:5A:7C'), false);
const getHF1 = document.querySelector('#comp-1');
getHF1.addEventListener('click', () => getComparisonData(1));
const getHF2 = document.querySelector('#comp-2');
getHF2.addEventListener('click', () => getComparisonData(2));
const getHF3 = document.querySelector('#comp-3');
getHF3.addEventListener('click', () => getComparisonData(3));

const inputDate = document.querySelector('#target-date');
inputDate.addEventListener('change', () => console.log('target date changed'));
const prevDay = document.querySelector('#date-prev');
prevDay.addEventListener('click', () => {
    targetDate.setDate(targetDate.getDate() - 1);
    const t_date = new Date(targetDate).toISOString().slice(0, 10);
    console.log(t_date);
    inputDate.value = t_date;
    getSensorData(selectedView, t_date, selectedSensor);
});
const nextDay = document.querySelector('#date-next');
nextDay.addEventListener('click', () => {
    targetDate.setDate(targetDate.getDate() + 1);
    const t_date = new Date(targetDate).toISOString().slice(0, 10);
    console.log(t_date);
    inputDate.value = t_date;
    getSensorData(selectedView, t_date, selectedSensor);
});


const calendar = flatpickr('#target-date', {
    enableTime: false,
    dateFormat: "Y-m-d",
});
calendar.config.onChange.push( (selectedDate, dateStr, instance) => {
    targetDate = new Date(dateStr);
    const t_date = new Date(targetDate).toISOString().slice(0, 10);
    console.log(t_date);
    inputDate.value = t_date;
    getSensorData(selectedView, t_date, selectedSensor);
});

function drawChart(ctx, dataset, label, color) {
    console.log(dataset);
    const datasets =  [{
        data: dataset.x,
        label: label.x,
        borderColor: color.x,
        fill: false
    }, {
        data: dataset.y,
        label: label.y,
        borderColor: color.y,
        fill: false
    }, {
        data: dataset.z,
        label: label.z,
        borderColor: color.z,
        fill: false
    }];

    const config = {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        },
        options: {
            elements: {
                line: {
                    tension: 0.5,
                    borderWidth: 1
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                }],
                title: {
                    display: false,
                }
            }
        }
    };
    chartOn = new Chart(ctx, config);
}

function drawChartNoData(ctx) {
    const config = {
        type: 'line',
        data: {
            labels: [{ x: 'No Data'}],
            datasets: [{'x':0,'y':0}]
        },
        options: {
            elements: {
                line: {
                    tension: 0.5
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                }],
                title: {
                    display: false,
                }
            }
        }
    };
    chartOn = new Chart(ctx, config);
}


function getSensorData(viewOption, date, sensorId) {
    const target_date = new Date(date).toISOString().slice(0, 10);
    retrieve(target_date, sensorId).then( (data) => {
        if(chartOn != null){
            chartOn.destroy();
        }
        const ctx = document.querySelector("#line-chart").getContext('2d');
        const label = {
            rms: {
                x: 'rms_x',
                y: 'rms_y',
                z: 'rms_z'
            },
            min: {
                x: 'min_x',
                y: 'min_y',
                z: 'min_z'
            },
            max: {
                x: 'max_x',
                y: 'max_y',
                z: 'max_z'
            },
        };

        const color = {
            x: '#bae755',
            y: '#3e95cd',
            z: '#e755ba'
        };

        selectedView = viewOption;

        console.log(data);
        const {result} = data;
        let dataset;
        if (result.length == 0) {
            console.log("No data received");
            drawChartNoData(ctx);
            return;
        }

        const {gateway_id, sensor_id} = result[0];
        const rms_x = result.map(d => d.rms_x);
        const rms_y = result.map(d => d.rms_y);
        const rms_z = result.map(d => d.rms_z);
        const sensed_date = result.map(d => {
            return d.sensed_time.replace(" ", "T").concat("Z");
        });

        const date_rms_x = result.map(r => ({'x': r.sensed_time, 'y': r.rms_x}));
        const date_rms_y = result.map(r => ({'x': r.sensed_time, 'y': r.rms_y}));
        const date_rms_z = result.map(r => ({'x': r.sensed_time, 'y': r.rms_z}));

        const date_min_x = result.map(r => ({'x': r.sensed_time, 'y': r.min_x}));
        const date_min_y = result.map(r => ({'x': r.sensed_time, 'y': r.min_y}));
        const date_min_z = result.map(r => ({'x': r.sensed_time, 'y': r.min_z}));

        const date_max_x = result.map(r => ({'x': r.sensed_time, 'y': r.max_x}));
        const date_max_y = result.map(r => ({'x': r.sensed_time, 'y': r.max_y}));
        const date_max_z = result.map(r => ({'x': r.sensed_time, 'y': r.max_z}));

        dataset = {
            rms: {x: date_rms_x, y: date_rms_y, z: date_rms_z},
            min: {x: date_min_x, y: date_min_y, z: date_min_z},
            max: {x: date_max_x, y: date_max_y, z: date_max_z}
        }

        drawChart(ctx, dataset[viewOption], label[viewOption], color);
    })
}

async function retrieve(date, sensorId) {
    try {
        const data = await fetch('https://10.4.5.13/get_data.php?' +
            new URLSearchParams(
                { date: date,
                      sensor_id: sensorId
            }))
            .then((response) => response.json());
        return data;
    } catch (err) {
        console.log(err);
        return "ERROR_SERVER";
    }
}

function getComparisonData(num) {
    compare(num).then( (data) => {
        console.log(data);
        if(chartOn != null){
            chartOn.destroy();
        }
        const ctx = document.querySelector("#line-chart").getContext('2d');
        const title = 'Location: ' + data.location + ',  Factor: ' + data.factor;
        const dataset = []
        if ('healthy1' in data) {
            const {healthy1} = data;
            i = 0;
            const healthy1Data = healthy1.map( d => ({'x': i++, 'y': d.rms_y}));
            dataset.push({data: healthy1Data,
                label: 'Healthy 1',
                borderColor: '#bae755'});
        }
        if ('healthy2' in data) {
            const {healthy2} = data;
            i = 0;
            const healthy2Data = healthy2.map( d => ({'x': i++, 'y': d.rms_y}));
            dataset.push({data: healthy2Data,
                label: 'Healthy 2',
                borderColor: '#3e95cd'});
        }
        if ('faulty' in data) {
            const {faulty} = data;
            i = 0;
            const faultyData = faulty.map( d => ({'x': i++, 'y': d.rms_y}));
            dataset.push({data: faultyData,
                label: 'Faulty',
                borderColor: '#e755ba'});
        }

        drawChart2(ctx, dataset, title);
    });
}

async function compare(num) {
    try {
        const data = await fetch('https://10.4.5.13/get_comparison.php?' +
            new URLSearchParams(
                {num: num}
            ))
            .then((response) => response.json());
        return data;
    } catch (err) {
        console.log(err);
        return "ERROR_SERVER";
    }

}

function drawChart2(ctx, dataset, title) {
    console.log(dataset);
    const config = {
        type: 'line',
        data: {
            labels: [],
            datasets: dataset
        },
        options: {
            elements: {
                line: {
                    tension: 0.5,
                    borderWidth: 1
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                }],
                title: {
                    display: false
                }
            },
            title: {
                display: true,
                text: title
            }

        }
    };
    chartOn = new Chart(ctx, config);
}

