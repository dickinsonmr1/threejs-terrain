import * as THREE from 'three'
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
                console.log(`createLODGeometry:setting vertex height @ (${geometry.attributes.position.getX(index)}, ${geometry.attributes.position.getY(index)}): ${heightValue}`);
                geometry.attributes.position.setZ(index, heightValue);
            }
        }        
        geometry.computeVertexNormals();

        return geometry;
    }

    public createPlaneMesh(heightmap: number[][], size: number, material: THREE.Material, meshRotation: number, heightScale: number = 1): THREE.Mesh {

        const geometry = new THREE.PlaneGeometry(size, size, heightmap.length - 1, heightmap.length - 1);
        const planeMesh = new THREE.Mesh(geometry, material);
        
        const vertices = geometry.attributes.position.array;

        /*
        for (let v = 0; v < vertices.length; v += 3) {
            vertices[v + 2] = heightmap[i][j] * heightScale; // Set z position as height
        }
        */

        /*
        for(let v of planeMesh.geometry.attributes.vertices.array) {
            v
        }
        */
    
        let k = 0;
        for (let i = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].length; j++) {
                vertices[k + 2] = heightmap[i][j]; // Set z position as height
                console.log(`createPlaneMesh heightmap index (${i}, ${j})`);
                console.log(`createPlaneMesh: setting vertex height @ (${vertices[k].toFixed(2)}, ${vertices[k+1].toFixed(2)}): ${heightmap[i][j].toFixed(2)}`);

                k += 3;
            }
        }            
    
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();


        planeMesh.rotation.z = meshRotation;
        planeMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
        
        return planeMesh;
    }
}

