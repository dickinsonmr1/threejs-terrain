import './style.css'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js';
import GUI from 'lil-gui';
import { Sky } from 'three/addons/objects/Sky.js';
import { SkyType } from './skyType';
import Stats from 'three/addons/libs/stats.module.js';
import { TerrainChunkManager, TerrainGridParams } from './chunk/terrainChunkManager';
import { TerrainGeneratorParams } from './chunk/terrainGeneratorParams';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();

const stats = new Stats();
document.body.appendChild(stats.dom)

const textureLoader = new THREE.TextureLoader();
let skyTexture = textureLoader.load(
  'assets/industrial_sunset_puresky.jpg',
  () => {

      skyTexture.mapping = THREE.EquirectangularReflectionMapping;
      skyTexture.colorSpace = THREE.SRGBColorSpace;
      scene.background = skyTexture;
  }  
);

const sky = new Sky();
sky.scale.setScalar( 450000 );

const phi = THREE.MathUtils.degToRad( 90 );
const theta = THREE.MathUtils.degToRad( 180 );
const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );

sky.material.uniforms.sunPosition.value = sunPosition;

scene.add( sky );

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

const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
let water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        } ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        //fog: this.fog !== undefined
    }
);
water.rotation.x = - Math.PI / 2;
water.position.y = -0.5;
scene.add( water );

let quadtreeTerrainSystem: any;

const isWireFrame = true;

//const maxLODLevel = 4;        
//const heightScale = 25;
//var array = new HeightMapArray();
//let initialVertexCount = 8;

// quadtree
/*
var perlin1 = new PerlinTerrainGenerator();
//await perlin1.generateHeightmap(1024, 5).then((heightmap: number[][]) => {
//await array.generateRandom(512, heightScale).then((heightmap) => {
await array.generateFromAsset('assets/mountain_circle_512x512.png').then((heightmap) => {
    // Heightmap is fully loaded and ready to use
    console.log('Heightmap loaded successfully:', heightmap);
    
    // You can now safely use the heightmap for further processing
    // For example: generate terrain, visualize it, etc.
            
    var terrain = new QuadtreeTerrainSystem(scene, heightmap.length, maxLODLevel, heightmap, 1, initialVertexCount, isWireFrame);
    //terrain.buildFullQuadtree(terrain.root, maxLODLevel);

    quadtreeTerrainSystem = terrain;
})
.catch((error) => {
    console.error('Error loading heightmap:', error);
});
*/

/*
const perlinTerrainGenerator = new PerlinTerrainGenerator();

var simpleTerrainMesh = perlinTerrainGenerator.generateSimpleTerrain(256, 20);
simpleTerrainMesh.position.set(256, 0, -256);
//scene.add(simpleTerrainMesh);

let terrainFullSize = 256;
let terrainLodResolution = 64;
let heightScale2 = 10;
const material1 = new THREE.MeshStandardMaterial({ color: 'red', wireframe: isWireFrame });
const baseHeightmap = await perlinTerrainGenerator.generateHeightmap(terrainFullSize, heightScale2); // full resolution
const baseMesh = perlinTerrainGenerator.createMesh(baseHeightmap, terrainFullSize, material1);
baseMesh.position.set(0, 0, 0);
scene.add(baseMesh);

// LOD test
const material2 = new THREE.MeshStandardMaterial({ color: 'green', wireframe: isWireFrame });
const filteredHeightmap = perlinTerrainGenerator.createFilteredHeightmapFromFullResolutionHeightMap(baseHeightmap, terrainLodResolution); // Lower resolution
const lodMesh = perlinTerrainGenerator.createMesh(filteredHeightmap, terrainFullSize, material2);
lodMesh.position.set(0, 0, -256);
scene.add(lodMesh);
*/

let terrainGridParams = new TerrainGridParams(16, 64, 5, Math.PI * 0);
let terrainGeneratorParams = new TerrainGeneratorParams(1100, 6, 1.8, 4.5, 300, 0.71);
let terrainChunkManager = new TerrainChunkManager(scene, terrainGridParams, isWireFrame);
terrainChunkManager.generate(terrainGridParams, terrainGeneratorParams);

let light2 = new THREE.DirectionalLight(0x808080, 0.8);
light2.position.set(-100, 100, -100);
light2.target.position.set(0, 0, 0);
light2.castShadow = true;
scene.add(light2);

let light3 = new THREE.DirectionalLight(0x404040, 0.8);
light3.position.set(100, 100, -100);
light3.target.position.set(0, 0, 0);
light3.castShadow = true;
scene.add(light3);

const temp = {
  width: 1920,
  height: 1080
};

const camera = new THREE.PerspectiveCamera(75, temp.width / temp.height);
camera.far = 10000;
//camera.position.z = 4;
camera.position.set(16, 16, 16);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(temp.width, temp.height);
document.body.appendChild(renderer.domElement);

