import * as THREE from 'three'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';
import { TerrainSimplexNoiseGenerator } from '../../shared/terrainSimplexNoiseGenerator';
import { SeededRandom } from '../../shared/seededRandom';

export class GrassGenerator {

    private vegetationNoise2D: NoiseFunction2D;

    private pointsMaterial?: THREE.PointsMaterial;

    private plane: THREE.PlaneGeometry;    
    private instancedMeshMaterial?: THREE.ShaderMaterial;

    private sprite: THREE.Texture;

    constructor(scene: THREE.Scene, private terrainSimplexNoiseGenerator: TerrainSimplexNoiseGenerator, textureName: string, private yMin: number, private yMax: number) {
        const prng = alea(1000);
        this.vegetationNoise2D = createNoise2D(prng);

        this.sprite = new THREE.TextureLoader().load( textureName );
        this.sprite.colorSpace = THREE.SRGBColorSpace;

        this.pointsMaterial = new THREE.PointsMaterial( { size: 5, sizeAttenuation: true, map: this.sprite, alphaTest: 0.5, transparent: true, depthTest: true, depthWrite: false } );
        //this.pointsMaterial.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
        //this.pointsMaterial.color.setHSL( 1.0, 0.0, 0.0, THREE.SRGBColorSpace );

        this.instancedMeshMaterial = new THREE.ShaderMaterial({
            vertexShader: /* glsl */`            
            uniform sampler2D uTexture;
            uniform float uTime;
            uniform float uWindStrength;
            uniform vec2 uWindDirection;

            varying vec2 vUv;

            void main() {
                    vUv = uv;

                    // Billboard logic (face camera)
                    vec3 up = vec3(0.0, 1.0, 0.0);
                    vec3 cameraRight = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
                    vec3 cameraForward = vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]);

                    // Vertex position before wind
                    vec3 pos = position;

                    // Wind sway — only affect upper part of blade
                    float swayFactor = smoothstep(0.0, 1.0, uv.y);
                    float sway = sin((instanceMatrix[3].x + uTime) * 0.5 + instanceMatrix[3].z * 0.2) * uWindStrength;
                    pos.x += sway * swayFactor * uWindDirection.x;
                    pos.z += sway * swayFactor * uWindDirection.y;

                    // Construct billboard position
                    vec3 instancePosition = instanceMatrix[3].xyz;
                    vec3 displaced =
                        cameraRight * pos.x +
                        up * pos.y +
                        cameraForward * pos.z +
                        instancePosition;
                        
                    gl_Position = projectionMatrix * viewMatrix * vec4(displaced, 1.0);

                    //vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
                    //vec4 projectedPosition = projectionMatrix * modelViewMatrix * worldPosition;

                    //gl_Position = projectedPosition;
                }
                `,
            fragmentShader: `
                uniform sampler2D uTexture;

                varying vec2 vUv;

                void main() {

                    gl_FragColor = vec4(1, 1, 1, 1);//textureColor;
                    return;

                    vec4 textureColor = texture2D(uTexture, vUv);                  
                    if(textureColor.a < 0.8)  
                        discard;

                    //gl_FragColor = vec4(textureColor.r, textureColor.g, textureColor.b, 0.2);
                    gl_FragColor = textureColor;

                }
            `,
            uniforms: {
                uTexture: {value: this.sprite },
                uTime: { value: 0 },
                uWindStrength: { value: 0.5 },
                uWindDirection: { value: new THREE.Vector2(1.0, 0.5) },                    
            },
            transparent: true        
        });

        this.plane = new THREE.PlaneGeometry(5);        
    }

    public generateBillboardsForNode(bounds: THREE.Box2, maxCount: number): THREE.Points {
       
        let seededRandom = new SeededRandom(5000);

        const bufferGeometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < maxCount; i++) {
    
            const x = bounds.min.x + bounds.getSize(new THREE.Vector2()).x * seededRandom.next();
            const z = -bounds.min.y - bounds.getSize(new THREE.Vector2()).y * seededRandom.next();
    
            let elevation = this.terrainSimplexNoiseGenerator.getHeightFromNoiseFunction(x, -z);
            if(elevation > this.yMin && elevation < this.yMax)
                vertices.push( x, elevation + 3, z);
        }    
        bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
               
        console.log(`grass billboards count for node: ${vertices.length / 3}`);
        return new THREE.Points(bufferGeometry, this.pointsMaterial );
    }    

    public generateInstancedMeshForNode(bounds: THREE.Box2, maxCount: number): THREE.InstancedMesh {
       
        const seededRandom = new SeededRandom(5000);
        const instancedMesh = new THREE.InstancedMesh(this.plane.clone(), this.instancedMeshMaterial, maxCount);
        
        let grassInstancedMeshCounter = 0;
        const dummy = new THREE.Object3D();
        for (let i = 0; i < maxCount; i++) {
    
            const x = bounds.min.x + bounds.getSize(new THREE.Vector2()).x * seededRandom.next();
            const z = -bounds.min.y - bounds.getSize(new THREE.Vector2()).y * seededRandom.next();
    
            let elevation = this.terrainSimplexNoiseGenerator.getHeightFromNoiseFunction(x, -z);
            if(elevation > this.yMin && elevation < this.yMax) {
                
                dummy.position.set(x, elevation + 3, z);
                dummy.rotation.y = Math.random() * Math.PI * 2;
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(grassInstancedMeshCounter++, dummy.matrix);
            }
        }    
    
        console.log(`grass instanced mesh count for node: ${grassInstancedMeshCounter}`);
        instancedMesh.visible = true;
        return instancedMesh;
    }        
}