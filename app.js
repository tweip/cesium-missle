const SINGAPORE_COORDINATES = { lat: 1.3521, lng: 103.8198 };

const myGlobe = Globe()
(document.getElementById('globeViz'))
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
.pointOfView({ lat: SINGAPORE_COORDINATES.lat, lng: 103.8198, altitude: 2 })
.arcDashLength(0.25)
.arcDashGap(1)
.arcDashInitialGap(() => Math.random())
.arcDashAnimateTime(5000)
.arcStroke(0.2)
.arcsTransitionDuration(0)
.arcColor(arc => {
    const isOutgoing = arc.startLat === SINGAPORE_COORDINATES.lat && arc.startLng === SINGAPORE_COORDINATES.lng;
    return isOutgoing ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
})
.pointColor(() => 'orange')
.pointAltitude(0)
.pointRadius(0.02)
.pointsMerge(true)
.labelColor(() => 'white')
.labelText(d => d.label)
.labelAltitude(0.01)
.labelSize(1.5)
.labelDotRadius(0.2);

const controls = myGlobe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function initializeWorker(data) {
    const worker = new Worker('worker.js');
    worker.postMessage(data);

    worker.onmessage = function(event) {
        const { pointsData, arcsData, labelsData, currentIndex } = event.data;

        myGlobe.pointsData(pointsData).arcsData(arcsData).labelsData(labelsData);

        updateTable(currentIndex, data);

        if (currentIndex < data.length) {
            worker.postMessage(data.slice(currentIndex));
        }
    };
}

fetch('attacks.json.gz')
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const decompressed = pako.inflate(buffer, { to: 'string' });
        const data = JSON.parse(decompressed);

        const attacks = data.map(row => ({
            from: {
                lat: +row.from_lat,
                lng: +row.from_lng,
                label: row.from_label,
                country: row.from_country
            },
            to: {
                lat: +row.to_lat,
                lng: +row.to_lng,
                label: row.to_label,
                country: row.to_country
            },
            direction: row.direction
        }));

        initializeWorker(attacks);
    });

function updateTable(currentIndex, totalData) {
    const incomingAttacks = totalData.filter(attack => attack.direction === 'incoming' && currentIndex >= totalData.indexOf(attack));
    const countryCounts = new Map();

    incomingAttacks.forEach(attack => {
        const country = attack.from.country.toUpperCase();
        countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    });

    const totalIncoming = incomingAttacks.length;
    const countryPercentages = Array.from(countryCounts.entries()).map(([country, count]) => ({
        country,
        percentage: ((count / totalIncoming) * 100).toFixed(2) + '%'
    }));

    const tbody = document.getElementById('attackTable').querySelector('tbody');
    tbody.innerHTML = '';
    countryPercentages.forEach(({ country, percentage }) => {
        const row = document.createElement('tr');
        const flagCell = document.createElement('td');
        const countryCell = document.createElement('td');
        const percentageCell = document.createElement('td');
        
        const flagImg = document.createElement('img');
        flagImg.src = `https://flagcdn.com/w40/${country.toLowerCase()}.png`;
        flagImg.classList.add('flag');
        flagCell.appendChild(flagImg);
        
        countryCell.textContent = country;
        percentageCell.textContent = percentage;
        
        row.appendChild(flagCell);
        row.appendChild(countryCell);
        row.appendChild(percentageCell);
        tbody.appendChild(row);
    });

    document.getElementById('totalAttacks').textContent = `Total Attacks: ${totalData.length}`;
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    document.getElementById('clock').innerHTML = `${dateString}<br>${timeString}`;
}

setInterval(updateClock, 1000);
updateClock();

controls.addEventListener('change', debounce(() => {
    const worker = new Worker('worker.js');
    worker.postMessage(totalData);
    worker.onmessage = function(event) {
        const { pointsData, arcsData, labelsData, currentIndex } = event.data;
        myGlobe.pointsData(pointsData).arcsData(arcsData).labelsData(labelsData);

        if (currentIndex < totalData.length) {
            worker.postMessage(totalData.slice(currentIndex));
        }
    };
}, 1000));
