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
        const particleCount = 1000;
      
        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const lifetimes = new Float32Array(particleCount);
      
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 0] = (Math.random() - 0.5) * 5 + 100; // x
          positions[i * 3 + 1] = Math.random() * 2; // y
          positions[i * 3 + 2] = (Math.random() - 0.5) * 5 + 100; // z
          lifetimes[i] = Math.random(); // random lifetime for each particle
        }
      
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("lifetime", new THREE.BufferAttribute(lifetimes, 1));
      
        // Create the ShaderMaterial
        this.material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uColor: { value: new THREE.Color(0xff4500) }, // Fire color
          },
          vertexShader: `
            uniform float uTime;
            attribute float lifetime;
            varying float vLifetime;
      
            void main() {
              vLifetime = lifetime;
      
              vec3 animatedPosition = position;
              animatedPosition.y += uTime * 5.0 * lifetime; // Move upward over time
              animatedPosition.x += sin(uTime + position.x) * 0.1; // Flicker in x
              animatedPosition.z += cos(uTime + position.z) * 0.1; // Flicker in z
      
              gl_Position = projectionMatrix * modelViewMatrix * vec4(animatedPosition, 1.0);
              gl_PointSize = 10.0 * (1.0 - lifetime); // Size decreases as lifetime ends
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            varying float vLifetime;
      
            void main() {
              float alpha = 1.0 - vLifetime; // Fade out with lifetime
              gl_FragColor = vec4(uColor, alpha);
            }
          `,
          transparent: true, // Enable transparency for fade effect
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
      
        // Create the particle system
        const particleSystem = new THREE.Points(geometry, this.material);
      
        return particleSystem;
    }
    public update(clock: THREE.Clock): void {
        let material = this.fireParticles.material as THREE.ShaderMaterial;
        material.uniforms['uTime'].value = clock.getElapsedTime();
    }
}