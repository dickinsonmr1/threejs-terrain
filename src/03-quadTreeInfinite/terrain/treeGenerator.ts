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
    private geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(0.1, 5, 25, 6);


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

        this.pointsMaterial = new THREE.PointsMaterial( { size: 50, sizeAttenuation: true, map: this.sprite, alphaTest: 0.5, transparent: true, depthTest: true, depthWrite: false, vertexColors: true } );        
    }

    public generateBillboardsForNode(isDebug: boolean, bounds: THREE.Box2, spacing: number, color: THREE.Color, lowerElevationBound: number, higherElevationBound: number) : THREE.Points {
        console.log(`generateBillboardsForNode for node with bounds: min(${bounds.min.x}, ${bounds.min.y}) -> max(${bounds.max.x}, ${bounds.max.y})`);
        const cellSize = spacing;

        const bufferGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        var startX = bounds.min.x - Math.abs(bounds.min.x) % cellSize;        
        //var startX = Math.floor(bounds.min.x / cellSize) * cellSize;
        var endX = Math.floor(bounds.max.x / cellSize) * cellSize;

        var startZ = bounds.min.y - Math.abs(bounds.min.y) % cellSize;
        //var startZ = Math.floor(bounds.min.y / cellSize) * cellSize;
        var endZ = Math.floor(bounds.max.y / cellSize) * cellSize;

        for (let x = startX + 1; x < endX; x += cellSize) {
            for (let z = startZ + 1; z < endZ; z += cellSize) {
                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, z);                       
                
                if (elevation > lowerElevationBound && elevation < higherElevationBound) {
                    //vertices.push(x + meshDrawOffset.x, elevation + 3, -z);
                    vertices.push(x, elevation + 3, -z);
                    if(isDebug)                    
                        colors.push(color.r, color.g, color.b);
                    else
                        colors.push(0, 1, 0);
                }
            }
        }
        bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
        bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ));
                
        console.log(`tree billboards count for node: ${vertices.length / 3}`);
        return new THREE.Points(bufferGeometry, this.pointsMaterial );
    }

    public generateInstancedMeshForNode(isDebug: boolean, bounds: THREE.Box2, maxCount: number, spacing: number, debugColor: THREE.Color, lowerElevationBound: number, higherElevationBound: number): THREE.InstancedMesh {

        const cellSize = spacing;
        console.log(`generateInstancedMeshForNode for node with bounds: min(${bounds.min.x}, ${bounds.min.y}) -> max(${bounds.max.x}, ${bounds.max.y})`);
        this.counter = 0; 
        var instancedMesh = new THREE.InstancedMesh(this.geometry.clone(), this.material, maxCount);        

        var breakNow: boolean = false;
                
        var startX = bounds.min.x - Math.abs(bounds.min.x) % cellSize;        
        //var startX = Math.floor(bounds.min.x / cellSize) * cellSize;
        var endX = Math.floor(bounds.max.x / cellSize) * cellSize;

        var startZ = bounds.min.y - Math.abs(bounds.min.y) % cellSize;
        //var startZ = Math.floor(bounds.min.y / cellSize) * cellSize;
        var endZ = Math.floor(bounds.max.y / cellSize) * cellSize;

        for (let x = startX + 1; x < endX; x += cellSize) {
            for (let z = startZ + 1; z < endZ; z += cellSize) {

                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, z);       
                
                if (elevation > lowerElevationBound && elevation < higherElevationBound) {

                    const matrix = new THREE.Matrix4().setPosition(x, elevation + 15, -z);
                    this.counter++;
                    instancedMesh.setMatrixAt(this.counter, matrix);
                    if(isDebug)
                        instancedMesh.setColorAt(this.counter, debugColor);
                    else
                        instancedMesh.setColorAt(this.counter, new THREE.Color('green'));
                    
                }
                if(this.counter > maxCount)
                    breakNow = true;

                if(breakNow) 
                    break;
            }
            if(breakNow)
                break;
        }
        
        instancedMesh.count = this.counter;
        //instancedMesh.instanceColor!.needsUpdate = true;
        console.log(`tree instanced mesh count for node: ${instancedMesh.count}`);
        instancedMesh.visible = true;
        return instancedMesh;
    }    
}
