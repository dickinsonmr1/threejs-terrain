import * as THREE from 'three'

export class MeshGenerator {
    constructor(){
        
    }

    public createMesh(heightmap: number[][], size: number, material: THREE.Material, heightScale: number = 1): THREE.Mesh {
        const mesh = new THREE.Mesh(this.createLODGeometry(heightmap, size, heightScale), material);
        mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat

        return mesh;
    }

    private createLODGeometry(heightmap: number[][], size: number, heightScale: number): THREE.PlaneGeometry {
        const geometry = new THREE.PlaneGeometry(size, size, heightmap.length - 1, heightmap.length - 1);

        /*
        const vertices = geometry.attributes.position.array;
    
        for (let i = 0, k = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].length; j++, k += 3) {
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
                const heightValue = heightmap[i][j] * heightScale;
                geometry.attributes.position.setZ(index, heightValue);
            }
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
}

