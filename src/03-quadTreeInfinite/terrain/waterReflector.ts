import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/Addons.js';

export class WaterReflector {

    public reflector: Reflector;
    public waterOverlay!: THREE.Mesh;

    constructor(scene: THREE.Scene, waterY: number) {

        const normalMap = new THREE.TextureLoader().load(
            "https://threejs.org/examples/textures/waternormals.jpg"
        );

        normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;   
        
        this.reflector = new Reflector(
            new THREE.PlaneGeometry(10000, 10000, 128, 128), 
            {
                textureWidth: 512,
                textureHeight: 512,
                color: 0x889999
            }
        );

        let shaderMaterial = this.reflector.material as THREE.ShaderMaterial;
        shaderMaterial.uniforms.time = { value: 0 };

        shaderMaterial.onBeforeCompile = (shader) => {

            //console.log(shaderMaterial.vertexShader);
            console.log('>>> WATER FRAGMENT SHADER PRE-TRANSFORM: ');
            console.log(shaderMaterial.fragmentShader);

            shader.uniforms.time = { value: 0 };
            shader.uniforms.normalMap = { value: normalMap };

           // inject uniforms
            shader.fragmentShader = shader.fragmentShader.replace(
                `uniform vec3 color;`,
                `
                uniform vec3 color;
                uniform sampler2D normalMap;
                uniform float time;
                `
            );

            // 🔥 FULL main() replacement (important part)
            shader.fragmentShader = shader.fragmentShader.replace(
                `vec4 base = texture2DProj( tDiffuse, vUv );`,
                `
                // projected UV
                vec2 uv = vUv.xy / vUv.w;

                // normal map distortion (world-stable)
                vec2 uv1 = uv * 4.0 + vec2(time * 0.03, time * 0.02);
                vec2 uv2 = uv * 4.0 + vec2(-time * 0.02, time * 0.025);

                vec3 n1 = texture2D(normalMap, uv1).rgb;
                vec3 n2 = texture2D(normalMap, uv2).rgb;

                vec3 normal = normalize(n1 * 2.0 - 1.0 + n2 * 2.0 - 1.0);

                float strength = 0.03;
                uv += normal.xy * strength;

                vec4 base = texture2DProj(
                    tDiffuse,
                    vec4(uv * vUv.w, vUv.z, vUv.w)
                );
                `
            );

            shaderMaterial.userData.shader = shader;
            
            console.log('>>> WATER FRAGMENT SHADER POST-TRANSFORM: ');
            console.log(shader.fragmentShader);
        };

        this.reflector.position.y = waterY;
        this.reflector.rotation.x = -Math.PI / 2;
        scene.add(this.reflector);            
        
        /*
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
        */
    }

    public update(mainCamera: THREE.PerspectiveCamera, waterY: number) {
        
    }
}