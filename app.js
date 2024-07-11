const SINGAPORE_COORDINATES = { lat: 1.3521, lng: 103.8198 };

const myGlobe = Globe()
(document.getElementById('globeViz'))
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
.pointOfView({ lat: SINGAPORE_COORDINATES.lat, lng: SINGAPORE_COORDINATES.lng, altitude: 2 }) // aim at Singapore
.arcDashLength(0.3) // Length of each dash segment
.arcDashGap(0.1) // Gap between dash segments
.arcDashInitialGap(() => Math.random() * 0.3) // Initial gap for dash segments
.arcDashAnimateTime(1000) // Time for a complete dash animation cycle
.arcColor(d => d.color)
.arcAltitudeAutoScale(0.5) // Higher arcs
.arcStroke(2) // Increase the stroke width
.arcsTransitionDuration(0)
.arcLabel(d => `${d.source.label} → ${d.destination.label}`)
.arcStartLat(d => d.source.lat)
.arcStartLng(d => d.source.lng)
.arcEndLat(d => d.destination.lat)
.arcEndLng(d => d.destination.lng)
.pointColor(() => 'orange')
.pointAltitude(0)
.pointRadius(0.05) // Larger points
.pointsMerge(true)
.labelLat(d => d.lat)
.labelLng(d => d.lng)
.labelText(d => d.label)
.labelSize(1)
.labelDotRadius(0.2)
.labelColor(() => 'white');

// Enable auto-rotation
const controls = myGlobe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Sample data representing attacks to and from Singapore
const attacks = [
    { source: { lat: 34.0522, lng: -118.2437, label: 'Los Angeles' }, destination: { ...SINGAPORE_COORDINATES, label: 'Singapore' } }, // Attack from LA to Singapore
    { source: { lat: 40.7128, lng: -74.0060, label: 'New York' }, destination: { ...SINGAPORE_COORDINATES, label: 'Singapore' } },  // Attack from NY to Singapore
    { source: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, destination: { lat: 55.7558, lng: 37.6176, label: 'Moscow' } },   // Attack from Singapore to Moscow
    { source: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, destination: { lat: 35.6895, lng: 139.6917, label: 'Tokyo' } }   // Attack from Singapore to Tokyo
];

// Load data and update globe visualization
const pointsData = attacks.flatMap(attack => [
    { ...attack.source },
    { ...attack.destination }
]);

const arcsData = attacks.map(attack => ({
    source: attack.source,
    destination: attack.destination,
    color: attack.source.lat === SINGAPORE_COORDINATES.lat && attack.source.lng === SINGAPORE_COORDINATES.lng ? 
           'rgba(255, 0, 0, 1)' : 'rgba(0, 255, 0, 1)', // Different colors for incoming and outgoing
    stroke: 2 // Ensure all arcs have the same stroke width
}));

myGlobe.pointsData(pointsData).arcsData(arcsData);
