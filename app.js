const myGlobe = Globe()
  (document.getElementById('globeViz'))
  
.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
  .pointOfView({ lat: 1.3521, lng: 103.8198, 
altitude: 2 }) // aim at Singapore
  .arcDashLength(0.25)
  .arcDashGap(1)
  .arcDashInitialGap(() => Math.random())
  .arcDashAnimateTime(4000)
  .arcColor(d => ['rgba(0, 255, 0, 0.5)', 
'rgba(255, 0, 0, 0.5)'])
  .arcsTransitionDuration(0)
  .pointColor(() => 'orange')
  .pointAltitude(0)
  .pointRadius(0.02)
  .pointsMerge(true);

const attacks = [
  { from: { lat: 34.0522, lng: -118.2437 }, to: { 
lat: 1.3521, lng: 103.8198 } }, // LA to Singapore
  { from: { lat: 40.7128, lng: -74.0060 }, to: { 
lat: 1.3521, lng: 103.8198 } },  // NY to 
Singapore
  { from: { lat: 1.3521, lng: 103.8198 }, to: { 
lat: 55.7558, lng: 37.6176 } },  // Singapore to 
Moscow
  { from: { lat: 1.3521, lng: 103.8198 }, to: { 
lat: 35.6895, lng: 139.6917 } }  // Singapore to 
Tokyo
];

const pointsData = attacks.flatMap(attack => 
[attack.from, attack.to]);

const arcsData = attacks.map(attack => ({
  startLat: attack.from.lat,
  startLng: attack.from.lng,
  endLat: attack.to.lat,
  endLng: attack.to.lng,
  color: attack.from.lat === 1.3521 && 
attack.from.lng === 103.8198 ? ['rgba(255, 0, 0, 
0.5)', 'rgba(0, 255, 0, 0.5)'] : ['rgba(0, 255, 0, 
0.5)', 'rgba(255, 0, 0, 0.5)']
}));

myGlobe.pointsData(pointsData).arcsData(arcsData);

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

