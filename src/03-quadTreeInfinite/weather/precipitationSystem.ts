import * as THREE from 'three';

import vertexShader from './rain.vert?raw';
import fragmentShader from './rain.frag?raw';
import { InstancedMeshClouds } from './instancedMeshClouds';
import { transcode } from 'buffer';
import GameScene from '../gameScene';

export enum PrecipitationType {
    None = 0,
    Rain = 1,
    Snow = 2
}

export class PrecipitationSystem {

    // https://www.youtube.com/watch?v=1bkibGIG8i0

    private static maxY: number = 500;

    private static rainCount: number = 100000;
    private rainGeometry?: THREE.BufferGeometry;
    private rainUniforms: any;
    private rainMaterial?: THREE.ShaderMaterial;


    private static cloudCount: number = 10000;
    private cloudGeometry?: THREE.BufferGeometry;
    private cloudUniforms: any;
    private cloudMaterial?: THREE.ShaderMaterial;

    private cloudTexture: THREE.Texture;

    private clouds: THREE.Mesh[] = [];
    private billboardClouds: THREE.Group = new THREE.Group;
    private instancedMeshClouds?: InstancedMeshClouds;

    private flash?: THREE.PointLight;

    constructor(scene: THREE.Scene, private mapSize: number, precipitationType: PrecipitationType, horizontalScale: number) {

        this.generateRain(scene, mapSize, precipitationType, horizontalScale);
        
        let loader = new THREE.TextureLoader();
        this.cloudTexture = loader.load("assets/weather/cloud-128x128.png");

        
        //this.generateSpriteClouds(scene, mapSize);
        //this.generateMeshClouds(scene, mapSize);
        //this.generateInstancedMeshClouds(scene, mapSize);
        this.generatePointsClouds(scene, mapSize, horizontalScale);

        // lightning
        this.flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
        this.flash.position.set(0, 300, 0);
        scene.add(this.flash);

        const sphereSize = 50;
        const pointLightHelper = new THREE.PointLightHelper( this.flash, sphereSize );
        scene.add( pointLightHelper );
    }    
    
    private generateRain(scene: THREE.Scene, mapSize: number, precipitationType: PrecipitationType, horizontalScale: number): void {
        // Create an empty geometry
        this.rainGeometry = new THREE.BufferGeometry();

        // Define the number of raindrops
        
        this.rainUniforms = {
            uTime: { value: 0.0 },
            uVelocity: { value: precipitationType == PrecipitationType.Rain ? 250.0 : 50.0},
            blueColor: { value: precipitationType == PrecipitationType.Rain ? 0.8 : 0.6},
            uCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
            uRainSpawnY: {value: PrecipitationSystem.maxY },
            dropletSize: { value: precipitationType == PrecipitationType.Rain ? 50 : 6},
            uLifetime: { value: 3000 },
        };

        // Create an array to hold the positions of the raindrops
        const positions = new Float32Array(PrecipitationSystem.rainCount * 3);
        const velocities = new Float32Array(PrecipitationSystem.rainCount); // velocity for each raindrop

        for (let i = 0; i < PrecipitationSystem.rainCount; i++) {
            positions[i * 3] = Math.random() * (mapSize * horizontalScale) - (mapSize * horizontalScale / 2); // x position
            positions[i * 3 + 1] = Math.random() * PrecipitationSystem.maxY + PrecipitationSystem.maxY; // y position
            positions[i * 3 + 2] = Math.random() * (mapSize * horizontalScale) - (mapSize * horizontalScale / 2); // z position
            velocities[i] = Math.random() + 0.5; // random velocity
        }

        // Set the positions as the attribute of the geometry
        this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        var textureName = precipitationType == PrecipitationType.Rain ? 'assets/weather/rain_8x8.png' : 'assets/weather/snow.png';
        var sprite = new THREE.TextureLoader().load( textureName );
        sprite.colorSpace = THREE.SRGBColorSpace;

        //sprite.wrapS = THREE.ClampToEdgeWrapping;
        //sprite.wrapT = THREE.ClampToEdgeWrapping;
        //sprite.repeat.set(1, 1); // Ensure texture isn't repeated

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
            uniforms: this.rainUniforms,

            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const rain = new THREE.Points(this.rainGeometry, this.rainMaterial);
        rain.frustumCulled = false;
        rain.renderOrder = 2; // draw after clouds
        scene.add(rain);   
        
    }
    
