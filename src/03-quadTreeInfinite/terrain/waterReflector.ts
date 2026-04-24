import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/Addons.js';

export class WaterReflector {

    public reflector: Reflector;
    public waterOverlay: THREE.Mesh;

    constructor(scene: THREE.Scene, waterY: number) {
        
        this.reflector = new Reflector(
            new THREE.PlaneGeometry(10000, 10000, 128, 128), 
            {
                textureWidth: 512,
                textureHeight: 512,
                color: 0x889999
            }
        );

        this.reflector.position.y = waterY;
        this.reflector.rotation.x = -Math.PI / 2;
        scene.add(this.reflector);            
        
        this.waterOverlay = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000, 128, 128),
            new THREE.ShaderMaterial({
                transparent: true,
                uniforms:
                {
                    time: { value: 0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    uniform float time;

                    void main() {
                        vUv = uv;

                        vec3 pos = position;

                        pos.y += sin(pos.x * 5.0 + time * 3.0) * 0.15;

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec2 vUv;
                    uniform float time;

                    void main() {
                        float wave = sin(vUv.x * 20.0 + time * 5.0) * 0.5;

                        gl_FragColor = vec4(0.0, 0.4, 0.7, 0.4 + wave * 0.2);
                    }
                `
            })
        );

        this.waterOverlay.rotation.x = -Math.PI / 2;
        this.waterOverlay.position.y = waterY + 0.1; // slightly above reflector
        scene.add(this.waterOverlay);
    }

    public update(mainCamera: THREE.PerspectiveCamera, waterY: number) {
        
    }
}