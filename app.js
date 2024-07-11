const SINGAPORE_COORDINATES = { lat: 1.3521, lng: 103.8198 };

const myGlobe = Globe()
(document.getElementById('globeViz'))
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
.pointOfView({ lat: SINGAPORE_COORDINATES.lat, lng: SINGAPORE_COORDINATES.lng, altitude: 2 }) // aim at Singapore
.arcDashLength(1) // Continuous arcs
.arcDashGap(0) // No gaps
.arcDashInitialGap(() => Math.random())
.arcDashAnimateTime(2000) // Faster animation
.arcColor(d => d.color)
.arcAltitudeAutoScale(0.5) // Higher arcs
.arcStroke(2) // Increase the stroke width
.arcsTransitionDuration(0)
.pointColor(() => 'orange')
.pointAltitude(0)
.pointRadius(0.05) // Larger points
.pointsMerge(true)
.labelLat(d => d.lat)
.labelLng(d => d.lng)
.labelText(d => d.label)
.labelSize(0.5)
.labelDotRadius(0.1)
.labelColor(() => 'white');

// Enable auto-rotation
const controls = myGlobe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Sample data representing attacks to and from Singapore
const attacks = [
    { from: { lat: 34.0522, lng: -118.2437, label: 'Los Angeles' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' } }, // Attack from LA to Singapore
    { from: { lat: 40.7128, lng: -74.0060, label: 'New York' }, to: { ...SINGAPORE_COORDINATES, label: 'Singapore' } },  // Attack from NY to Singapore
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 55.7558, lng: 37.6176, label: 'Moscow' } },   // Attack from Singapore to Moscow
    { from: { ...SINGAPORE_COORDINATES, label: 'Singapore' }, to: { lat: 35.6895, lng: 139.6917, label: 'Tokyo' } }   // Attack from Singapore to Tokyo
];

// Load data and update globe visualization
const pointsData = attacks.flatMap(attack => [
    { ...attack.from, label: attack.from.label },
    { ...attack.to, label: attack.to.label }
]);

const arcsData = attacks.map(attack => ({
    startLat: attack.from.lat,
    startLng: attack.from.lng,
    endLat: attack.to.lat,
    endLng: attack.to.lng,
    color: attack.from.lat === SINGAPORE_COORDINATES.lat && attack.from.lng === SINGAPORE_COORDINATES.lng ? 
           'rgba(255, 0, 0, 1)' : 'rgba(0, 255, 0, 1)', // Different colors for incoming and outgoing
    stroke: 2 // Ensure all arcs have the same stroke width
}));

myGlobe.pointsData(pointsData).arcsData(arcsData);
