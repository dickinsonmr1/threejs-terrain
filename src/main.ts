import './style.css'
import * as THREE from 'three'

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material =new THREE.MeshBasicMaterial({color: 0x00ff00});

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

const temp = {
  width: 1024,
  height: 720
};

const camera = new THREE.PerspectiveCamera(75, temp.width / temp.height);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(temp.width, temp.height);
document.body.appendChild(renderer.domElement);

camera.position.z = 4;
renderer.render(scene, camera);