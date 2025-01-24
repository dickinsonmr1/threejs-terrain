import * as THREE from 'three'

export class FireParticleEmitter {
    /**
     *
     */
    private fireParticles: THREE.Points;
    private material!: THREE.ShaderMaterial;

    constructor(scene: THREE.Scene) {
                
        this.fireParticles = this.createFireParticles();
        scene.add(this.fireParticles);
    }    

    private createFireParticles(): THREE.Points {
        // Create particle attributes
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);

        const origin = new THREE.Vector3(100, 5, 100);

        const lifetimeMax = 5.0; // max lifetime in seconds

        let fireSize = 3;
        for (let i = 0; i < particleCount; i++) {

            let randOffsetX = (Math.random() * fireSize) - fireSize/2;
            let randOffsetZ = (Math.random() * fireSize) - fireSize/2;

            positions.set([origin.x + randOffsetX, origin.y, origin.z + randOffsetZ], i * 3);
            velocities.set([
                (Math.random() * 0.2) - 0.1,
                Math.random() * 2.0,
                (Math.random() * 0.2) - 0.1,
            ], i * 3);
            lifetimes[i] = Math.random() * lifetimeMax;
        }

        // Buffer geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));

        // Shader material
        this.material = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float u_time;
                uniform float u_lifetime;
                uniform vec3 u_origin;

                attribute vec3 velocity;
                attribute float lifetime;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {
                    float age = mod(u_time, lifetime);
                    float lifeProgress = age / lifetime;

                    // Reset particle position, velocity, etc., if lifetime is reached
                    vec3 pos = position + velocity * age;

                    // Color transition from yellow to red
                    v_color = mix(vec3(1.0, 0.9, 0.0), vec3(1.0, 0.0, 0.0), lifeProgress);
                    
                    // Opacity fades out as it reaches the lifetime
                    v_opacity = 1.0 - lifeProgress;

                    // When the particle has reached its lifetime, reset
                    if (lifeProgress >= 1.0) {
                        pos = u_origin; // Reset to the origin
                        v_color = vec3(1.0, 0.5, 0.0);
                        v_opacity = 1.0;
                    }

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 15.0 * (1.0 - lifeProgress); // Shrink with time
                }
            `,
            fragmentShader: `
                precision highp float;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {
                    // Render particle with fading opacity
                    gl_FragColor = vec4(v_color, v_opacity);
                }
 
            `,
            uniforms: {
                u_time: { value: 0.0 },
                u_lifetime: { value: lifetimeMax },
                u_origin: { value: origin },
            },
            transparent: true,
            depthWrite: false,
        });
      
        // Create the particle system
        const particleSystem = new THREE.Points(geometry, this.material);
      
        return particleSystem;
    }
    public update(clock: THREE.Clock): void {
        let material = this.fireParticles.material as THREE.ShaderMaterial;
        material.uniforms['u_time'].value = clock.getElapsedTime();
    }
}