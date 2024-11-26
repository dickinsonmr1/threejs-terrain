import * as THREE from 'three'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';
import { SimplexNoiseGenerator } from '../shared/simplexNoiseGenerator';

export class VegetationMeshGenerator {

    private vegetationNoise2D: NoiseFunction2D;
    //private geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 200, 1);

    // TODO: generate number of radial segments based on node LOD in quadtree
    private geometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(0.1, 5, 20, 6);

    private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    private counter: number = 0;
    private instancedMesh!: THREE.InstancedMesh;
    private simplexNoiseGenerator!: SimplexNoiseGenerator;

    constructor(scene: THREE.Scene, simplexNoiseGenerator: SimplexNoiseGenerator) {
        const prng = alea(500);
        this.vegetationNoise2D = createNoise2D(prng);

        this.simplexNoiseGenerator = simplexNoiseGenerator;

        this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, 100000);        
    }

    generateForNode(bounds: THREE.Box2, maxCount: number) {
        
        for ( let i = 0; i < maxCount; i ++ ) {
    
            const x = bounds.min.x + bounds.getSize(new THREE.Vector2()).x * Math.random();
            const z = -bounds.min.y - bounds.getSize(new THREE.Vector2()).y * Math.random();
    
            var vegetationNoise = this.vegetationNoise2D(x, z);
            if(vegetationNoise > 0.0 && vegetationNoise < 0.5){
                
                let elevation = this.simplexNoiseGenerator.getHeightFromNoiseFunction(x, z);       
                if(elevation > 30 && elevation < 40)     {
                    const matrix = new THREE.Matrix4().setPosition(x, elevation + 8, -z);
                    this.instancedMesh.setMatrixAt(this.counter++, matrix);
                }
            }            
        }

        this.instancedMesh.visible = true;
        return this.instancedMesh;
    }    
}