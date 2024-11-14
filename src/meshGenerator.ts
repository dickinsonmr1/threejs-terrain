import { NoiseFunction2D } from 'simplex-noise';
import * as THREE from 'three'
import { TerrainGeneratorParams } from './chunk/terrainChunkManager';
export class MeshGenerator {
    constructor(){
        
    }

    public createPlaneMeshFromNoise(offsetX: number, offsetY: number,
        noise2D: NoiseFunction2D,
        size: number, material: THREE.Material, meshRotation: number, params: TerrainGeneratorParams,): THREE.Mesh {

        const planeGeometry = new THREE.PlaneGeometry(size, size, size-1, size -1 );

        for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
            const x = planeGeometry.attributes.position.getX(i);
            const y = planeGeometry.attributes.position.getY(i);
            
            //const z = noise2D(x + offsetX, y + offsetY);
            const z = this.getHeightFromNoiseFunction(x + offsetX, y + offsetY, params, noise2D);
            //console.log(`createPlaneMeshFromNoise: noise(${(x + offsetX).toFixed(2)}, ${(y + offsetY).toFixed(2)}) = ${z.toFixed(2)}`);
            
            planeGeometry.attributes.position.setZ(i, z);
        }
        planeGeometry.attributes.position.needsUpdate = true;
        planeGeometry.computeVertexNormals();        
        
        const planeMesh = new THREE.Mesh(planeGeometry, material);
        planeMesh.rotation.z = meshRotation;
        planeMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
        

        return planeMesh;
    }

    private getHeightFromNoiseFunction(x: number, y: number,
        params: TerrainGeneratorParams, noise2D: NoiseFunction2D): number {
  
        const xs = x / params.scale;
          const ys = y / params.scale;
          const G = 2.0 ** (-params.persistence);
  
          let amplitude = 1.0;
          let frequency = 1.0;
          let normalization = 0;
          let total = 0;
  
          for (let o = 0; o < params.octaves; o++) {
              const noiseValue = noise2D(xs * frequency, ys * frequency) * 0.5 + 0.5;
              total += noiseValue * amplitude;
              normalization += amplitude;
              amplitude *= G;
              frequency *= params.lacunarity;
          }
  
          total /= normalization;
          return Math.pow(total, params.exponentiation) * params.height;
      }
}