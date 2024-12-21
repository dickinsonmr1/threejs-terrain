import * as THREE from 'three';

export enum PrecipitationType {
    None = 0,
    Rain = 1,
    Snow = 2
}

export class PrecipitationSystem {

    // https://www.youtube.com/watch?v=1bkibGIG8i0

    private static rainCount: number = 20000;
    rainGeometry: THREE.BufferGeometry;
    private static maxY: number = 500;

    private velocityY: number;

    uniforms = {
        uTime: { value: 0.0 },
        uFallSpeed: { value: 100.0}
    };
    rainMaterial: THREE.ShaderMaterial;

    constructor(scene: THREE.Scene, mapSize: number, precipitationType: PrecipitationType, horizontalScale: number) {

        // Create an empty geometry
        this.rainGeometry = new THREE.BufferGeometry();

        // Define the number of raindrops

        // Create an array to hold the positions of the raindrops
        const positions = new Float32Array(PrecipitationSystem.rainCount * 3);
        const velocities = new Float32Array(PrecipitationSystem.rainCount); // velocity for each raindrop

        for (let i = 0; i < PrecipitationSystem.rainCount; i++) {
            positions[i * 3] = Math.random() * (mapSize * horizontalScale) - (mapSize * horizontalScale / 2); // x position
            positions[i * 3 + 1] = Math.random() * PrecipitationSystem.maxY; // y position
            positions[i * 3 + 2] = Math.random() * (mapSize * horizontalScale) - (mapSize * horizontalScale / 2); // z position
            velocities[i] = Math.random() * 0.5 + 0.5; // random velocity
        }

        // Set the positions as the attribute of the geometry
        this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        this.velocityY = precipitationType == PrecipitationType.Rain ? 0.5 : 0.1;

        var textureName = precipitationType == PrecipitationType.Rain ? 'assets/weather/rain_8x8.png' : 'assets/weather/snow.png';
        var sprite = new THREE.TextureLoader().load( textureName );
        sprite.colorSpace = THREE.SRGBColorSpace;

        sprite.wrapS = THREE.ClampToEdgeWrapping;
        sprite.wrapT = THREE.ClampToEdgeWrapping;
        sprite.repeat.set(1, 1); // Ensure texture isn't repeated

        /*
        const rainMaterial = new THREE.PointsMaterial({
            //color: 0xaaaaaa,  // Gray color for raindrops
            //size: 0.3,        // Size of each raindrop
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            map: sprite,
            depthWrite: false,
            sizeAttenuation: true
        });
        */


        this.rainMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                attribute float velocity;
                uniform float uTime;
                uniform float uFallSpeed;
                void main() {
                    vec3 pos = position;
                    pos.y -= velocity * uFallSpeed * uTime; // Update position based on velocity and time
                    pos.y = mod(pos.y, 200.0); // Update position based on velocity and time

                    //if (pos.y <= 0.0) pos.y += 100.0; // Reset position when it falls below threshold

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 4.0; // Size of each raindrop
                }
          `,
          fragmentShader: `
            void main() {
              gl_FragColor = vec4(0.7, 0.7, 1.0, 0.7); // Light blue raindrops
            }
          `,
            transparent: true,
        });

        const rain = new THREE.Points(this.rainGeometry, this.rainMaterial);
        scene.add(rain);          
    }

    animateRain(clock: THREE.Clock): void {

        //this.rainMaterial.uniforms['uTime'].value += clock.getDelta();
        this.rainMaterial.uniforms['uTime'].value += 0.5 / 60.0;
        if(this.rainMaterial.uniforms['uTime'].value >= 5)
            this.rainMaterial.uniforms['uTime'].value = 0;
        /*
        
        console.log(this.rainMaterial.uniforms['uTime'].value);
        
        if(this.rainMaterial.uniforms['uTime'].value >= 1)
            this.rainMaterial.uniforms['uTime'].value = 0;
        */
        /*
        const positions = this.rainGeometry.attributes.position.array as Float32Array;
            
        for (let i = 0; i < PrecipitationSystem.rainCount; i++) {
            positions[i * 3 + 1] -= this.velocityY; // Move raindrop down
    
            // Reset position if it falls below a certain point
            if (positions[i * 3 + 1] < -0) {
                positions[i * 3 + 1] = PrecipitationSystem.maxY;
            }
        }
    
        // Need to update the geometry attribute
        this.rainGeometry.attributes.position.needsUpdate = true;
        */
    }
}