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

        for (let i = 0; i < terrainChunk.mesh.geometry.attributes.position.count; i++) {

            const x = terrainChunk.offset.x + terrainChunk.mesh.geometry.attributes.position.getX(i);
            const y = terrainChunk.offset.y + terrainChunk.mesh.geometry.attributes.position.getY(i);
            
            var vegetationNoise = this.vegetationNoise2D(x, y);
            if(vegetationNoise > 0.2 && vegetationNoise < 0.205){
                
                const mesh = new THREE.Mesh(this.geometry, this.material);
                let elevation = terrainNoiseGenerator.getHeightFromNoiseFunction(x, y);            
                mesh.position.set(x, elevation, -y);
        
                terrainChunk.addVegetationMesh(mesh);

            }
            
        }
        
    }
}