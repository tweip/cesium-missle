const COUNTRY = 'Singapore';
const OPACITY = 0.22;
const SINGAPORE_COORDINATES = { lat: 1.3521, lng: 
103.8198 };

const myGlobe = Globe()
  (document.getElementById('globeViz'))
  
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
  .pointOfView({ lat: SINGAPORE_COORDINATES.lat, 
lng: SINGAPORE_COORDINATES.lng, altitude: 2 }) // 
aim at Singapore
  .arcDashLength(0.25)
  .arcDashGap(1)
  .arcDashInitialGap(() => Math.random())
  .arcDashAnimateTime(4000)
  .arcColor(d => [`rgba(0, 255, 0, ${OPACITY})`, 
`rgba(255, 0, 0, ${OPACITY})`])
  .arcsTransitionDuration(0)
  .pointColor(() => 'orange')
  .pointAltitude(0)
  .pointRadius(0.02)
  .pointsMerge(true);

// Sample data representing attacks to and from 
Singapore
const attacks = [
  { from: { lat: 34.0522, lng: -118.2437 }, to: 
SINGAPORE_COORDINATES }, // Attack from LA to 
Singapore
  { from: { lat: 40.7128, lng: -74.0060 }, to: 
SINGAPORE_COORDINATES },  // Attack from NY to 
Singapore
  { from: SINGAPORE_COORDINATES, to: { lat: 
55.7558, lng: 37.6176 } },  // Attack from 
Singapore to Moscow
  { from: SINGAPORE_COORDINATES, to: { lat: 
35.6895, lng: 139.6917 } }  // Attack from 
Singapore to Tokyo
];

// Load data and update globe visualization
const pointsData = attacks.flatMap(attack => 
[attack.from, attack.to]);

const arcsData = attacks.map(attack => ({
  startLat: attack.from.lat,
  startLng: attack.from.lng,
  endLat: attack.to.lat,
  endLng: attack.to.lng,
  color: attack.from === SINGAPORE_COORDINATES ? 
['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)'] : 
['rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)']
}));

myGlobe.pointsData(pointsData).arcsData(arcsData);

// Optional: Animation for missile trajectories
function animateMissile(attack) {
  const { from, to } = attack;
  const missileData = [{
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    color: ['yellow']
  }];

  myGlobe.arcsData(missileData);
}

attacks.forEach(attack => animateMissile(attack));

