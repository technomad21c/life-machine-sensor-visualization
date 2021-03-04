

function getCommonData() {
    retrieve().then( (data) => {
        console.log(data);
    });
}

async function retrieve() {
    try {
        const data = await fetch('https://10.4.5.13/get_common.php')
            .then((response) => response.json());
        return data;
    } catch (err) {
        console.log(err);
        return "ERROR_SERVER";
    }
}


const urlGetJig = "http://192.168.1.10/isac/get_jig.php?";
const urlGetCommon = "http://192.168.1.10/isac/get_common.php?";
const tempJigId = '1';

const getJig = document.querySelector('.request #get-jig');
const requestJigId = document.querySelector('.request #request-jig-id');
getJig.addEventListener('click', () => loadJIG(), false);

const jigId = document.querySelector('.jig-info #jig-id');
const jigName = document.querySelector('.jig-info #jig-name');
const jigSensors = document.querySelector('.jig-info #jig-sensors');
const jigWidth = document.querySelector('.jig-info #jig-width');
const jigHeight = document.querySelector('.jig-info #jig-height');
const jigStatus = document.querySelector('.jig-info #jig-status');
const jigDesc = document.querySelector('.jig-info #jig-desc');
const jigImageFrontDiv = document.querySelector('.jig .images .front .image');
const jigImageBackDiv = document.querySelector('.jig .images .back .image');

const commonValues = {};
const JIG_STATUS = 'jigStatus';
const SENSOR_TYPE = 'sensorType';
const SENSOR_STATUS = 'sensorStatus';
const JIG_ID = 'jigId';
const SENSOR_ID = 'sensorId';
window.addEventListener('load', () => {
    opt = JIG_STATUS;
    getCommon(opt).then((data) => {
        commonValues[JIG_STATUS] = data;
        console.log(JIG_STATUS, commonValues[JIG_STATUS]);
    });

    opt = SENSOR_STATUS;
    getCommon(opt).then((data) => {
        commonValues[SENSOR_STATUS] = data;
        console.log(SENSOR_STATUS, commonValues[SENSOR_STATUS]);
    });

    opt = SENSOR_TYPE;
    getCommon(opt).then((data) => {
        commonValues[SENSOR_TYPE] = data;
        console.log(SENSOR_TYPE, commonValues[SENSOR_TYPE]);
    });

    opt = JIG_ID;
    getCommon(opt).then((data) => {
        commonValues[JIG_ID] = data;
        console.log(JIG_ID, commonValues[JIG_ID]);
    });

    opt = SENSOR_ID;
    getCommon(opt).then((data) => {
        commonValues[SENSOR_ID] = data;
        console.log(SENSOR_ID, commonValues[SENSOR_ID]);
    });
});

function loadJIG() {
    const jigId = requestJigId.value;
    if (!isValidJig(jigId)) {
        clearView();
        console.log("Sensor IDL " + jigId + " not valid");
        return;
    }
    getJIG(jigId).then((data) => {
        console.log(data);
        displayJigInfo(data.jig[0], data.sensors);
    });
}

async function getJIG(jigId) {
    try {
        const data = await fetch(urlGetJig + new URLSearchParams({
            jigid: jigId
        }))
            .then((response) => response.json());

        return data;
    } catch (err) {
        console.log(err);
        console.log("Failed to get JIG info from server");
        return "ERROR_SERVER";
    }
}

function displayJigInfo(jigInfo, sensors) {
    jigId.textContent = jigInfo.id;
    jigName.textContent = jigInfo.name;
    jigSensors.textContent = jigInfo.sensors_num;
    jigWidth.textContent = jigInfo.width;
    jigHeight.textContent = jigInfo.height;
    jigStatus.textContent = getJigStatus(jigInfo.statusid);
    jigDesc.textContent = jigInfo.description;

    const FRONT_IMAGEMAP_NAME = 'front-map';
    const BACK_IMAGEMAP_NAME = 'back-map';
    const JIG_IMAGE_FRONT = 0;
    const JIG_IMAGE_BACK = 1;
    const jig_image_src = 'data/images';
    const jigImageFront = document.createElement('img');
    jigImageFront.className = 'front-image';
    jigImageFront.setAttribute('usemap', '#' + FRONT_IMAGEMAP_NAME);
    jigImageFront.alt = jigInfo.id + ' - ' + jigInfo.name + ' : Front Image';
    jigImageFront.src = jig_image_src + '/' + jigInfo.front_image;
    jigImageFrontDiv.appendChild(jigImageFront);

    createImageMap(jigImageFrontDiv, FRONT_IMAGEMAP_NAME, JIG_IMAGE_FRONT, sensors);

    const jigImageBack = document.createElement('img');
    jigImageBack.className = 'front-image';
    jigImageBack.setAttribute('usemap', '#' + BACK_IMAGEMAP_NAME);
    jigImageBack.src = jig_image_src + '/' + jigInfo.back_image;
    jigImageBackDiv.appendChild(jigImageBack);
    createImageMap(jigImageBackDiv, BACK_IMAGEMAP_NAME, JIG_IMAGE_BACK, sensors);
}

function clearView() {
    jigId.textContent = '';
    jigName.textContent = '';
    jigSensors.textContent = '';
    jigWidth.textContent = '';
    jigHeight.textContent = '';
    jigStatus.textContent = '';
    jigDesc.textContent = '';
    while (jigImageFrontDiv.firstChild) {
        jigImageFrontDiv.removeChild(jigImageFrontDiv.lastChild);
    }
    while (jigImageBackDiv.firstChild) {
        jigImageBackDiv.removeChild(jigImageBackDiv.lastChild);
    }
}

function createImageMap(parent, mapName, location, sensors) {
    const imageMap = document.createElement('map');
    imageMap.name = mapName;
    const imageMapArea = document.createElement('area');
    imageMapArea.shape = 'rect';
    for (sensor of sensors.filter( (sensor) => sensor.location == location)) {
        console.log('sensor info: ' + sensor.id + ',' + sensor.location + ': ' + sensor.coords);
        imageMapArea.coords = sensor.coords;
        imageMapArea.href = sensor.monitoring_url;
        imageMapArea.target = '_blank';
        imageMapArea.alt = 'sensor info: ' + sensor.id + ',' + 'front';
        console.log('coords info: ' + sensor.id + ' - front');
    }
    imageMap.appendChild(imageMapArea);
    parent.appendChild(imageMap);
}

async function getCommon(option) {
    try {
        const data = await fetch(urlGetCommon + new URLSearchParams({
            option: option
        }))
            .then((response) => response.json());

        return data;
    } catch (err) {
        console.log(err);
        console.log("Failed to get common data from server");
        return "ERROR_SERVER";
    }
}

function getJigStatus(statusId) {
    return commonValues[JIG_STATUS][statusId].status;
}

function isValidJig(jigId) {
    return commonValues[JIG_ID].some(s => s.id === parseInt(jigId));
}

function isValidSensor(sensorId) {
    return commonValues[SENSOR_ID].some(s => s.id === parseInt(sensorId));
}