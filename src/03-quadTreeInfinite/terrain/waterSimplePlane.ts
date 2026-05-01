import * as THREE from 'three'
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
     
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
            vertexShader:`
                varying vec2 vUv;
                varying vec3 vWorldPos;

                void main() {
                    vUv = uv;

                    vec4 world = modelMatrix * vec4(position, 1.0);
                    vWorldPos = world.xyz;

                    gl_Position = projectionMatrix * viewMatrix * world;
                }
            `,
            fragmentShader: `
                uniform sampler2D normalMap;
                //uniform samplerCube envMap;
                uniform sampler2D reflectionMap;

                uniform float normalScale;
                uniform vec2 waveSpeed1;
                uniform vec2 waveSpeed2;

                uniform bool useFresnel;
                uniform bool useDiffuse;

                uniform vec3 lightDir;
                uniform vec3 waterColor;
                uniform float waterOpacity;

                uniform float time;

                varying vec2 vUv;
                varying vec3 vWorldPos;

                vec2 sampleEquirectangular(vec3 dir) {
                    float phi = atan(dir.z, dir.x);
                    float theta = asin(dir.y);

                    return vec2(
                        0.5 + phi / (2.0 * 3.14159265),
                        0.5 - theta / 3.14159265
                    );
                }            

                void main() {

                    // temporarily override for texture2d
                    //gl_FragColor = texture2D(reflectionMap, vUv);
                    //return;

                    // temporarily override for texturecube
                    //gl_FragColor = vec4(textureCube(reflectionMap, vec3(0.0, 1.0, 0.0)).rgb, 1.0);
                    //return;

                    // -------------------------
                    // World-space UVs (stable)
                    // -------------------------
                    vec2 worldUv = vWorldPos.xz * 0.05;

                    // -------------------------
                    // Animated normal map (2 layers)
                    // -------------------------
                    vec2 uv1 = worldUv + vec2(time * waveSpeed1.x, time * waveSpeed1.y);
                    vec2 uv2 = worldUv + vec2(-time * waveSpeed2.x, time * waveSpeed2.y);

                    vec3 n1 = texture2D(normalMap, uv1).rgb;
                    vec3 n2 = texture2D(normalMap, uv2).rgb;

                    // combine + convert from [0,1] → [-1,1]
                    vec3 normal = normalize(n1 * 2.0 - 1.0 + n2 * 2.0 - 1.0);

                    // View direction
                    vec3 viewDir = normalize(cameraPosition - vWorldPos);

                    // Reflection vector (for skybox)
                    vec3 reflectDir = reflect(-viewDir, normal);
                    reflectDir.z *= -1.0;

                    // reflection / environment map (skybox)
                    //vec3 reflection = textureCube(reflectionMap, reflectDir).rgb;
                    vec3 reflection = texture2D(reflectionMap, sampleEquirectangular(reflectDir)).rgb;

                    // Fresnel (angle-based blend)
                    float fresnel = 0.0;
                    if (useFresnel) {
                        fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 5.0);
                        //fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
                        //fresnel = clamp(fresnel, 0.2, 0.8);
                    }

                    // Fake diffuse lighting
                    float diffuse = 1.0;
                    if (useDiffuse) {
                        diffuse = max(dot(normal, normalize(lightDir)), 0.0);
                    }

                        // Final color
                        //vec3 color = mix(waterColor, reflection, fresnel);
                        // apply lighting
                        //color *= 0.5 + light * 0.5;
                        //color = mix(color, waterColor, 0.2);

                    // Output (semi-transparent)                    
                    // temporary to only show reflection
                    //gl_FragColor = vec4(reflection, 1.0);
                    //return;

                    vec3 base = waterColor * diffuse;
                    vec3 color = mix(base, reflection, fresnel);
                    
                    gl_FragColor = vec4(color, waterOpacity);

                        //float alpha = mix(0.4, 0.8, fresnel);
                        //gl_FragColor = vec4(color, alpha);                     
                }
            `,
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