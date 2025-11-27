import * as THREE from 'three'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';
import { TerrainSimplexNoiseGenerator } from '../../shared/terrainSimplexNoiseGenerator';
import { SeededRandom } from '../../shared/seededRandom';

export class TreeGenerator {

    private vegetationNoise2D: NoiseFunction2D;

    private sprite: THREE.Texture;
    private pointsMaterial?: THREE.PointsMaterial;

    // TODO: generate number of radial segments based on node LOD in quadtree
    private geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(0.1, 5, 40, 6);

    private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    private counter: number = 0;
    //private instancedMesh!: THREE.InstancedMesh;
    
    constructor(scene: THREE.Scene, private simplexNoiseGenerator: TerrainSimplexNoiseGenerator,
        textureName: string, private yMin: number, private yMax: number) {

        const prng = alea(500);
        this.vegetationNoise2D = createNoise2D(prng);

        this.sprite = new THREE.TextureLoader().load( textureName );
        this.sprite.colorSpace = THREE.SRGBColorSpace;
        this.sprite.wrapS = this.sprite.wrapT = THREE.ClampToEdgeWrapping;

        this.pointsMaterial = new THREE.PointsMaterial( { size: 50, sizeAttenuation: true, map: this.sprite, alphaTest: 0.5, transparent: true, depthTest: true, depthWrite: false } );        
    }

    public generateBillboardsForNode(bounds: THREE.Box2, maxCount: number): THREE.Points {

        let seededRandom = new SeededRandom(5000);
        const bufferGeometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let i = 0; i < maxCount; i++) {
    
            const x = bounds.min.x + bounds.getSize(new THREE.Vector2()).x * seededRandom.next();
            const z = -bounds.min.y - bounds.getSize(new THREE.Vector2()).y * seededRandom.next();
    
            // todo: fix issue where lots of instanced meshes are generated at (0,0)
            if(Math.abs(x) > 1 && Math.abs(z) > 1) {
                var vegetationNoise = this.vegetationNoise2D(x, z);
                if(vegetationNoise > 0.0 && vegetationNoise < 0.5){
                    
                    let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, -z);       
                    if(elevation > this.yMin && elevation < this.yMax)     {
                        vertices.push( x, elevation + 3, z);
                    }
                }            
            }
        }    
        bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
                
        console.log(`tree billboards count for node: ${vertices.length / 3}`);
        return new THREE.Points(bufferGeometry, this.pointsMaterial );

    }

    public generateInstancedMeshForNode(bounds: THREE.Box2, maxCount: number): THREE.InstancedMesh {
       
        let seededRandom = new SeededRandom(5000);

        this.counter = 0;
        var instancedMesh = new THREE.InstancedMesh(this.geometry.clone(), this.material, maxCount);        
        for ( let i = 0; i < maxCount; i ++ ) {
    
            const x = bounds.min.x + bounds.getSize(new THREE.Vector2()).x * seededRandom.next();
            const z = -bounds.min.y - bounds.getSize(new THREE.Vector2()).y * seededRandom.next();
    
            // todo: fix issue where lots of instanced meshes are generated at (0,0)
            if(Math.abs(x) > 1 && Math.abs(z) > 1) {
                var vegetationNoise = this.vegetationNoise2D(x, z);
                if(vegetationNoise > 0.0 && vegetationNoise < 0.5){
                    
                    let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, -z);       
                    if(elevation > this.yMin && elevation < this.yMax)     {
                        const matrix = new THREE.Matrix4().setPosition(x, elevation + 8, z);
                        instancedMesh.setMatrixAt(this.counter++, matrix);
                    }
                }            
            }
        }
       
       /*
        for (let i = 0; i < terrainMesh!.geometry.attributes.position.count; i++) {

            const x = bounds.min.x + terrainMesh!.geometry.attributes.position.getX(i);
            const y = -bounds.min.y - terrainMesh!.geometry.attributes.position.getY(-i);
            
            var vegetationNoise = this.vegetationNoise2D(x, y);
            if(vegetationNoise > 0.0 && vegetationNoise < 1.01){
                
                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, y);       
                if(elevation > 30 && elevation < 40) {
                    const matrix = new THREE.Matrix4().setPosition(x, elevation + 8, -y);
                    instancedMesh.setMatrixAt(this.counter++, matrix);
                }
            }               
        }
        */

        console.log(`tree instanced mesh count for node: ${instancedMesh.count}`);
        instancedMesh.visible = true;
        return instancedMesh;
    }    
}