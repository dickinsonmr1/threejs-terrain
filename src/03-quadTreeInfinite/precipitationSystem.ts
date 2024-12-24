import * as THREE from 'three';

export enum PrecipitationType {
    None = 0,
    Rain = 1,
    Snow = 2
}

export class PrecipitationSystem {

    // https://www.youtube.com/watch?v=1bkibGIG8i0

    private static rainCount: number = 50000;
    rainGeometry: THREE.BufferGeometry;
    private static maxY: number = 1000;

    private velocityY: number;
    private clouds: THREE.Mesh[] = [];

    private flash: THREE.PointLight;

    uniforms = {
        uTime: { value: 0.0 },
        uFallSpeed: { value: 500.0},
        rainAreaCenter: { value: new THREE.Vector3(0, 0, 0) },
        initialRainHeight: {value: PrecipitationSystem.maxY },
        rainRadius: { value: 500 },
    };
    rainMaterial: THREE.ShaderMaterial;
    mapSize: number;

    constructor(scene: THREE.Scene, mapSize: number, precipitationType: PrecipitationType, horizontalScale: number) {


        this.mapSize = mapSize;
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
            velocities[i] = 0.75;//Math.random() * 0.5 + 0.5; // random velocity
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
                uniform vec3 rainAreaCenter;
                uniform float initialRainHeight;
                uniform float rainRadius;

                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }

                void main() {
                    
                    //float newY = position.y - velocity * uFallSpeed * uTime;
                    //if(newY <= 0.0)
                        //newY = mod(newY, 200.0);
                
                    vec3 newPosition = position;
                                    
                    newPosition.y -= velocity * uFallSpeed * uTime; // Update position based on velocity and time
                    newPosition.y = mod(newPosition.y, initialRainHeight); // Update position based on velocity and time
                    
                    /*
                    if (newPosition.y >= initialRainHeight - 5.0) {
                        //newPosition.y += 100.0; // Reset position when it falls below threshold
                        //newPosition.y = initialRainHeight;

                        float angle = random(vec2(newPosition.x, newPosition.z)) * 6.283185;
                        float radius = random(vec2(newPosition.y, newPosition.z)) * rainRadius;
                        newPosition.x = rainAreaCenter.x + cos(angle) * radius;
                        newPosition.z = rainAreaCenter.z + sin(angle) * radius;
                    }
                    */

                    newPosition.x += rainAreaCenter.x;
                    newPosition.z += rainAreaCenter.z;

                    // Size attenuation
                    //float size = 5.0 / -newPosition.z;
                    //gl_PointSize = size;
                            
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                    gl_PointSize = 3.0; // Size of each raindrop
                }
            `,
            fragmentShader: `
            void main() {
                gl_FragColor = vec4(0.7, 0.7, 1.0, 0.7); // Light blue raindrops
            }
            `,
            transparent: false,

        });

        const rain = new THREE.Points(this.rainGeometry, this.rainMaterial);
        rain.frustumCulled = false;
        scene.add(rain);          

        let loader = new THREE.TextureLoader();
        let cloudTexture = loader.load("assets/weather/cloud-128x128.png");
        cloudTexture.colorSpace = THREE.SRGBColorSpace;        
        cloudTexture.wrapS = THREE.ClampToEdgeWrapping;
        cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
        cloudTexture.repeat.set(1, 1); // Ensure texture isn't repeated

        let cloudGeo = new THREE.PlaneGeometry(500, 500);
        let cloudMaterial = new THREE.MeshLambertMaterial({
            map: cloudTexture,   
            transparent: true,
            //alphaTest: 0.1,
            depthTest: true,

            color: new THREE.Color('gray')        
        });

        for(let p = 0; p < 250; p++) {
            let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
            cloud.position.set(
                Math.random()*mapSize- mapSize/2,
                300,
                Math.random()*mapSize- mapSize / 2
            );
            cloud.rotation.x = 1.16;
            cloud.rotation.y = -0.12;
            cloud.rotation.z = Math.random()*360;

            cloud.material.opacity = 0.6
            this.clouds.push(cloud);
            scene.add(cloud);
        }

        this.flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
        this.flash.position.set(0, 300, 0);
        scene.add(this.flash);

        const sphereSize = 50;
        const pointLightHelper = new THREE.PointLightHelper( this.flash, sphereSize );
        scene.add( pointLightHelper );

    }

    update(clock: THREE.Clock, camera: THREE.Camera): void {

        //this.rainMaterial.uniforms['uTime'].value += clock.getDelta();
        this.rainMaterial.uniforms['rainAreaCenter'].value.copy(camera.position);
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

        this.clouds.forEach(x => {
            x.rotation.z -= 0.002;
        });

        if(Math.random() > 0.93) {//} || this.flash.intensity > 100) {
            if(this.flash.intensity < 1000.0) {
                this.flash.position.set(
                    Math.random()*this.mapSize - this.mapSize/2,
                    200,/// + Math.random() * 200,
                    Math.random()*this.mapSize - this.mapSize/2
                );
            }
            this.flash.intensity = 50 + Math.random() * 1000;
            //this.flash.intensity = 10000;
        }
    }
}