    private generateSpriteClouds(scene: THREE.Scene, mapSize: number) {
        // billboard clouds
        const createCloud = (x: number, y: number, z: number, scale: number) => {

            var temp = Math.random()
            const spriteMaterial = new THREE.SpriteMaterial({
              map: this.cloudTexture,
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
             
        for (let i = 0; i < 0; i++) {
            const x = Math.random() * mapSize - mapSize / 2;
            const y = Math.random() * 100 + PrecipitationSystem.maxY - 50;
            const z = Math.random() * mapSize - mapSize / 2
            const scale = Math.random() * 1000 - 500; // Randomize cloud sizes
            createCloud(x, y, z, scale);
        }
        
        scene.add(this.billboardClouds);          
    }

    private generateMeshClouds(scene: THREE.Scene, mapSize: number) {        
        let cloudGeo = new THREE.PlaneGeometry(500, 500);
        let cloudMaterial = new THREE.MeshLambertMaterial({
            map: this.cloudTexture,   
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
            scene.add(cloud);
        }
    }

    private generateInstancedMeshClouds(scene: THREE.Scene, mapSize: number) {
        this.instancedMeshClouds = new InstancedMeshClouds(scene, 500, this.cloudTexture);
    }

    private generatePointsClouds(scene: THREE.Scene, mapSize: number, horizontalScale: number) {            
        
        this.cloudGeometry = new THREE.BufferGeometry();

        const cloudTexture = new THREE.TextureLoader().load('assets/weather/cloud-32x32.png');
        cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
        cloudTexture.minFilter = THREE.LinearMipmapLinearFilter;
        cloudTexture.magFilter = THREE.LinearFilter;
        cloudTexture.colorSpace = THREE.SRGBColorSpace;

        const size = new THREE.Vector2();

        let gameScene = <GameScene>scene;
        gameScene.renderer.getSize(size); // CSS pixels
        const dpr = gameScene.renderer.getPixelRatio();
        const viewportHeightPx = size.y * dpr; // actual pixel height

        this.cloudUniforms = {
            uTexture: { value: cloudTexture},
            //uTime: { value: 0.0 },
            //uCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
            //uRainSpawnY: {value: PrecipitationSystem.maxY },            
            //uLifetime: { value: 3000 },
            uScale: { value: window.innerHeight / 2 }, // used for attenuation scaling
            uViewportHeight: { value: viewportHeightPx },
            uDarkness: { value: 0.4 }, // 0 = white, 1 = very dark
            uTime: { value: 0.0 },
            uWind: { value: new THREE.Vector2(100.0, 100.0) }, // XZ direction (wind speed)
        };

        
        // Create an array to hold the positions of the raindrops
        let cloudPositions = new Float32Array(PrecipitationSystem.cloudCount * 3);
        const cloudSizes = new Float32Array(PrecipitationSystem.cloudCount); // random size for each cloud

        for (let i = 0; i < PrecipitationSystem.rainCount; i++) {
            cloudPositions[i * 3] = Math.random() * (mapSize * horizontalScale) - (mapSize * horizontalScale / 2); // x position
            cloudPositions[i * 3 + 1] = Math.random() * PrecipitationSystem.maxY + PrecipitationSystem.maxY; // y position
            cloudPositions[i * 3 + 2] = Math.random() * (mapSize * horizontalScale) - (mapSize * horizontalScale / 2); // z position
            cloudSizes[i] = Math.random() * 200 + 200; // random cloud size
        }

        // Set the positions as the attribute of the geometry
        this.cloudGeometry.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
        this.cloudGeometry.setAttribute('aSize', new THREE.BufferAttribute(cloudSizes, 1));

        this.cloudMaterial = new THREE.ShaderMaterial({
            
            uniforms: this.cloudUniforms,            
            vertexShader: `

                varying vec2 vUv;
                //uniform float uScale;

                uniform float uTime;
                uniform vec2 uWind;

                uniform float uViewportHeight; // in pixels (typically renderer.domElement.height * devicePixelRatio)
                attribute float aSize;         // size in world units (or interpret as desired)
                varying float vAlpha;      
                varying float vSeed;          

                void main() {            
                
                    // Wind movement — offset clouds in XZ
                    vec3 pos = position;
                    pos.xz += uWind * uTime;

                    vUv = uv; // pass texture coordinates to fragment shader                 
                                        
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    float dist = max(0.0001, -mvPosition.z); // distance in camera space

                    // projectionMatrix[1][1] = 1.0 / tan(fov/2)
                    float worldToNDC = projectionMatrix[1][1];
                    float pixelsPerWorldUnit = worldToNDC * (uViewportHeight * 0.5);

                    // final size attenuation in pixels
                    float size = aSize * pixelsPerWorldUnit / dist;

                    gl_PointSize = clamp(size, 1.0, 200.0);
                    gl_Position = projectionMatrix * mvPosition;

                    vAlpha = 1.0; 
                }
            `,
            fragmentShader: `            
                uniform sampler2D uTexture;
                varying float vSeed;
                varying float vAlpha;
                uniform float uDarkness;

                // hash-like function for subtle per-particle variation
                float rand(float n) { return fract(sin(n) * 43758.5453123); }

                void main() {
                    vec2 uv = gl_PointCoord;

                    // make circular fade mask (soft edges)
                    float distToCenter = length(uv - 0.5);
                    float edgeFade = smoothstep(0.5, 0.25, distToCenter); // 1.0 at center, 0.0 at edge

                    // sample texture (optional; could use white if you prefer)
                    vec4 texColor = texture2D(uTexture, uv);

                    // random brightness and softness variation
                    float variation = mix(0.8, 1.2, rand(vSeed));
                    float softness = mix(0.8, 1.5, rand(vSeed * 2.0));

                    // simulate light falloff from top-left (fake lighting)
                    float lighting = clamp(0.7 + (uv.y - 0.5) * 0.4, 0.6, 1.0);

                    // Darken overall color
                    vec3 baseColor = texColor.rgb * lighting * variation;
                    baseColor = mix(baseColor, vec3(0.05, 0.05, 0.08), uDarkness); // mix toward dark grey-blue

                    float alpha = texColor.a * edgeFade * vAlpha;
                    if (alpha < 0.05) discard;

                    gl_FragColor = vec4(baseColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false
        });

        // points clouds
        const cloudPoints = new THREE.Points(this.cloudGeometry, this.cloudMaterial);
        cloudPoints.frustumCulled = false;
        cloudPoints.renderOrder = 1; // draw before rain
        scene.add(cloudPoints);          
    }

    update(clock: THREE.Clock, camera: THREE.Camera): void {

        if(this.rainMaterial) {
            this.rainMaterial.uniforms['uCameraPosition'].value.copy(camera.position);
            this.rainMaterial.uniforms['uTime'].value += 0.5 / 60.0;
            if(this.rainMaterial.uniforms['uTime'].value >= 5)
                this.rainMaterial.uniforms['uTime'].value = 0;
        }
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

        if(this.flash) {
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
        }

         // Optional: Move clouds for dynamic effects
        this.billboardClouds.children.forEach((cloud) => {
            cloud.position.x += 0.01; // Move clouds slowly
            if (cloud.position.x > 100) cloud.position.x = -100; // Loop clouds
        });

        if(this.instancedMeshClouds)
            this.instancedMeshClouds.update(camera);

        if(this.cloudMaterial) {
            this.cloudMaterial.uniforms['uTime'].value += 0.5 / 60.0;
            if(this.cloudMaterial.uniforms['uTime'].value >= 10)
                this.cloudMaterial.uniforms['uTime'].value = 0;
        }
    }
}