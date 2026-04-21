// **********************************************************
// demo 03: quadtree "infinite" terrain
// **********************************************************

import '../style.css'
import * as THREE from 'three'
import GUI from 'lil-gui';
import { SkyType } from '../shared/skyType';
import Stats from 'three/addons/libs/stats.module.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import GameScene from './gameScene';
import nipplejs from 'nipplejs';
import { Console } from 'console';
import { CameraRig } from '../shared/cameraRig';
import { PointerLockControlsManager } from './pointerLockControlsManager';

//const isMobile = 'ontouchstart' in window;

const settings = {  
  isDebug: true,
  lockCameraToTerrain: true,
  yCameraOffsetFromTerrain: 5,
  gamepadLookSensitivityX: 2,
  gamepadLookSensitivityY: 1,
  skyType: SkyType.Skybox,
  terrain: {
    mapWidth: 2500,
    minimumChunkSize: 250,
    verticesPerChunkSide: 32,
    heightFactor: 100
  },
  sky: {
    turbidity: 10.0,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    luminance: 1,
  },
  sun: {
    inclination: 0.31,
    azimuth: 0.25,
  }
};

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.near = 1;
camera.far = 100000;
camera.position.set(0, 0, 0);
camera.updateProjectionMatrix();
const cameraRig = new CameraRig(camera);

const renderer = new THREE.WebGLRenderer({
  //antialias: true,
  //logarithmicDepthBuffer: true
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

const scene = new GameScene(cameraRig, renderer, settings);


const stats = new Stats();
document.body.appendChild(stats.dom)

 window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

// https://threejs.org/examples/#misc_controls_pointerlock

const isMobile = /Mobi|Android/i.test(navigator.userAgent);


let touchScreenRequested = false;



///////////////////////////////////////////////
// on-screen joysticks
///////////////////////////////////////////////
///////////////////////////////////////////////
// LEFT
///////////////////////////////////////////////

let leftJoystickManager : nipplejs.JoystickManager = nipplejs.create({
    zone: document.getElementById('leftJoystickContainerDynamic')!,
    mode: 'static',
    dynamicPage: true,
    position: { left: '20%', bottom: '20%' },
    color: 'blue',
    restOpacity: 0.25
});
leftJoystickManager.on('move',  (data : nipplejs.EventData, output : nipplejs.JoystickOutputData) => {

  //document.exitPointerLock();
  turboOn = true;
  if(output.vector.y > 0.1) {
      velocity.z = -moveSpeed * Math.abs(output.vector.y);
  }
  else if(output.vector.y < -0.1) {
      velocity.z = moveSpeed* Math.abs(output.vector.y);
  }
  else {
    velocity.z = 0;
  }

  if(output.vector.x > 0.1) {
      velocity.x = moveSpeed * Math.abs(output.vector.x);
  }
  else if(output.vector.x < -0.1) {
      velocity.x = -moveSpeed * Math.abs(output.vector.x);
  }
  else {
    velocity.x = 0;
  }
  console.log('leftJoystickManager on move');
});

leftJoystickManager.on('end',  () => {
  turboOn = false;
  velocity.x = 0;
  velocity.y = 0;
  velocity.z = 0
});

const leftZone = document.getElementById('rightJoystickContainerDynamic');
if (leftZone) {
    leftZone.style.display = 'block';
}

///////////////////////////////////////////////
// RIGHT
///////////////////////////////////////////////
let rightJoystickManager : nipplejs.JoystickManager = nipplejs.create({
    zone: document.getElementById('rightJoystickContainerDynamic')!,
    mode: 'static',
    dynamicPage: true,
    position: { right: '20%', bottom: '20%' },
    color: 'blue',
    restOpacity: 0.25
});
rightJoystickManager.on('move',  (data : nipplejs.EventData, output : nipplejs.JoystickOutputData) => {
  
  if(!output.vector)
    return;

   //document.exitPointerLock();

   cameraRig.lookX = output.vector.x * settings.gamepadLookSensitivityX; // -1 to 1
   cameraRig.lookY = output.vector.y * settings.gamepadLookSensitivityY; // -1 to 1
});

rightJoystickManager.on('end',  () => {
  cameraRig.lookX = 0;
  cameraRig.lookY = 0;
});

const rightZone = document.getElementById('rightJoystickContainerDynamic');
if (rightZone) {
    rightZone.style.display = 'block';
}

const pointerLockControlManager = new PointerLockControlsManager();

if(!isMobile) {
  let pointerLockControls = pointerLockControlManager.initializePointerLock(cameraRig, document);//canvas);
  if(pointerLockControls && !touchScreenRequested)
    scene.add(pointerLockControls?.object);
}

/*
if (!isMobile) {
    el.addEventListener("click", () => {

    if(pointerLockControls && !touchScreenRequested)
        scene.add(pointerLockControls?.object);

        //canvas.requestPointerLock();
    });
} else {
    //createPersistentJoysticks();
}
*/

const blockerElement = document.getElementById( 'blocker' )!;
const instructions = document.getElementById( 'instructions' )!;

blockerElement.addEventListener("touchstart", (touchEvent) => {
  touchScreenRequested = true;
  //alert("touch start!")
  instructions!.style.display = 'none';
  blockerElement!.style.display = 'none';
});
blockerElement.addEventListener("touchend", (touchEvent) => {
  //alert("touch end!")
});
blockerElement.addEventListener("touchcancel", (touchEvent) => {
  //alert("touch cancel!")
});
blockerElement.addEventListener("touchmove", (touchEvent) => {
  //alert("touch move!")
});

// movement
const moveSpeed = 1;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let turboOn = false;

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': // Forward
        case 'ArrowUp': // Forward
            velocity.z = -moveSpeed;
            break;
        case 'KeyS': // Backward
        case 'ArrowDown': // Backward
            velocity.z = moveSpeed;
            break;
        case 'KeyA': // Left
        case 'ArrowLeft': // Left
            velocity.x = -moveSpeed;
            break;
        case 'KeyD': // Right
        case 'ArrowRight': // Right
            velocity.x = moveSpeed;
            break;
        case 'KeyQ': // Up
            settings.lockCameraToTerrain = false;
            velocity.y = moveSpeed;
            break;
        case 'KeyZ': // down
            settings.lockCameraToTerrain = false;
            velocity.y = -moveSpeed;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
          turboOn = true;
          break;
        case 'KeyL':
          settings.lockCameraToTerrain = true;
          break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'KeyS':
        case 'ArrowUp':
        case 'ArrowDown':
            velocity.z = 0;
            break;
        case 'KeyA':
        case 'KeyD':
        case 'ArrowLeft':
        case 'ArrowRight':
            velocity.x = 0;
            break;
        case 'KeyQ':
        case 'KeyZ':
            velocity.y = 0;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            turboOn = false;
            break;
    }
});


