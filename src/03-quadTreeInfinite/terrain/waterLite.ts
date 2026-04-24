import * as THREE from 'three'

export class WaterLite {
    /**
     *
     */
    public renderTarget = new THREE.WebGLRenderTarget(512, 512);
    public mesh: THREE.Mesh;
    public mirrorCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();

    constructor(scene: THREE.Scene) {
        
        const waterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                reflectionTexture: { value: this.renderTarget.texture }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPos;
                uniform float time;

                void main() {
                    vUv = uv;

                    vec3 pos = position;

                    // simple waves
                    pos.y += sin(pos.x * 2.0 + time) * 0.05;
                    pos.y += cos(pos.z * 2.0 + time) * 0.05;

                    vec4 world = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = world.xyz;

                    gl_Position = projectionMatrix * viewMatrix * world;
                }
            `,
            fragmentShader: `
                uniform sampler2D reflectionTexture;
                uniform float time;

                varying vec2 vUv;

                void main() {
                    // distortion
                    vec2 distortion = vec2(
                        sin(vUv.y * 10.0 + time) * 0.02,
                        cos(vUv.x * 10.0 + time) * 0.02
                    );

                    vec2 uv = vUv + distortion;

                    vec4 reflection = texture2D(reflectionTexture, uv);

                    vec3 waterColor = vec3(0.0, 0.3, 0.5);

                    // simple fresnel approximation
                    float fresnel = pow(1.0 - vUv.y, 3.0);

                    vec3 color = mix(waterColor, reflection.rgb, 0.6 + fresnel * 0.4);

                    gl_FragColor = vec4(color, 0.9);
                }
            `,
            transparent: false
        });

        // water plane
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000, 128, 128),
            waterMaterial
        );

        this.mesh.rotation.x = -Math.PI / 2;
        scene.add(this.mesh);                
    }

    public update(mainCamera: THREE.PerspectiveCamera, waterY: number) {
        this.updateMirrorCamera(mainCamera, waterY);
    }

    updateMirrorCamera(mainCamera: THREE.PerspectiveCamera, waterY: number) {
        this.mirrorCamera.position.copy(mainCamera.position);
        
        // reflect over water plane (Y axis)
        this.mirrorCamera.position.y = waterY - (mainCamera.position.y - waterY);

        this.mirrorCamera.rotation.copy(mainCamera.rotation);
        this.mirrorCamera.rotation.x *= -1;

        this.mirrorCamera.updateProjectionMatrix();
    }
}