const SINGAPORE_COORDINATES = { lat: 1.3521, lng: 103.8198 };

const myGlobe = Globe()
(document.getElementById('globeViz'))
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
.pointOfView({ lat: SINGAPORE_COORDINATES.lat, lng: 103.8198, altitude: 2 })
.arcDashLength(0.25)
.arcDashGap(1)
.arcDashInitialGap(() => Math.random())
.arcDashAnimateTime(30000) // Slow down animation
.arcStroke(0.5) // Increase stroke width for better visibility
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
controls.autoRotateSpeed = 1;

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function initializeWorker(data) {
    const worker = new Worker('worker.js');
    let currentIndex = 0;

    function loadNextChunk() {
        const chunk = data.slice(currentIndex, currentIndex + 100); // Increase chunk size to 100
        currentIndex += 100;
        worker.postMessage(chunk);

        if (currentIndex < data.length) {
            setTimeout(loadNextChunk, 2000); // Decrease delay to 2000 ms
        }
    }

    worker.onmessage = function(event) {
        const { pointsData, arcsData, labelsData, currentIndex } = event.data;

        myGlobe.pointsData(pointsData).arcsData(arcsData).labelsData(labelsData);

        updateTable(currentIndex, data);
        updateThreatTypes(data);

        console.log(`Processed chunk up to index: ${currentIndex}`);
        console.log(`Arcs Data: `, arcsData);
    };

    loadNextChunk();
}

fetch('EmailData.json.gz')
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
            direction: row.direction,
            threatType: row.ThreatTypes // Add threat type
        }));

        console.log(`Loaded ${attacks.length} attacks from JSON.`);
        initializeWorker(attacks);
    });

function updateTable(currentIndex, totalData) {
    const incomingAttacks = totalData.filter(attack => attack.direction === 'Inbound' && currentIndex >= totalData.indexOf(attack));
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

//    document.getElementById('totalAttacks').textContent = `Total Attacks: ${totalData.length}`;
}

function updateThreatTypes(totalData) {
    const threatCounts = new Map();

    totalData.forEach(attack => {
        const type = attack.threatType;
        threatCounts.set(type, (threatCounts.get(type) || 0) + 1);
    });

    const totalThreats = totalData.length;
    const threatPercentages = Array.from(threatCounts.entries()).map(([type, count]) => ({
        type,
        percentage: ((count / totalThreats) * 100).toFixed(2) + '%'
    }));

    const tbody = document.getElementById('threatTable').querySelector('tbody');
    tbody.innerHTML = '';
    threatPercentages.forEach(({ type, percentage }) => {
        const row = document.createElement('tr');
        const typeCell = document.createElement('td');
        const percentageCell = document.createElement('td');
        
        typeCell.textContent = type;
        percentageCell.textContent = percentage;
        
        row.appendChild(typeCell);
        row.appendChild(percentageCell);
        tbody.appendChild(row);
    });
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    document.getElementById('clock').innerHTML = `Local Time<br>${timeString}`;
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