function updateCamera() {
  
  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;
  
  let multiplier = turboOn ? 10 : 1;
  let temp = velocity.clone();
  if(!isMobile)
    direction.copy(temp.multiplyScalar(multiplier)).applyQuaternion(camera.quaternion);
  else
    direction.copy(temp.multiplyScalar(multiplier)).applyQuaternion(cameraRig.yawObject.quaternion);
  //camera.position.add(direction);

  cameraRig.moveRig(direction, pointerLockControlManager.isPointerLockActive());
  cameraRig.update(delta);
  //pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

  //yawObject.rotation.y = yaw;
  //pitchObject.rotation.x = pitch;

  //if(lookX == 0 && lookY == 0)
    //return;

}

// https://lil-gui.georgealways.com/
const gui = new GUI();
gui.title('Debug');
if(!settings.isDebug || isMobile)
  gui.close();
gui.add( document, 'title' );
gui.add(settings, 'isDebug').listen().onChange((value: any) => scene.switchIsDebug(value));
gui.add(settings, 'skyType', { Skybox: 0, Shader: 1 } ).onChange((value: any) => switchSky(value));
gui.add(scene.children, 'length').name('Scene Children Count').listen();
gui.add(renderer.info.memory, 'geometries').name('Scene Geometry Count').listen();
gui.add(renderer.info.memory, 'textures').name('Scene Texture Count').listen();
gui.add(renderer.info?.programs!, 'length').name('Scene Program Count').listen();

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(settings, 'lockCameraToTerrain').name('Lock Camera To Terrain?').listen();
cameraFolder.add(settings, 'yCameraOffsetFromTerrain', -100, 100, 0.5).name('Locked Camera Offset').listen();
cameraFolder.add(camera.position, 'x', scene.quadTree.bounds.min.x, scene.quadTree.bounds.max.x).listen();
cameraFolder.add(camera.position, 'y', 0, 10000).listen();
cameraFolder.add(camera.position, 'z', scene.quadTree.bounds.min.y, scene.quadTree.bounds.max.y).listen();
cameraFolder.add(camera.quaternion, 'x').name('quaternion x').listen();
cameraFolder.add(camera.quaternion, 'y').name('quaternion y').listen();
cameraFolder.add(camera.quaternion, 'z').name('quaternion z').listen();
cameraFolder.add(camera.quaternion, 'w').name('quaternion w').listen();
cameraFolder.add(camera, 'far', 0, 1000000, 10).listen();
cameraFolder.add(cameraRig.yawObject.rotation, 'y').name('yaw rotation y').listen();
cameraFolder.add(cameraRig.pitchObject.rotation, 'x').name('pitch rotation x').listen();
cameraFolder.add(velocity, 'x').name('velocity.x').listen();
cameraFolder.add(velocity, 'y').name('velocity.y').listen();
cameraFolder.add(velocity, 'z').name('velocity.z').listen();



