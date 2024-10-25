import * as THREE from "three";
//import * as CANNON from 'cannon-es'

export class QuadtreeNode {
    children: QuadtreeNode[] | null = null;
    
    mesh: THREE.Mesh | null = null;
    cylinderMesh: THREE.Mesh | null = null;
    basicSemitransparentMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial( { color: 0xFFFF00, transparent: true, opacity: 0.5 });

    heightmapChunk: number[][]; // The heightmap data for this chunk

    totalTerrainSize: number;

    x: number;
    y: number;
    size: number;

    level: number;
    heightScale: number;

    //body?: CANNON.Body;

    constructor(heightmapChunk: number[][], x: number, y: number, size: number, level: number, heightScale: number, totalTerrainSize: number) {
        this.heightmapChunk = heightmapChunk;
        
        this.x = x;
        this.y = y;
        this.size = size;

        this.level = level;
        this.heightScale = heightScale;

        this.totalTerrainSize = totalTerrainSize;
    }

    // Check if node is subdivided
    isSubdivided() {
        return this.children !== null;
    }

    // Subdivide the node into 4 children
    subdivide() {
        const halfSize = this.size / 2;

        const topLeftChunk = this.getSubChunk(0, 0, halfSize);
        const topRightChunk = this.getSubChunk(halfSize, 0, halfSize);
        const bottomLeftChunk = this.getSubChunk(0, halfSize, halfSize);
        const bottomRightChunk = this.getSubChunk(halfSize, halfSize, halfSize);
        
        this.children = [
            new QuadtreeNode(topLeftChunk, this.x, this.y, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize),
            new QuadtreeNode(topRightChunk, this.x + halfSize, this.y, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize),
            new QuadtreeNode(bottomLeftChunk, this.x, this.y + halfSize, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize),
            new QuadtreeNode(bottomRightChunk, this.x + halfSize, this.y + halfSize, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize),
        ];

        // Remove current mesh if it's being subdivided
        if (this.mesh) {
            //scene.remove(this.mesh);
            //this.mesh = null;
            this.mesh.visible = false;
            this.cylinderMesh!.visible = false;
        }
    }

    // Create mesh for this tile (if not subdivided)
    createMesh(scene: THREE.Scene, material: THREE.Material) { //}, dataArray2D: number[][]) {
        if (!this.mesh) {

            const geometry = new THREE.PlaneGeometry(this.size, this.size, this.size - 1, this.size - 1);

            // Set the z-values (height) for each vertex based on the heightmap chunk
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    const index = i * this.size + j;
                    const heightValue = this.heightmapChunk[i][j] * this.heightScale;
                    geometry.attributes.position.setZ(index, heightValue);
                }
            }

            geometry.computeVertexNormals(); // Recompute normals for smooth shading

            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat

            this.x -= this.size / 2;
            this.y -= this.size / 2;

            mesh.position.set(this.x, 0, this.y); // Center it
            
            let offset = new THREE.Vector3(0,0,0);//this.size, 0, this.size);

            //mesh.position.set(this.x + this.size / 2, 0, this.y + this.size / 2); // Center it

            //mesh.position.x -= this.totalTerrainSize / 2 - this.size / 2;
            //mesh.position.z -= this.totalTerrainSize / 2 - this.size / 2;

            //mesh.position.x -= this.totalTerrainSize / 2;
            //mesh.position.z -= this.totalTerrainSize / 2;

            /*
            mesh.position.set(
                -(this.x * this.size) / 2 + offset.x,
                0 + offset.y,
                -(this.y * this.size) / 2 + offset.z
            ); // Center it
            */
            //mesh.position.y = 20;

            this.mesh = mesh;
            scene.add(mesh);
            
            this.cylinderMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(6 - this.level, 6 - this.level, 500, 16, 1, true),
                material);
            this.cylinderMesh.position.set(this.x, 0, this.y);            
            scene.add(this.cylinderMesh);
            
        }
        else {
            this.mesh.visible = true;
            this.cylinderMesh!.visible = true;
        }
    }


  // Extract a sub-chunk of the heightmap from the current node
  getSubChunk(offsetX: number, offsetY: number, subSize: number): number[][] {
    const subChunk: number[][] = [];

    for (let i = 0; i < subSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < subSize; j++) {
        row.push(this.heightmapChunk[offsetY + i][offsetX + j]);
      }
      subChunk.push(row);
    }

    return subChunk;
  }
}