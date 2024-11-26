import * as THREE from 'three'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';
import { SimplexNoiseGenerator } from '../shared/simplexNoiseGenerator';
import { TerrainChunk, TerrainLOD } from './terrainChunk';

export class VegetationGenerator {

    private vegetationNoise2D: NoiseFunction2D;
    private geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 3, 1);
    private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    private counter: number = 0;
    private instancedMesh!: THREE.InstancedMesh;

    constructor(scene: THREE.Scene) {
        const prng = alea(500);
        this.vegetationNoise2D = createNoise2D(prng);
    }

    generateForChunk(terrainChunk: TerrainChunk, terrainNoiseGenerator: SimplexNoiseGenerator) {

        var instancedMesh2 = new THREE.InstancedMesh(this.geometry, this.material, 10);        
        //this.instancedMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
        let counter2 = 0;

        if(terrainChunk.getMeshByLOD(TerrainLOD.High) != null ) {
            for (let i = 0; i < terrainChunk.getMeshByLOD(TerrainLOD.High)!.geometry.attributes.position.count; i++) {

                const x = terrainChunk.offset.x + terrainChunk.getMeshByLOD(TerrainLOD.High)!.geometry.attributes.position.getX(i);
                const y = terrainChunk.offset.y + terrainChunk.getMeshByLOD(TerrainLOD.High)!.geometry.attributes.position.getY(i);
                
                var vegetationNoise = this.vegetationNoise2D(x, y);
                if(vegetationNoise > 0.2 && vegetationNoise < 0.205){
                    
                    let elevation = terrainNoiseGenerator.getHeightFromNoiseFunction(x, y);            
                    const matrix = new THREE.Matrix4().setPosition(x, elevation, -y);
                    instancedMesh2.setMatrixAt(counter2++, matrix);
                }            
            }
            
            terrainChunk.addInstancedVegetationMesh(instancedMesh2);        
        }        
    }

    generateForAllChunks(terrainChunks: TerrainChunk[], terrainNoiseGenerator: SimplexNoiseGenerator) { 
    }
}