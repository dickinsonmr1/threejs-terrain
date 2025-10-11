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
    private static maxY: number = 500;

    private velocityY: number;
    private clouds: THREE.Mesh[] = [];
    private billboardClouds: THREE.Group = new THREE.Group;

    private flash: THREE.PointLight;

    uniforms: any;
    rainMaterial: THREE.ShaderMaterial;

    constructor(scene: THREE.Scene, private mapSize: number, precipitationType: PrecipitationType, horizontalScale: number) {

        // Create an empty geometry
        this.rainGeometry = new THREE.BufferGeometry();

        // Define the number of raindrops
        
        this.uniforms = {
            uTime: { value: 0.0 },
            uVelocity: { value: precipitationType == PrecipitationType.Rain ? 250.0 : 50.0},
            blueColor: { value: precipitationType == PrecipitationType.Rain ? 0.8 : 0.6},
            uSpawnOffset: { value: new THREE.Vector3(0, 0, 0) },
            uRainSpawnY: {value: PrecipitationSystem.maxY },
            dropletSize: { value: precipitationType == PrecipitationType.Rain ? 50 : 6},
        };

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
                uniform float uVelocity;

                uniform vec3 uSpawnOffset;
                uniform float uRainSpawnY;

                uniform float dropletSize;
                
                varying float vIsReset;

                varying float vAlpha;
                varying float vVelocity;

                void main() {                                    
                    vec3 newPosition = position;
                                    
                    newPosition.y -= velocity * uVelocity * uTime; // Update position based on velocity and time
                    newPosition.y = mod(newPosition.y, uRainSpawnY); // Update position based on velocity and time

                    float t = (uTime * uVelocity + position.y) / uRainSpawnY;
                    float wraps = floor(t);
                    float frac = fract(t);

                    /*
                    // Detect recent reset (optional, for visuals)
                    vIsReset = step(frac, 0.05);
                    
                    // usage of mix: false, true, boolean
                    newPosition.x = mix(position.x, position.x + uSpawnOffset.x, vIsReset);
                    newPosition.z = mix(position.z, position.z + uSpawnOffset.z, vIsReset);
                    */

                    vVelocity = velocity;
                    vAlpha = 1.0 - frac;

                     // view-space transform
                    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Proper size attenuation based on distance to camera
                    float dist = -mvPosition.z; // camera-space depth
                    float attenuation = clamp(200.0 / dist, 0.0, 1.0);
                    gl_PointSize = 20.0 * attenuation;                    
                }
            `,
            fragmentShader: `            
                uniform float blueColor;

                varying float vAlpha;
                varying float vVelocity;

                void main() {

                    // Convert gl_PointCoord from [0,1] to centered [-1,1]
                    vec2 uv = gl_PointCoord * 2.0 - 1.0;

                    
                    uv.x *= 100.0;  // Stretch vertically for line-like streak
                    //uv.y *= 100.0;  // stretch horizontally
                    float r = length(uv);

                    // soft vertical fade
                    float alpha = smoothstep(1.2, 0.0, abs(uv.x)) * vAlpha;
                    

                    if (r > 1.0) discard;
                    
                    //gl_FragColor = vec4(0.5, 0.5, blueColor, 0.5); // Light blue raindrops
                    gl_FragColor = vec4(0.6, 0.7, 1.0, alpha);
                }
            `,
            transparent: false,
        });
        
        const rain = new THREE.Points(this.rainGeometry, this.rainMaterial);
        rain.frustumCulled = false;
        scene.add(rain);          

        let loader = new THREE.TextureLoader();
        let cloudTexture = loader.load("assets/weather/cloud-128x128.png");
        //cloudTexture.colorSpace = THREE.SRGBColorSpace;        
        //cloudTexture.wrapS = THREE.ClampToEdgeWrapping;
        //cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
        //cloudTexture.repeat.set(1, 1); // Ensure texture isn't repeated

        let cloudGeo = new THREE.PlaneGeometry(500, 500);
        let cloudMaterial = new THREE.MeshLambertMaterial({
            map: cloudTexture,   
            transparent: true,
            alphaTest: 0.5,
            depthTest: false,
            side: THREE.DoubleSide,
            //blending: THREE.NormalBlending,
            blendAlpha: 0.5,

            color: new THREE.Color('gray')        
        });

        // mesh clouds
        for(let p = 0; p < 250; p++) {
            let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
            cloud.position.set(
                Math.random()*mapSize- mapSize/2,
                PrecipitationSystem.maxY,
                Math.random()*mapSize- mapSize / 2
            );
            cloud.rotation.x = Math.random() > 0.5 ? 1.16 : -1.16;
            //cloud.rotation.y = -0.12;
            cloud.rotation.z = Math.random()*360;

            cloud.material.opacity = 0.6
            this.clouds.push(cloud);
            //scene.add(cloud);
        }

        this.flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
        this.flash.position.set(0, 300, 0);
        scene.add(this.flash);

        const sphereSize = 50;
        const pointLightHelper = new THREE.PointLightHelper( this.flash, sphereSize );
        scene.add( pointLightHelper );

        // billboard clouds
        const createCloud = (x: number, y: number, z: number, scale: number) => {

            var temp = Math.random()
            const spriteMaterial = new THREE.SpriteMaterial({
              map: cloudTexture,
              transparent: true, // Enable transparency
              alphaTest: 0.5,    // Optional: Remove fully transparent pixels
              depthTest: true,
              color: new THREE.Color('gray')
            });
          
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(x, y, z);
            sprite.scale.set(scale, scale, scale); // Scale the cloud
            this.billboardClouds.add(sprite);
        };
             
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * mapSize - mapSize / 2;
            const y = Math.random() * 100 + PrecipitationSystem.maxY - 50;
            const z = Math.random() * mapSize - mapSize / 2
            const scale = Math.random() * 1000 - 500; // Randomize cloud sizes
            createCloud(x, y, z, scale);
        }

        scene.add(this.billboardClouds);          
    }      

    update(clock: THREE.Clock, camera: THREE.Camera): void {

        //this.rainMaterial.uniforms['uTime'].value += clock.getDelta();
        //this.rainMaterial.uniforms['rainAreaCenter'].value.copy(camera.position);
        this.rainMaterial.uniforms['uSpawnOffset'].value.copy(camera.position);
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
                    PrecipitationSystem.maxY- 100,/// + Math.random() * 200,
                    Math.random()*this.mapSize - this.mapSize/2
                );
            }
            this.flash.intensity = 50 + Math.random() * 2000;
            //this.flash.intensity = 10000;
        }

         // Optional: Move clouds for dynamic effects
        this.billboardClouds.children.forEach((cloud) => {
            cloud.position.x += 0.01; // Move clouds slowly
            if (cloud.position.x > 100) cloud.position.x = -100; // Loop clouds
        });

    }
}