import * as THREE from 'three'

export class WaterSimplePlane {
    /**
     *
     */
    public mesh: THREE.Mesh;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        const normalMap = new THREE.TextureLoader().load(
            "https://threejs.org/examples/textures/waternormals.jpg"
        );
        normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
        
        const waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            normalMap: { value: normalMap },
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
            uniform float time;
            //uniform vec3 cameraPosition;

            varying vec2 vUv;
            varying vec3 vWorldPos;

            void main() {

            // world-space UVs → stable waves
            vec2 worldUv = vWorldPos.xz * 0.05;

            // scrolling normals (2 layers)
            vec2 uv1 = worldUv + vec2(time * 0.03, time * 0.02);
            vec2 uv2 = worldUv + vec2(-time * 0.02, time * 0.025);

            vec3 n1 = texture2D(normalMap, uv1).rgb;
            vec3 n2 = texture2D(normalMap, uv2).rgb;

            vec3 normal = normalize(n1 * 2.0 - 1.0 + n2 * 2.0 - 1.0);

            // fake lighting (up vector)
            float light = dot(normal, vec3(0.0, 1.0, 0.0));

            // view direction
            vec3 viewDir = normalize(cameraPosition - vWorldPos);

            // Fresnel effect
            float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);

            // base water color
            vec3 waterColor = vec3(0.0, 0.3, 0.5);

            // final color
            vec3 color = waterColor;
            color += fresnel * 0.5;     // edge reflection feel
            color *= 0.5 + light * 0.5; // lighting

            gl_FragColor = vec4(color, 0.6); // semi-transparent
            }
        `,
        transparent: true,
        depthWrite: false
        });

        // water plane
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000, 128, 128),
            waterMaterial
            //new THREE.MeshStandardMaterial({transparent: true, color: new THREE.Color('blue'), opacity: 0.7})
        );

        this.mesh.position.y = 5.01;
        this.mesh.rotation.x = -Math.PI / 2;
        scene.add(this.mesh);                
    }

    public update(mainCamera: THREE.PerspectiveCamera, waterY: number) {

    }
}