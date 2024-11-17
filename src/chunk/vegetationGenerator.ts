import * as THREE from 'three'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';
import { SimplexNoiseGenerator } from './simplexNoiseGenerator';
import { TerrainChunk } from './terrainChunk';

export class VegetationGenerator {

    private vegetationNoise2D: NoiseFunction2D;
    private geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 3, 1);
    private material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});

    constructor() {
        const prng = alea(500);
        this.vegetationNoise2D = createNoise2D(prng);
    }

    generateForChunk(terrainChunk: TerrainChunk, terrainNoiseGenerator: SimplexNoiseGenerator) {

        let boundsStart2D = terrainChunk.offset;
        let boundsEnd2D = new THREE.Vector2(terrainChunk.offset.x + terrainChunk.verticesPerSide, terrainChunk.offset.y + terrainChunk.verticesPerSide);

        for(let i = boundsStart2D.x; i < boundsEnd2D.x; i++) {
            for(let j = boundsStart2D.y; i < boundsEnd2D.y; j++) {
                var vegetationNoise = this.vegetationNoise2D(i, j);
                if(vegetationNoise > 0.2 && vegetationNoise < 0.2005){

                    const mesh = new THREE.Mesh(this.geometry, this.material);
                    let elevation = terrainNoiseGenerator.getHeightFromNoiseFunction(i, j);            
                    mesh.position.set(i, elevation, j);
            
                    terrainChunk.addVegetationMesh(mesh);
                }                
            }
        }
    }
}