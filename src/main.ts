import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css'
import * as THREE from 'three'

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material =new THREE.MeshStandardMaterial({color: 0x00ff00});

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.5 );
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
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick()