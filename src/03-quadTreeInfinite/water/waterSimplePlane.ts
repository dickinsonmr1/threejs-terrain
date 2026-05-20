import * as THREE from 'three'
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import vertexShader from './waterSimplePlane.vert?raw';
import fragmentShader from './waterSimplePlane.frag?raw';

export class WaterSimplePlane {
    /**
     *
     */
    public mesh: THREE.Mesh;

    constructor(scene: THREE.Scene, camera: THREE.Camera, skyTexture: THREE.Texture) {

        const normalMap = new THREE.TextureLoader().load(
            "https://threejs.org/examples/textures/waternormals.jpg"
        );
        normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
        
        const waterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                normalMap: { value: normalMap },
                reflectionMap: { value : skyTexture },

                normalScale: { value: 0.5 },
                waveSpeed1: { value: new THREE.Vector2(0.05, 0.02) },
                waveSpeed2: { value: new THREE.Vector2(-0.03, 0.04) },

                useFresnel: { value: true },
                useDiffuse: { value: true },

                lightDir: { value: new THREE.Vector3(0.5, 1.0, 0.3).normalize() },
                waterColor: { value: new THREE.Color(0x1e90ff) },
                waterOpacity: { value: 0.6 },

                time: { value: 0 },
                cameraPosition: { value: camera.position }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false
        });

        // water plane
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100000, 100000, 128, 128),
            waterMaterial
            //new THREE.MeshStandardMaterial({transparent: true, color: new THREE.Color('blue'), opacity: 0.7})
        );

        this.mesh.position.y = 10.01;
        this.mesh.rotation.x = -Math.PI / 2;
        scene.add(this.mesh);                
    }

    public update(mainCamera: THREE.PerspectiveCamera, waterY: number) {

    }
}