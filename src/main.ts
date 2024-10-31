import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css'
import * as THREE from 'three'
import { HeightMapArray } from './heightMapArray';
import { QuadtreeTerrainSystem } from './quadtreeTerrainSystem';
import { Water } from 'three/examples/jsm/objects/Water.js';
import GUI from 'lil-gui';
import { Sky } from 'three/addons/objects/Sky.js';
import { SkyType } from './skyType';
import { PerlinTerrainGenerator } from './perlinTerrainGenerator';
import Stats from 'three/addons/libs/stats.module.js';

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(5, 20, 5);
const material =new THREE.MeshStandardMaterial({color: 0x00ff00});

const mesh1 = new THREE.Mesh(geometry, material);
mesh1.position.set(0, 10, 0);
scene.add(mesh1);

const mesh2 = new THREE.Mesh(geometry, material);
mesh2.position.set(512, 10, 0);
scene.add(mesh2);

const mesh3 = new THREE.Mesh(geometry, material);
mesh3.position.set(0, 10, 512);
scene.add(mesh3);

const mesh4 = new THREE.Mesh(geometry, material);
mesh4.position.set(512, 10, 512);
scene.add(mesh4);


const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.8 );
scene.add( light );

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

const maxLODLevel = 4;        
const heightScale = 50;
var array = new HeightMapArray();

var perlin1 = new PerlinTerrainGenerator();
//await perlin1.generateHeightmap(256, 10).then((heightmap: number[][]) => {
//await array.generateRandom(512, heightScale).then((heightmap) => {
await array.generateFromAsset('assets/mountain_circle_512x512.png').then((heightmap) => {
    // Heightmap is fully loaded and ready to use
    console.log('Heightmap loaded successfully:', heightmap);
    
    // You can now safely use the heightmap for further processing
    // For example: generate terrain, visualize it, etc.
            
    var terrain = new QuadtreeTerrainSystem(scene, heightmap.length, maxLODLevel, heightmap, heightScale, isWireFrame);
    //terrain.buildFullQuadtree(terrain.root, maxLODLevel);

    quadtreeTerrainSystem = terrain;
})
.catch((error) => {
    console.error('Error loading heightmap:', error);
});

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
baseMesh.position.set(0, 0, -256);
scene.add(baseMesh);

const material2 = new THREE.MeshStandardMaterial({ color: 'green', wireframe: isWireFrame });
const filteredHeightmap = perlinTerrainGenerator.createFilteredHeightmapFromFullResolutionHeightMap(baseHeightmap, terrainLodResolution); // Lower resolution
const lodMesh = perlinTerrainGenerator.createMesh(filteredHeightmap, terrainFullSize, material2);
lodMesh.position.set(256, 0, -256);
scene.add(lodMesh);

const temp = {
  width: 1920,
  height: 1080
};

const camera = new THREE.PerspectiveCamera(75, temp.width / temp.height);
camera.far = 10000;
camera.position.z = 4;
//camera.position.set(256, 500, 256);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(temp.width, temp.height);
document.body.appendChild(renderer.domElement);

const debugOrbitControls = new OrbitControls(camera, renderer.domElement);

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

cameraFolder.add(debugOrbitControls.position0, 'x', -100, 100).name('debug orbit controls X Position').listen();
cameraFolder.add(debugOrbitControls.position0, 'y', -100, 100).name('debug orbit controls Y Position').listen();
cameraFolder.add(debugOrbitControls.position0, 'z', -100, 100).name('debug orbit controls Z Position').listen();

// Open the folder by default (optional)
cameraFolder.open();


const terrainFolder = gui.addFolder('TerrainFolder');
terrainFolder.add(quadtreeTerrainSystem, 'totalNodes').listen();
// todo: add items

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
  debugOrbitControls.update();
  debugOrbitControls.getDistance

  //renderer.clear();
  renderer.render(scene, camera);

  stats.update();
  requestAnimationFrame(tick);

  if(quadtreeTerrainSystem != null)
    quadtreeTerrainSystem.update(camera);

  if(water !== null)    
    water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
}

tick()