cameraFolder.open();

const quadTreeFolder = gui.addFolder('Quadtree');
quadTreeFolder.add(scene, 'totalNodes').name('Total Nodes').listen();

const onShaderChange = () => {
  //for (let k in settings.sky) {
    scene.sky.material.uniforms["turbidity"].value = settings.sky.turbidity;
    scene.sky.material.uniforms["rayleigh"].value = settings.sky.rayleigh;
    scene.sky.material.uniforms["mieCoefficient"].value = settings.sky.mieCoefficient;
    scene.sky.material.uniforms["mieDirectionalG"].value = settings.sky.mieDirectionalG;
    //sky.material.uniforms["luminance"].value = settings.sky.luminance;
  //}
  //for (let k in settings) {
  //    sky.material.uniforms[k].value = settings.[k];
  //  }
};

const onSunChange = () => {
  var theta = Math.PI * (settings.sun.inclination - 0.5);
  var phi = 2 * Math.PI * (settings.sun.azimuth - 0.5);

  const sunPosition = new THREE.Vector3();
  sunPosition.x = Math.cos(phi);
  sunPosition.y = Math.sin(phi) * Math.sin(theta);
  sunPosition.z = Math.sin(phi) * Math.cos(theta);

  scene.sky.material.uniforms['sunPosition'].value.copy(sunPosition);
  scene.water.material.uniforms['sunDirection'].value.copy(sunPosition.normalize());
};


const skyFolder = gui.addFolder('Sky');
skyFolder.add(settings.sky, "turbidity", 0.1, 30.0).onChange(onShaderChange);
skyFolder.add(settings.sky, "rayleigh", 0.1, 4.0).onChange(onShaderChange);
skyFolder.add(settings.sky, "mieCoefficient", 0.0001, 0.1).onChange(onShaderChange);
skyFolder.add(settings.sky, "mieDirectionalG", 0.0, 1.0).onChange(onShaderChange);
skyFolder.add(settings.sky, "luminance", 0.0, 1.0).onChange(onShaderChange);

const sunFolder = gui.addFolder('Sun');
sunFolder.add(settings.sun, "inclination", 0.0, 1.0).onChange(onSunChange);
sunFolder.add(settings.sun, "azimuth", 0.0, 1.0).onChange(onSunChange);

const otherFolder = gui.addFolder('Water');
otherFolder.add(scene.water.position, 'y', -10, 100, 0.5).name('Elevation');

function switchSky(skyType: SkyType) {
  scene.switchSky(skyType);
}

let lastTime = performance.now();

function tick() {

  updateCamera();

  //renderer.clear();
  renderer.render(scene, camera);

  stats.update();
  requestAnimationFrame(tick);

  scene.update(settings);
}

tick()