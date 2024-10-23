import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css'
import * as THREE from 'three'
import { HeightMapArray } from './heightMapArray';
import { QuadtreeTerrainSystem } from './quadtreeTerrainSystem';
import { Water } from 'three/examples/jsm/objects/Water.js';

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(5, 5, 5);
const material =new THREE.MeshStandardMaterial({color: 0x00ff00});

const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 5, 0);

scene.add(mesh);

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.8 );
scene.add( light );

const textureLoader = new THREE.TextureLoader();
let skyTexture = textureLoader.load(
  'assets/industrial_sunset_puresky.jpg',
  () => {

      skyTexture.mapping = THREE.EquirectangularReflectionMapping;
      skyTexture.colorSpace = THREE.SRGBColorSpace;
      scene.background = skyTexture;
  }  
);

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

const maxLODLevel = 5;        
var array = new HeightMapArray();
await array.generate('assets/mountain_circle_512x512.png').then((heightmap) => {
    // Heightmap is fully loaded and ready to use
    console.log('Heightmap loaded successfully:', heightmap);
    
    // You can now safely use the heightmap for further processing
    // For example: generate terrain, visualize it, etc.
            
    var terrain = new QuadtreeTerrainSystem(scene, heightmap.length, maxLODLevel, heightmap, 150);
    terrain.buildFullQuadtree(terrain.root, maxLODLevel);

    quadtreeTerrainSystem = terrain;
})
.catch((error) => {
    console.error('Error loading heightmap:', error);
});

const temp = {
  width: 1024,
  height: 720
};

const camera = new THREE.PerspectiveCamera(75, temp.width / temp.height);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(temp.width, temp.height);
document.body.appendChild(renderer.domElement);

const debugOrbitControls = new OrbitControls(camera, renderer.domElement);

function tick() {
  debugOrbitControls.update();

  //renderer.clear();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);

  if(quadtreeTerrainSystem !== null)
    quadtreeTerrainSystem.update(camera);

  if(water !== null)    
    water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
}

tick()