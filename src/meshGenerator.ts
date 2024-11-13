import { NoiseFunction2D } from 'simplex-noise';
import * as THREE from 'three'
import { TerrainGeneratorParams } from './chunk/terrainChunkManager';
export class MeshGenerator {
    constructor(){
        
    }

    public createMesh(heightmap: number[][], size: number, material: THREE.Material, meshRotation: number, heightScale: number = 1): THREE.Mesh {
        const mesh = new THREE.Mesh(this.createLODGeometry(heightmap, size, heightScale), material);
        mesh.rotation.z = meshRotation;
        mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
        

        return mesh;
    }

    private createLODGeometry(heightmap: number[][], size: number, heightScale: number): THREE.PlaneGeometry {
        const geometry = new THREE.PlaneGeometry(size, size, heightmap.length - 1, heightmap.length - 1);

        /*
        const vertices = geometry.attributes.position.array;
    
        for (let i = 0, k = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].lengt//h; j++, k += 3) {
                vertices[k + 2] = heightmap[i][j] * heightScale; // Set z position as height
            }
        }
            
    
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        */

          // Set the z-values (height) for each vertex based on the heightmap chunk
          for (let i = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].length; j++) {
                const index = i * heightmap.length + j;
                const heightValue = heightmap[j][i] * heightScale;                
                console.log(`createLODGeometry: setting vertex height @ (${geometry.attributes.position.getX(index)}, ${geometry.attributes.position.getY(index)}): ${heightValue}`);
                geometry.attributes.position.setZ(index, heightValue);
            }
        }        
        geometry.computeVertexNormals();

        return geometry;
    }

    public createPlaneMesh(heightmap: number[][], size: number, material: THREE.Material, meshRotation: number, heightScale: number = 1): THREE.Mesh {

        const planeGeometry = new THREE.PlaneGeometry(size, size, heightmap.length - 1, heightmap.length - 1);
        const planeMesh = new THREE.Mesh(planeGeometry, material);
        
        const vertices = planeGeometry.attributes.position.array;
    
        /*
        let k = 0;
        for (let i = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].length; j++) {                
                vertices[k + 2] = heightmap[i][j]; // Set z position as height
                console.log(`createPlaneMesh heightmap index (${i}, ${j}) / setting vertex height @ (${vertices[k].toFixed(2)}, ${vertices[k+1].toFixed(2)}): ${heightmap[i][j].toFixed(2)}`);

                k += 3;                
            }
        }       
        */
            
        // Apply heightmap deformation
        for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
            const x = planeGeometry.attributes.position.getX(i);
            const y = planeGeometry.attributes.position.getY(i);
            console.log(`createPlaneMesh: (${x}, ${y})`);
            const z = 0; //heightmap[x][y];  // Example height fetch function
            planeGeometry.attributes.position.setZ(i, z);
        }
        planeGeometry.attributes.position.needsUpdate = true;

        planeMesh.rotation.z = meshRotation;
        planeMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
        
        planeGeometry.attributes.position.needsUpdate = true;
        planeGeometry.computeVertexNormals();        
        
        return planeMesh;
    }

    public createPlaneMeshFromNoise(offsetX: number, offsetY: number,
        noise2D: NoiseFunction2D,
        size: number, material: THREE.Material, meshRotation: number, params: TerrainGeneratorParams,): THREE.Mesh {

        const planeGeometry = new THREE.PlaneGeometry(size, size, size-1, size -1 );

        // Apply heightmap deformation
        for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
            const x = planeGeometry.attributes.position.getX(i);
            const y = planeGeometry.attributes.position.getY(i);
            
            const z = noise2D(x + offsetX, y + offsetY);// this.getHeightFromNoiseFunction(x + offsetX, y + offsetY, params, noise2D);
            console.log(`createPlaneMeshFromNoise: noise(${(x + offsetX).toFixed(2)}, ${(y + offsetY).toFixed(2)}) = ${z.toFixed(2)}`);
            
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
        params: TerrainGeneratorParams, noise2D: NoiseFunction2D) {
  
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

