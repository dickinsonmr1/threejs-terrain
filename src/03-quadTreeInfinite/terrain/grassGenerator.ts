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

    private billboardSprite: THREE.Texture;
    private instancedMeshSprite: THREE.Texture;

    constructor(scene: THREE.Scene,
        private simplexNoiseGenerator: TerrainSimplexNoiseGenerator,
        billboardTextureName: string, 
        instancedMeshTextureName: string,
        private yMin: number, private yMax: number) {
            
        const prng = alea(1000);
        this.vegetationNoise2D = createNoise2D(prng);

        this.billboardSprite = new THREE.TextureLoader().load( billboardTextureName );
        this.billboardSprite.colorSpace = THREE.SRGBColorSpace;
        this.billboardSprite.wrapS = this.billboardSprite.wrapT = THREE.ClampToEdgeWrapping;

        this.pointsMaterial = new THREE.PointsMaterial( { size: 5, sizeAttenuation: true, map: this.billboardSprite, alphaTest: 0.5, transparent: true, depthTest: true, depthWrite: false } );
        //this.pointsMaterial.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
        //this.pointsMaterial.color.setHSL( 1.0, 0.0, 0.0, THREE.SRGBColorSpace );

        this.instancedMeshSprite = new THREE.TextureLoader().load( instancedMeshTextureName );
        this.instancedMeshSprite.colorSpace = THREE.SRGBColorSpace;
        this.instancedMeshSprite.wrapS = this.instancedMeshSprite.wrapT = THREE.ClampToEdgeWrapping;

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
                }
                `,
            fragmentShader: `
                uniform sampler2D uTexture;

                varying vec2 vUv;

                void main() {

                    // for debugging
                    //gl_FragColor = vec4(1, 1, 1, 1);//textureColor;
                    //return;

                    vec4 textureColor = texture2D(uTexture, vUv);                  
                    if(textureColor.a < 0.8)  
                        discard;

                    //gl_FragColor = vec4(textureColor.r, textureColor.g, textureColor.b, 0.2);
                    gl_FragColor = textureColor;

                }
            `,
            uniforms: {
                uTexture: {value: this.instancedMeshSprite },
                uTime: { value: 0 },
                uWindStrength: { value: 0.5 },
                uWindDirection: { value: new THREE.Vector2(1.0, 0.5) },                    
            },
            transparent: true        
        });

        this.plane = new THREE.PlaneGeometry(5, 5);    
        /* 
        const uvs = new Float32Array([
            0,0,
            1,0,
            1,1,
            0,1,
        ]);
        this.plane.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));   
        */
        console.log(this.plane.attributes.uv);
    }

    public generateBillboardsForNode(isDebug: boolean, bounds: THREE.Box2, spacing: number, debugColor: THREE.Color): THREE.Points {
       
        const cellSize = spacing;
        const bufferGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        var startX = bounds.min.x - Math.abs(bounds.min.x) % cellSize;        
        var endX = Math.floor(bounds.max.x / cellSize) * cellSize;

        var startZ = bounds.min.y - Math.abs(bounds.min.y) % cellSize;
        var endZ = Math.floor(bounds.max.y / cellSize) * cellSize;

        for (let x = startX + 1; x < endX; x += cellSize) {
            for (let z = startZ + 1; z < endZ; z += cellSize) {
                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, z);                       
                
                if (elevation > this.yMin && elevation < this.yMax) {
                    //vertices.push(x + meshDrawOffset.x, elevation + 3, -z);
                    vertices.push(x, elevation + 1, -z);
                    if(isDebug)                    
                        //colors.push(debugColor.r, debugColor.g, debugColor.b);
                        colors.push(1,0,0);
                    else
                        colors.push(0, 1, 0);
                }
            }
        }

        bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
        bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ));

        console.log(`grass billboards count for node: ${vertices.length / 3}`);
        return new THREE.Points(bufferGeometry, this.pointsMaterial );
    }    

    public generateInstancedMeshForNode(isDebug: boolean, bounds: THREE.Box2, maxCount: number, spacing: number, debugColor: THREE.Color): THREE.InstancedMesh {
       
        const cellSize = spacing;
        const instancedMesh = new THREE.InstancedMesh(this.plane.clone(), this.instancedMeshMaterial, maxCount);
        //instancedMesh.frustumCulled = false;
        
        let grassInstancedMeshCounter = 0;
        const dummy = new THREE.Object3D();

        var breakNow: boolean = false;

        var startX = bounds.min.x - Math.abs(bounds.min.x) % cellSize;        
        var endX = Math.floor(bounds.max.x / cellSize) * cellSize;
        var startZ = bounds.min.y - Math.abs(bounds.min.y) % cellSize;
        var endZ = Math.floor(bounds.max.y / cellSize) * cellSize;

        for (let x = startX + 1; x < endX; x += cellSize) {
            for (let z = startZ + 1; z < endZ; z += cellSize) {

                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, z);
                if(elevation > this.yMin && elevation < this.yMax) {
                    
                    const matrix = new THREE.Matrix4().setPosition(x, elevation + 3, -z);

                    //dummy.position.set(x, elevation + 3, -z);
                    //dummy.rotation.y = Math.random() * Math.PI * 2;
                    //dummy.updateMatrix();

                    grassInstancedMeshCounter++;
                    instancedMesh.setMatrixAt(grassInstancedMeshCounter, matrix);
                    if(isDebug)
                        instancedMesh.setColorAt(grassInstancedMeshCounter, debugColor);
                    else
                        instancedMesh.setColorAt(grassInstancedMeshCounter, new THREE.Color('green'));
                }

                if(grassInstancedMeshCounter > maxCount)
                    breakNow = true;

                if(breakNow) 
                    break;
            }
            if(breakNow) 
                break;
        }    
    
        instancedMesh.count = grassInstancedMeshCounter;
        //instancedMesh.instanceMatrix.needsUpdate = true;
        //instancedMesh.computeBoundingSphere();
        //instancedMesh.boundingSphere!.radius *= 2; // safety margin
        
        console.log(`grass instanced mesh count for node: ${grassInstancedMeshCounter}`);
        instancedMesh.visible = true;
        return instancedMesh;
    }        
}