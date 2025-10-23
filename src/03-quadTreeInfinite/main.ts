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

//const isMobile = 'ontouchstart' in window;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.near = 1;
camera.far = 10000;
camera.position.set(0, 50, 0);
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({
  //antialias: true,
  //logarithmicDepthBuffer: true
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

const scene = new GameScene(camera, renderer);

const pitchObject = new THREE.Group();
pitchObject.add(camera);

const yawObject = new THREE.Group();
yawObject.add(pitchObject);

scene.add(yawObject);

const stats = new Stats();
document.body.appendChild(stats.dom)

const settings = {  
  lockCameraToTerrain: false,
  skyType: SkyType.Skybox,
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

// https://threejs.org/examples/#misc_controls_pointerlock

const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );

let touchScreenRequested = false;

function initializePointerLock(camera: THREE.Camera, document: Document): PointerLockControls | null {

  const isPointerLockSupported = 
  'requestPointerLock' in document.body || 
  'webkitRequestPointerLock' in document.body || 
  'mozRequestPointerLock' in document.body;

  if (!isPointerLockSupported)
    return null;

  let pointerLockControls = new PointerLockControls( camera, document.body );

  let isPointerLockRequested = false;
  
  
  instructions!.addEventListener( 'click', async () => {
    if(!isPointerLockRequested && !touchScreenRequested) {
      try {
        isPointerLockRequested = true;
        pointerLockControls.lock();

        setTimeout(() => {
          isPointerLockRequested = false;
        }, 2000);
      }
      catch(error) {
        console.log('Error locking pointer:', error);
      }
    }
  });

  pointerLockControls.addEventListener( 'lock', async () => {
    instructions!.style.display = 'none';
    blocker!.style.display = 'none';
  });
  
  pointerLockControls.addEventListener( 'unlock', async () => {
    blocker!.style.display = 'block';
    instructions!.style.display = '';
  });
  
  
  // Handle pointer lock errors
  document.addEventListener('pointerlockerror', async (event) => {
    //console.error('Pointer lock failed:', event);
    console.log('Pointer lock failed:', event);
  });

  return pointerLockControls;
}

let pointerLockControls = initializePointerLock(camera, document);//canvas);
if(pointerLockControls)
  scene.add(pointerLockControls?.object);


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
  console.log('test');
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
  
  const lookSpeed = 1;
  const deltaX = (output.vector?.x ?? 0) * lookSpeed * 0.1;
  const deltaY = (output.vector?.y ?? 0) * lookSpeed * 0.1;

  // Yaw (Y-axis rotation)  
  //pointerLockControls!.object.rotation.y -= deltaX;
  // yaw -= deltaX;
  yawObject.rotation.y -= deltaX;

  // Pitch (X-axis rotation)\  
  //pointerLockControls!.object.rotation.x -= deltaY;
  // pitch -= deltaY;
  pitchObject.rotation.x -= deltaY;

  // clamp pitch to avoid flipping
  const limit = Math.PI / 2 - 0.1;
  //pointerLockControls!.object.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pointerLockControls!.object.rotation.x));
  //pitch = Math.max(-limit, Math.min(limit, pitch));
  pitchObject.rotation.x = Math.max(-limit, Math.min(limit, pitchObject.rotation.x));

  //pointerLockControls!.object.rotation.z = 0;

   // Build quaternion from yaw (Y) and pitch (X), no roll
  //const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  //const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
  //const q = new THREE.Quaternion().multiplyQuaternions(qYaw, qPitch);
  pitchObject.rotation.z = 0;
  yawObject.rotation.z = 0;

  //pointerLockControls!.object.quaternion.copy(q);
});

rightJoystickManager.on('end',  () => {
  
});

const rightZone = document.getElementById('rightJoystickContainerDynamic');
if (rightZone) {
    rightZone.style.display = 'block';
}



const el = document.getElementById("blocker")!;
el.addEventListener("touchstart", (touchEvent) => {
  touchScreenRequested = true;
  //alert("touch start!")
  instructions!.style.display = 'none';
  blocker!.style.display = 'none';
});
el.addEventListener("touchend", (touchEvent) => {
  //alert("touch end!")
});
el.addEventListener("touchcancel", (touchEvent) => {
  //alert("touch cancel!")
});
el.addEventListener("touchmove", (touchEvent) => {
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
            velocity.y = moveSpeed;
            break;
        case 'KeyZ': // down
            velocity.y = -moveSpeed;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
          turboOn = true;
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

function moveCamera() {
  
    let multiplier = turboOn ? 10 : 1;
    let temp = velocity.clone();
    direction.copy(temp.multiplyScalar(multiplier)).applyQuaternion(camera.quaternion);
    camera.position.add(direction);
  
    /*
    // todo: fix me
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    yawObject.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    velocity.set(0, 0, 0);
    velocity.addScaledVector(forward, -this.moveZ * this.moveSpeed * delta);
    velocity.addScaledVector(right, this.moveX * this.moveSpeed * delta);

    yawObject.position.add(this.velocity);
    */
}

// https://lil-gui.georgealways.com/
const gui = new GUI();
gui.title('Debug');
gui.close();
gui.add( document, 'title' );
gui.add(settings, 'skyType', { Skybox: 0, Shader: 1 } ).onChange((value: any) => switchSky(value));
gui.add(scene.children, 'length').name('Scene Children Count').listen();
gui.add(renderer.info.memory, 'geometries').name('Scene Geometry Count').listen();
gui.add(renderer.info.memory, 'textures').name('Scene Texture Count').listen();
gui.add(renderer.info?.programs!, 'length').name('Scene Program Count').listen();
gui.add(settings, 'lockCameraToTerrain').name('Lock Camera To Terrain?').listen();

const quadTreeFolder = gui.addFolder('Quadtree');
quadTreeFolder.add(scene, 'totalNodes').name('Total Nodes').listen();

const cameraFolder = gui.addFolder('Camera Position');
const cameraX = cameraFolder.add(camera.position, 'x', scene.quadTree.bounds.min.x, scene.quadTree.bounds.max.x).listen();
const cameraY = cameraFolder.add(camera.position, 'y', 0, 10000).listen();
const cameraZ = cameraFolder.add(camera.position, 'z', scene.quadTree.bounds.min.y, scene.quadTree.bounds.max.y).listen();
cameraFolder.open();

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

function tick() {

  moveCamera();

  //renderer.clear();
  renderer.render(scene, camera);

  stats.update();
  requestAnimationFrame(tick);

  scene.update(settings.lockCameraToTerrain);
}

tick()