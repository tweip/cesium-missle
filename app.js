const SINGAPORE_COORDINATES = { lat: 1.3521, lng: 103.8198 };

const myGlobe = Globe()
(document.getElementById('globeViz'))
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
.pointOfView({ lat: SINGAPORE_COORDINATES.lat, lng: 103.8198, altitude: 2 })
.arcDashLength(0.25)
.arcDashGap(1)
.arcDashInitialGap(() => Math.random())
.arcDashAnimateTime(2000)
.arcStroke(0.5)
.arcsTransitionDuration(0)
.arcColor(arc => {
    const isOutgoing = arc.startLat === SINGAPORE_COORDINATES.lat && arc.startLng === SINGAPORE_COORDINATES.lng;
    return isOutgoing ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)';
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
controls.autoRotateSpeed = 0.5;

const attacks = [
    { from: { lat: 34.0522, lng: -118.2437, label: 'Los Angeles', country: 'us' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { lat: 40.7128, lng: -74.0060, label: 'New York', country: 'us' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { lat: 51.5074, lng: -0.1278, label: 'London', country: 'gb' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { lat: 48.8566, lng: 2.3522, label: 'Paris', country: 'fr' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { lat: 35.6895, lng: 139.6917, label: 'Tokyo', country: 'jp' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 55.7558, lng: 37.6176, label: 'Moscow', country: 'ru' }, direction: 'outgoing' },
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 35.6895, lng: 139.6917, label: 'Tokyo', country: 'jp' }, direction: 'outgoing' },   
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 39.9042, lng: 116.4074, label: 'Beijing', country: 'cn' }, direction: 'outgoing' },
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: -33.8688, lng: 151.2093, label: 'Sydney', country: 'au' }, direction: 'outgoing' },
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 19.0760, lng: 72.8777, label: 'Mumbai', country: 'in' }, direction: 'outgoing' },
    { from: { lat: 55.7558, lng: 37.6176, label: 'Moscow', country: 'ru' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { lat: 28.7041, lng: 77.1025, label: 'Delhi', country: 'in' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { lat: 19.0760, lng: 72.8777, label: 'Mumbai', country: 'in' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { lat: -33.8688, lng: 151.2093, label: 'Sydney', country: 'au' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' },
    { from: { lat: 39.9042, lng: 116.4074, label: 'Beijing', country: 'cn' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' },
    { from: { lat: 51.5074, lng: -0.1278, label: 'London', country: 'gb' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, direction: 'incoming' }, 
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 40.7128, lng: -74.0060, label: 'New York', country: 'us' }, direction: 'outgoing' }, 
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 34.0522, lng: -118.2437, label: 'Los Angeles', country: 'us' }, direction: 'outgoing' },
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 51.5074, lng: -0.1278, label: 'London', country: 'gb' }, direction: 'outgoing' },     
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 48.8566, lng: 2.3522, label: 'Paris', country: 'fr' }, direction: 'outgoing' }, 
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 35.6895, lng: 139.6917, label: 'Tokyo', country: 'jp' }, direction: 'outgoing' } 
];

const pointsData = attacks.flatMap(attack => [attack.from, attack.to]);

const arcsData = attacks.map(attack => ({
    startLat: attack.from.lat,
    startLng: attack.from.lng,
    endLat: attack.to.lat,
    endLng: attack.to.lng
}));

const labelsData = pointsData.map(point => ({
    lat: point.lat,
    lng: point.lng,
    label: point.label
}));

myGlobe.pointsData(pointsData).arcsData(arcsData).labelsData(labelsData);

const incomingAttacks = attacks.filter(attack => attack.direction === 'incoming');
const countryCounts = incomingAttacks.reduce((counts, attack) => {
    counts[attack.from.country] = (counts[attack.from.country] || 0) + 1;
    return counts;
}, {});

const totalIncoming = incomingAttacks.length;
const countryPercentages = Object.entries(countryCounts).map(([country, count]) => ({
    country,
    percentage: ((count / totalIncoming) * 100).toFixed(2) + '%'
}));

const tbody = document.getElementById('attackTable').querySelector('tbody');
countryPercentages.forEach(({ country, percentage }) => {
    const row = document.createElement('tr');
    const flagCell = document.createElement('td');
    const countryCell = document.createElement('td');
    const percentageCell = document.createElement('td');
    
    const flagImg = document.createElement('img');
    flagImg.src = `https://flagcdn.com/w40/${country}.png`;
    flagImg.classList.add('flag');
    flagCell.appendChild(flagImg);
    
    countryCell.textContent = country;
    percentageCell.textContent = percentage;
    
    row.appendChild(flagCell);
    row.appendChild(countryCell);
    row.appendChild(percentageCell);
    tbody.appendChild(row);
});
