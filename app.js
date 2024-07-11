import Globe from 'globe.gl';

const globe = 
Globe()(document.getElementById('globeViz'))
    
.globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
    
.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    
.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('lightblue')
    .atmosphereAltitude(0.25);

// Auto-rotate the globe
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.5;

const attacks = [
    { from: [34.0522, -118.2437], to: [39.9042, 
116.4074] },
    { from: [40.7128, -74.0060], to: [55.7558, 
37.6176] }
];

attacks.forEach(attack => {
    globe.arcsData([{
        startLat: attack.from[0],
        startLng: attack.from[1],
        endLat: attack.to[0],
        endLng: attack.to[1],
        color: ['red', 'blue']
    }]);
});

function animateMissile(attack) {
    const [startLat, startLng] = attack.from;
    const [endLat, endLng] = attack.to;

    const missileData = [{
        startLat,
        startLng,
        endLat,
        endLng,
        color: ['yellow']
    }];

    globe.arcsData(missileData);
}

attacks.forEach(attack => {
    animateMissile(attack);
});

