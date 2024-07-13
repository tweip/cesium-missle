const SINGAPORE_COORDINATES = { lat: 1.3521, lng: 103.8198 };

const myGlobe = Globe()
(document.getElementById('globeViz'))
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
.pointOfView({ lat: SINGAPORE_COORDINATES.lat, lng: 103.8198, altitude: 2 }) // aim at Singapore
.arcDashLength(0.25)
.arcDashGap(1)
.arcDashInitialGap(() => Math.random())
.arcDashAnimateTime(5000) // Slow down animation for performance
.arcStroke(0.2) // Reduce stroke width for performance
.arcsTransitionDuration(0)
.arcColor(arc => {
    const isOutgoing = arc.startLat === SINGAPORE_COORDINATES.lat && arc.startLng === SINGAPORE_COORDINATES.lng;
    return isOutgoing ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)'; // Adjust opacity for performance
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

// Enable auto-rotation with throttling
const controls = myGlobe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;

// Throttle function to limit the frequency of updates
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

const CHUNK_SIZE = 500; // Number of rows to load at a time
let currentIndex = 0;
let totalData = [];
let pointsSet = new Set();
let arcsData = [];
let labelsData = [];

// Function to load the next chunk of data
function loadNextChunk() {
    if (currentIndex >= totalData.length) return;

    const chunk = totalData.slice(currentIndex, currentIndex + CHUNK_SIZE);
    currentIndex += CHUNK_SIZE;

    chunk.forEach(attack => {
        const fromKey = `${attack.from.lat},${attack.from.lng}`;
        const toKey = `${attack.to.lat},${attack.to.lng}`;
        if (!pointsSet.has(fromKey)) {
            pointsSet.add(fromKey);
            labelsData.push({ lat: attack.from.lat, lng: attack.from.lng, label: attack.from.label });
        }
        if (!pointsSet.has(toKey)) {
            pointsSet.add(toKey);
            labelsData.push({ lat: attack.to.lat, lng: attack.to.lng, label: attack.to.label });
        }
        arcsData.push({
            startLat: attack.from.lat,
            startLng: attack.from.lng,
            endLat: attack.to.lat,
            endLng: attack.to.lng
        });
    });

    const pointsData = Array.from(pointsSet).map(key => {
        const [lat, lng] = key.split(',').map(Number);
        return { lat, lng };
    });

    myGlobe.pointsData(pointsData).arcsData(arcsData).labelsData(labelsData);

    // Update the table with the new data
    updateTable();
}

// Load initial data from CSV
d3.csv('attacks.csv').then(data => {
    totalData = data.map(row => ({
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

    loadNextChunk();
});

// Load more data when the user interacts with the globe
myGlobe.controls().addEventListener('change', throttle(loadNextChunk, 1000));

// Calculate the percentage of attacks from each country
function updateTable() {
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
    tbody.innerHTML = ''; // Clear existing rows
    countryPercentages.forEach(({ country, percentage }) => {
        const row = document.createElement('tr');
        const flagCell = document.createElement('td');
        const countryCell = document.createElement('td');
        const percentageCell = document.createElement('td');
        
        const flagImg = document.createElement('img');
        flagImg.src = `https://flagcdn.com/w40/${country.toLowerCase()}.png`;
        flagImg.classList.add('flag');
        flagCell.appendChild(flagImg);
        
        countryCell.textContent = country; // Display country code in uppercase
        percentageCell.textContent = percentage;
        
        row.appendChild(flagCell);
        row.appendChild(countryCell);
        row.appendChild(percentageCell);
        tbody.appendChild(row);
    });

    document.getElementById('totalAttacks').textContent = `Total Attacks: ${totalData.length}`;
}

// Function to update the clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    document.getElementById('clock').innerHTML = `${dateString}<br>${timeString}`;
}

// Update the clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call to set the clock immediately
