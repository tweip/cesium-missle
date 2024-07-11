import { Viewer, Transforms, Cartesian3, Color, 
Math as CesiumMath, CallbackProperty } from 
'cesium';

const viewer = new Viewer('cesiumContainer', {
    imageryProvider: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    animation: false
});

viewer.scene.camera.rotate(Cartesian3.UNIT_Z, 
CesiumMath.toRadians(0.01));

viewer.imageryLayers.addImageryProvider(new 
Cesium.IonImageryProvider({ assetId: 2 }));

const attacks = [
    { from: [34.0522, -118.2437], to: [39.9042, 
116.4074] },
    { from: [40.7128, -74.0060], to: [55.7558, 
37.6176] }
];

attacks.forEach(attack => {
    const from = 
Cartesian3.fromDegrees(...attack.from);
    const to = 
Cartesian3.fromDegrees(...attack.to);

    viewer.entities.add({
        polyline: {
            positions: new CallbackProperty(() => 
[from, to], false),
            width: 2,
            material: Color.RED
        }
    });

    viewer.entities.add({
        position: from,
        point: { pixelSize: 10, color: Color.RED }
    });

    viewer.entities.add({
        position: to,
        point: { pixelSize: 10, color: Color.BLUE 
}
    });
});

function createMissileAnimation(from, to) {
    const startTime = viewer.clock.startTime;
    const stopTime = viewer.clock.stopTime;

    viewer.entities.add({
        position: new CallbackProperty((time) => {
            const t = 
CesiumMath.clamp(CesiumMath.toRadians(time.secondsOfDay), 
0, 1);
            return Cartesian3.lerp(from, to, t, 
new Cartesian3());
        }, false),
        point: { pixelSize: 5, color: Color.YELLOW 
}
    });
}

attacks.forEach(attack => {
    const from = 
Cartesian3.fromDegrees(...attack.from);
    const to = 
Cartesian3.fromDegrees(...attack.to);
    createMissileAnimation(from, to);
});

