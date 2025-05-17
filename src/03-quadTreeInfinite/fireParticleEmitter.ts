import * as THREE from 'three'

export class FireParticleEmitter {
    /**
     *
     */
    private smokeParticles: THREE.Points;
    private fireParticles: THREE.Points;
    private fireParticleMaterial!: THREE.ShaderMaterial;
    private smokeParticleMaterial!: THREE.ShaderMaterial;

    constructor(scene: THREE.Scene) {
                
        this.fireParticles = this.createFireParticles(3);
        this.smokeParticles = this.createSmokeParticles(2.5, new THREE.Vector3(0, 3, 0));
        scene.add(this.fireParticles);
        scene.add(this.smokeParticles);
    }    

    private createFireParticles(fireSize: number): THREE.Points {
        // Create particle attributes
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);

        const origin = new THREE.Vector3(100, 5, 100);

        const lifetimeMax = 5.0; // max lifetime in seconds

        for (let i = 0; i < particleCount; i++) {

            const angle = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
            const r = Math.sqrt(Math.random()) * fireSize; // Random radius with sqrt for uniform distribution
            const randOffsetX = Math.cos(angle) * r;
            const randOffsetZ = Math.sin(angle) * r;

            positions.set([origin.x + randOffsetX, origin.y, origin.z + randOffsetZ], i * 3);
            velocities.set([
                (Math.random() * 0.2) - 0.1,
                Math.random() * 3.0,
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
        this.fireParticleMaterial = new THREE.ShaderMaterial({
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
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 1.25 * (300.0 / -mvPosition.z) * (1.0 - lifeProgress);
                    // scale with perspective, shrink with time                                    

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                }
            `,
            fragmentShader: `
                precision highp float;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {

                    float dist = length(gl_PointCoord - vec2(0.5)); // distance from center of point
                    if (dist > 0.5) discard; // discard outside circle

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
        const particleSystem = new THREE.Points(geometry, this.fireParticleMaterial);
      
        return particleSystem;
    }

    private createSmokeParticles(smokeSize: number, startOffset: THREE.Vector3): THREE.Points {
        // Create particle attributes
        const particleCount = 250;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);

        const origin = new THREE.Vector3(100, 5, 100);

        const lifetimeMax = 5.0; // max lifetime in seconds

        for (let i = 0; i < particleCount; i++) {

            //let randOffsetX = (Math.random() * smokeSize) - smokeSize/2;
            //let randOffsetZ = (Math.random() * smokeSize) - smokeSize/2;

            const angle = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
            const r = Math.sqrt(Math.random()) * smokeSize; // Random radius with sqrt for uniform distribution
            const randOffsetX = Math.cos(angle) * r;
            const randOffsetZ = Math.sin(angle) * r;

            positions.set([
                origin.x + randOffsetX,
                origin.y + startOffset.y,
                origin.z + randOffsetZ
            ], i * 3);
            velocities.set([
                (Math.random() * 1) - 0.5,
                Math.random() * 2 + 2,
                (Math.random() * 1) - 0.5,
            ], i * 3);
            lifetimes[i] = Math.random() * lifetimeMax;
        }

        // Buffer geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));

        // Shader material
        this.smokeParticleMaterial = new THREE.ShaderMaterial({
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

                    // Color transition
                    v_color = mix(vec3(0.0, 0.0, 0.0), vec3(0.5, 0.5, 0.5), lifeProgress);
                    
                    v_opacity = 0.25;

                    /*
                    if(lifeProgress < 0.5)
                        v_opacity = 0.25;
                    else if(lifeProgress >= 0.5)
                        v_opacity = 0.25 * (1.0 - lifeProgress);
                    */

                    // When the particle has reached its lifetime, reset
                    if (lifeProgress >= 2.0) {
                        pos = u_origin; // Reset to the origin
                        v_color = vec3(0.0, 0.0, 0.0);
                        v_opacity = 0.25;
                    }

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = (50.0 / -mvPosition.z) * lifeProgress * 25.0;
                    // scale with perspective, grow with time                                    
                }
            `,
            fragmentShader: `
                precision highp float;

                varying float v_opacity;
                varying vec3 v_color;

                void main() {

                    float dist = length(gl_PointCoord - vec2(0.5)); // distance from center of point
                    if (dist > 0.5) discard; // discard outside circle

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
        const particleSystem = new THREE.Points(geometry, this.smokeParticleMaterial);
      
        return particleSystem;
    }

    public update(clock: THREE.Clock): void {
        
        let fireMaterial = this.fireParticles.material as THREE.ShaderMaterial;
        fireMaterial.uniforms['u_time'].value = clock.getElapsedTime();

        let smokeMaterial = this.smokeParticles.material as THREE.ShaderMaterial;
        smokeMaterial.uniforms['u_time'].value = clock.getElapsedTime();
    }
}