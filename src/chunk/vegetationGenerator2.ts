import * as THREE from 'three'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';
import { SimplexNoiseGenerator } from './simplexNoiseGenerator';
import { TerrainChunk } from './terrainChunk';

export class VegetationGenerator2 {

    private vegetationNoise2D: NoiseFunction2D;
    private geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 3, 1);
    private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    private counter: number = 0;
    private instancedMesh!: THREE.InstancedMesh;

    constructor(scene: THREE.Scene) {
        const prng = alea(500);
        this.vegetationNoise2D = createNoise2D(prng);
        this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, 100000);        
        scene.add(this.instancedMesh);
    }

    generateForChunk(terrainChunk: TerrainChunk, terrainNoiseGenerator: SimplexNoiseGenerator) {

        // TODO: implement me globally
               
        for (let i = 0; i < terrainChunk.highDetailMesh.geometry.attributes.position.count; i++) {

            const x = terrainChunk.offset.x + terrainChunk.highDetailMesh.geometry.attributes.position.getX(i);
            const y = terrainChunk.offset.y + terrainChunk.highDetailMesh.geometry.attributes.position.getY(i);
            
            var vegetationNoise = this.vegetationNoise2D(x, y);
            if(vegetationNoise > 0.2 && vegetationNoise < 0.205){
                
                let elevation = terrainNoiseGenerator.getHeightFromNoiseFunction(x, y);            
                const matrix = new THREE.Matrix4().setPosition(x, elevation, -y);
                this.instancedMesh.setMatrixAt(this.counter++, matrix);
            }            
        }
        
        //instancedMesh2.instanceMatrix.needsUpdate = true;
        terrainChunk.addInstancedVegetationMesh(this.instancedMesh);        
    }

    generateForAllChunks(terrainChunks: TerrainChunk[], terrainNoiseGenerator: SimplexNoiseGenerator) { 
    }
}