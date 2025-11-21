import * as THREE from 'three'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';
import { SimplexNoiseGenerator } from '../../shared/simplexNoiseGenerator';
import { SeededRandom } from '../../shared/seededRandom';

export class GrassGenerator {

    private vegetationNoise2D: NoiseFunction2D;

    private billboardGeometry: THREE.BufferGeometry;
    private instancedMeshGeometry: THREE.PlaneGeometry;

    private pointsMaterial?: THREE.PointsMaterial;
    private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});

    private counter: number = 0;
    
    constructor(scene: THREE.Scene, private simplexNoiseGenerator: SimplexNoiseGenerator) {
        const prng = alea(500);
        this.vegetationNoise2D = createNoise2D(prng);

        this.billboardGeometry =new  THREE.BufferGeometry();
        this.instancedMeshGeometry = new THREE.PlaneGeometry(5);        
    }

    public generateBillboardsForNode(bounds: THREE.Box2, terrainMesh: THREE.Mesh, maxCount: number): THREE.Points {
       
        // todo: implement me
        let seededRandom = new SeededRandom(5000);
       
        //console.log(`grass billboards count for node: ${instancedMesh.count}`);
        //instancedMesh.visible = true;
        return new THREE.Points( this.billboardGeometry, this.pointsMaterial );
    }    

    public generateInstancedMeshForNode(bounds: THREE.Box2, terrainMesh: THREE.Mesh, maxCount: number): THREE.InstancedMesh {
       
        let seededRandom = new SeededRandom(5000);

        this.counter = 0;
        var instancedMesh = new THREE.InstancedMesh(this.instancedMeshGeometry.clone(), this.material, maxCount);        

        // todo: implement me

        console.log(`grass instanced mesh count for node: ${instancedMesh.count}`);
        instancedMesh.visible = true;
        return instancedMesh;
    }        
}