import * as THREE from 'three'
import { TerrainGeneratorParams } from './chunk/terrainChunkManager';
import { SimplexNoiseGenerator } from './chunk/simplexNoiseGenerator';

export class MeshGenerator {
    constructor(){
        
    }

    public createPlaneMeshFromNoise(offsetX: number, offsetY: number,
        simplexNoiseGenerator: SimplexNoiseGenerator,
        planeSize: number, verticesPerSide: number, material: THREE.Material, meshRotation: number, params: TerrainGeneratorParams): THREE.Mesh {

        const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, verticesPerSide, verticesPerSide );

        for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
            const x = planeGeometry.attributes.position.getX(i);
            const y = planeGeometry.attributes.position.getY(i);
            
            const z = simplexNoiseGenerator.getHeightFromNoiseFunction(x + offsetX, y + offsetY);
            
            planeGeometry.attributes.position.setZ(i, z);
        }
        planeGeometry.attributes.position.needsUpdate = true;
        planeGeometry.computeVertexNormals();        
        
        const planeMesh = new THREE.Mesh(planeGeometry, material);
        planeMesh.rotation.z = meshRotation;
        planeMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
        

        return planeMesh;
    }
}