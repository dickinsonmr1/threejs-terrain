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


    private material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ vertexColors: false});
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
        //console.log(`generateBillboardsForNode for node with bounds: min(${bounds.min.x}, ${bounds.min.y}) -> max(${bounds.max.x}, ${bounds.max.y})`);
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
                        vertices.push(x, elevation + 3, z);
                    }
                }            
            }
        }    
        bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
                
        console.log(`tree billboards count for node: ${vertices.length / 3}`);
        return new THREE.Points(bufferGeometry, this.pointsMaterial );

    }

    public generateBillboardsForNode2(bounds: THREE.Box2, spacing: number, threshold: number = 0.8) : THREE.Points {
        //console.log(`generateBillboardsForNode2 for node with bounds: min(${bounds.min.x}, ${bounds.min.y}) -> max(${bounds.max.x}, ${bounds.max.y})`);

        const bufferGeometry = new THREE.BufferGeometry();
        const vertices = [];

        let meshDrawOffset = bounds.getCenter(new THREE.Vector2());

        for (let x = bounds.min.x; x < bounds.max.x; x += spacing) {
            for (let z = bounds.min.y; z < bounds.max.y; z += spacing) {
        //for (let x = bounds.min.x + meshDrawOffset.x; x < bounds.max.x + meshDrawOffset.x; x += spacing) {
            //for (let z = bounds.min.y + meshDrawOffset.y; z < bounds.max.y + meshDrawOffset.y; z += spacing) {
                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, -z);                       
                if (elevation > threshold) {
                    vertices.push(x + meshDrawOffset.x, elevation + 3, z);
                }
            }
        }
        bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
                
        console.log(`tree billboards count for node: ${vertices.length / 3}`);
        return new THREE.Points(bufferGeometry, this.pointsMaterial );
    }

    public generateInstancedMeshForNode(bounds: THREE.Box2, maxCount: number): THREE.InstancedMesh {
        //console.log(`generateInstancedMeshForNode for node with bounds: min(${bounds.min.x}, ${bounds.min.y}) -> max(${bounds.max.x}, ${bounds.max.y})`);
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

        console.log(`tree instanced mesh count for node: ${instancedMesh.count}`);
        instancedMesh.visible = true;
        return instancedMesh;
    }    

    public generateInstancedMeshForNode2(bounds: THREE.Box2, maxCount: number, spacing: number, color: THREE.Color, threshold: number = 0.8): THREE.InstancedMesh {

        let meshDrawOffset = bounds.getCenter(new THREE.Vector2());

        console.log(`generateInstancedMeshForNode2 for node with bounds: min(${bounds.min.x}, ${bounds.min.y}) -> max(${bounds.max.x}, ${bounds.max.y})`);
        this.counter = 0; 
        var instancedMesh = new THREE.InstancedMesh(this.geometry.clone(), this.material, maxCount);        

        var breakNow: boolean = false;
        
        //var startX = bounds.min.x - Math.abs(bounds.min.x) % spacing;        
        //var startZ = bounds.min.y - Math.abs(bounds.min.y) % spacing;

        var startX = Math.floor(bounds.min.x / spacing) * spacing;
        var endX = Math.floor(bounds.max.x / spacing) * spacing;

        var startZ = Math.floor(bounds.min.y / spacing) * spacing;
        var endZ = Math.floor(bounds.max.y / spacing) * spacing;

        for (let x = startX; x < endX; x += spacing) {
            for (let z = startZ; z < endZ; z += spacing) {

                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, z);       
                
                if (elevation > threshold) {
                    //const matrix = new THREE.Matrix4().setPosition(x + meshDrawOffset.x, elevation + 8, z + meshDrawOffset.y);
                    const matrix = new THREE.Matrix4().setPosition(x, elevation + 20, -z);
                    this.counter++;
                    instancedMesh.setMatrixAt(this.counter, matrix);
                    if(x == startX)
                        instancedMesh.setColorAt(this.counter, new THREE.Color('white'));
                    else
                        instancedMesh.setColorAt(this.counter, color);
                    
                }
                if(this.counter > maxCount)
                    breakNow = true;

                if(breakNow) 
                    break;
            }
            if(breakNow)
                break;
        }
       
        instancedMesh.instanceColor!.needsUpdate = true;
        console.log(`tree instanced mesh count for node: ${instancedMesh.count}`);
        instancedMesh.visible = true;
        return instancedMesh;
    }    
}