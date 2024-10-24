import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css'
import * as THREE from 'three'
import { HeightMapArray } from './heightMapArray';
import { QuadtreeTerrainSystem } from './quadtreeTerrainSystem';
import { Water } from 'three/examples/jsm/objects/Water.js';
import GUI from 'lil-gui';

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
  width: 1920,
  height: 1080
};

const camera = new THREE.PerspectiveCamera(75, temp.width / temp.height);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(temp.width, temp.height);
document.body.appendChild(renderer.domElement);

const debugOrbitControls = new OrbitControls(camera, renderer.domElement);

// https://lil-gui.georgealways.com/
const gui = new GUI();

gui.add( document, 'title' );
/*
let obj = {
	myBoolean: true,
	myString: 'lil-gui',
	myNumber: 1,
	myFunction: function() { alert( 'hi' ) }
};

gui.add( obj, 'myBoolean' ); 	// checkbox
gui.add( obj, 'myString' ); 	// text field
gui.add( obj, 'myNumber' ); 	// number field
gui.add( obj, 'myFunction' ); 	// button

let obj2 = { hasMin: 1, hasMax: 99, hasStep: 50 };

gui.add( obj2, 'hasMin' ).min( 0 );
gui.add( obj2, 'hasMax' ).max( 100 );
gui.add( obj2, 'hasStep' ).step( 10 );

let obj3 = { size: 'Medium', speed: 1 };

gui.add( obj3, 'size', [ 'Small', 'Medium', 'Large' ] );
gui.add( obj3, 'speed', { Slow: 0.1, Normal: 1, Fast: 5 } );
*/

const cameraFolder = gui.addFolder('Camera Position');

// Add camera position controls
cameraFolder.add(camera.position, 'x', -100, 100).name('X Position');
cameraFolder.add(camera.position, 'y', -100, 100).name('Y Position');
cameraFolder.add(camera.position, 'z', -100, 100).name('Z Position');

// Open the folder by default (optional)
cameraFolder.open();

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