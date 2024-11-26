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

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.near = 1;
camera.far = 10000;
camera.position.set(0, 50, 0);
camera.updateProjectionMatrix();

const scene = new GameScene(camera);

const stats = new Stats();
document.body.appendChild(stats.dom)

const settings = {  
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

const renderer = new THREE.WebGLRenderer({
  //antialias: true,
  //logarithmicDepthBuffer: true
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

// https://threejs.org/examples/#misc_controls_pointerlock
const pointerLockControls = new PointerLockControls( camera, document.body );

const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );

instructions!.addEventListener( 'click', function () {
  pointerLockControls.lock();
});

pointerLockControls.addEventListener( 'lock', function () {
  instructions!.style.display = 'none';
  blocker!.style.display = 'none';
});

pointerLockControls.addEventListener( 'unlock', function () {
  blocker!.style.display = 'block';
  instructions!.style.display = '';
});

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
}

// https://lil-gui.georgealways.com/
const gui = new GUI();

gui.add( document, 'title' );
gui.add(settings, 'skyType', { Skybox: 0, Shader: 1 } ).onChange((value: any) => switchSky(value));
gui.add(scene.children, 'length').name('Scene Children Count').listen();
gui.add(renderer.info.memory, 'geometries').name('Scene Geometry Count').listen();
gui.add(renderer.info.memory, 'textures').name('Scene Texture Count').listen();
gui.add(renderer.info?.programs!, 'length').name('Scene Program Count').listen();

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

// Handle pointer lock errors
document.addEventListener('pointerlockerror', (event) => {
  console.error('Pointer lock failed:', event);
});

function switchSky(skyType: SkyType) {
  scene.switchSky(skyType);
}

function tick() {

  moveCamera();

  //renderer.clear();
  renderer.render(scene, camera);

  stats.update();
  requestAnimationFrame(tick);

  scene.update();
}

tick()