// https://threejs.org/examples/#misc_controls_pointerlock
const pointerLockControls = new PointerLockControls( camera, document.body );
document.addEventListener('click', () => pointerLockControls.lock());

const moveSpeed = 10;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': // Forward
            velocity.z = -moveSpeed;
            break;
        case 'KeyS': // Backward
            velocity.z = moveSpeed;
            break;
        case 'KeyA': // Left
            velocity.x = -moveSpeed;
            break;
        case 'KeyD': // Right
            velocity.x = moveSpeed;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'KeyS':
            velocity.z = 0;
            break;
        case 'KeyA':
        case 'KeyD':
            velocity.x = 0;
            break;
    }
});

function moveCamera() {
    direction.copy(velocity).applyQuaternion(camera.quaternion);
    camera.position.add(direction);
}


// https://lil-gui.georgealways.com/
const gui = new GUI();

gui.add( document, 'title' );
let obj3 = { size: 'Small', terrainType: 3 };
gui.add( obj3, 'size', [ 'Small', 'Medium', 'Large' ] );
gui.add( obj3, 'terrainType', { Simple: 1, Splatted: 2, LOD: 3 } );

gui.add(settings, 'skyType', { Skybox: 0, Shader: 1 } ).onChange((value: any) => switchSky(value));


const cameraFolder = gui.addFolder('Camera Position');

// Add camera position controls
cameraFolder.add(camera.position, 'x', -10000, 10000).name('X Position').listen();
cameraFolder.add(camera.position, 'y', -500, 500).name('Y Position').listen();
cameraFolder.add(camera.position, 'z', -10000, 10000).name('Z Position').listen();

//cameraFolder.add(debugOrbitControls.position0, 'x', -100, 100).name('debug orbit controls X Position').listen();
//cameraFolder.add(debugOrbitControls.position0, 'y', -100, 100).name('debug orbit controls Y Position').listen();
//cameraFolder.add(debugOrbitControls.position0, 'z', -100, 100).name('debug orbit controls Z Position').listen();

// Open the folder by default (optional)
cameraFolder.open();


const terrainFolder = gui.addFolder('TerrainFolder');
terrainFolder.add(terrainGridParams, 'chunksPerSideOfGrid', 1, 128, 1).onChange(rebuild);
terrainFolder.add(terrainGridParams, 'verticesPerSide', 2, 256, 2).onChange(rebuild);
terrainFolder.add(terrainGridParams, 'heightScale', 1, 10, 1).onChange(rebuild);
terrainFolder.add(terrainGridParams, 'meshRotation', 0, 2 * Math.PI, Math.PI / 2).onChange(rebuild);
//terrainFolder.add(terrainChunkManager, 'isWireframe', { False: 0, True: 1 }).onChange(rebuild);

terrainFolder.add(terrainGeneratorParams, 'scale', 1, 10000, 100).onChange(rebuild);
terrainFolder.add(terrainGeneratorParams, 'octaves', 1, 10, 0.25).onChange(rebuild);
terrainFolder.add(terrainGeneratorParams, 'lacunarity', 1, 100, 1).onChange(rebuild);
terrainFolder.add(terrainGeneratorParams, 'exponentiation', 1, 10, 0.5).onChange(rebuild);
terrainFolder.add(terrainGeneratorParams, 'height', 1, 500, 10).onChange(rebuild);
terrainFolder.add(terrainGeneratorParams, 'persistence', 1, 5, 0.25).onChange(rebuild);


const onShaderChange = () => {
  //for (let k in settings.sky) {
    sky.material.uniforms["turbidity"].value = settings.sky.turbidity;
    sky.material.uniforms["rayleigh"].value = settings.sky.rayleigh;
    sky.material.uniforms["mieCoefficient"].value = settings.sky.mieCoefficient;
    sky.material.uniforms["mieDirectionalG"].value = settings.sky.mieDirectionalG;
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

  sky.material.uniforms['sunPosition'].value.copy(sunPosition);
  water.material.uniforms['sunDirection'].value.copy(sunPosition.normalize());
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

const otherFolder = gui.addFolder('Other');
otherFolder.add(water.position, 'y', -10, 20, 0.5);

function rebuild() {
  terrainChunkManager.regenerate(terrainGridParams, terrainGeneratorParams);
}

function switchSky(skyType: SkyType) {

  if(skyType == SkyType.Shader) {
    sky.visible = true;
    scene.background = null;
  
  }
  else {
    sky.visible = false;
    scene.background = skyTexture;
  }
  
}

function tick() {

  moveCamera();

  //renderer.clear();
  renderer.render(scene, camera);

  stats.update();
  requestAnimationFrame(tick);

  if(quadtreeTerrainSystem != null)
    quadtreeTerrainSystem.update(camera);

  if(terrainChunkManager != null)
    terrainChunkManager.update(camera, terrainGridParams, terrainGeneratorParams);

  if(water !== null)    
    water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
}

tick()
