import * as THREE from "three";
import { PerlinTerrainGenerator } from "./perlinTerrainGenerator";
//import * as CANNON from 'cannon-es'

export class QuadtreeNode {
    children: QuadtreeNode[] | null = null;
    
    mesh: THREE.Mesh | null = null;
    cylinderMesh: THREE.Mesh | null = null;
    basicSemitransparentMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial( { color: 0xFFFF00, transparent: true, opacity: 0.5 });

    heightmapChunk: number[][]; // The original heightmap data for this chunk
    lodHeightmapChunk: number[][]; // The heightmap data for this chunk

    totalTerrainSize: number;

    x: number;
    y: number;
    size: number;

    level: number;
    heightScale: number;

    //body?: CANNON.Body;
    vertexCountPerSide: number;

    constructor(heightmapChunk: number[][], x: number, y: number, size: number, level: number, heightScale: number, totalTerrainSize: number, vertexCountPerSide: number) {

        this.vertexCountPerSide = vertexCountPerSide;

        let perlinTerrainGenerator = new PerlinTerrainGenerator();
        this.heightmapChunk = heightmapChunk;

        this.lodHeightmapChunk = perlinTerrainGenerator.createFilteredHeightmapFromFullResolutionHeightMap(heightmapChunk, vertexCountPerSide);
        
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
            new QuadtreeNode(topLeftChunk, this.x, this.y, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize, this.vertexCountPerSide * 2),
            new QuadtreeNode(topRightChunk, this.x + halfSize, this.y, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize, this.vertexCountPerSide * 2),
            new QuadtreeNode(bottomLeftChunk, this.x, this.y + halfSize, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize, this.vertexCountPerSide * 2),
            new QuadtreeNode(bottomRightChunk, this.x + halfSize, this.y + halfSize, halfSize, this.level + 1, this.heightScale, this.totalTerrainSize, this.vertexCountPerSide * 2),
        ];

        // Remove current mesh if it's being subdivided
        if (this.mesh) {
            //scene.remove(this.mesh);
            //this.mesh = null;
            this.mesh.visible = false;
        }
    }

    merge() {
        if (this.children) {
            this.children.forEach(child => {
                if (child.mesh) {
                    //this.scene.remove(child.mesh);
                    //child.mesh = null;
                    child.mesh.visible = false;
                }
                child.merge();
            });
            this.children = null;
        }
    }

    // TODO: attempt to move from QuadtreeTerrainSystem to here
    // - need to figure out how to handle maxlevel and materials
    /*
    updateNode(scene: THREE.Scene, camera: THREE.Camera, material: THREE.Material) {
        const distance = this.getCameraDistanceToNode(camera);

        // Subdivide or merge based on distance
        if (distance < this.size && this.level < this.maxLevel) {
            if (!this.isSubdivided()) {
                this.subdivide();
            }

            // Update child nodes recursively
            if (this.children) {
                this.children.forEach(child => child.updateNode(scene, camera, material));
            }
        } else if (this.isSubdivided()) {
            this.merge();
        } else {
            // Create mesh if not subdivided
            this.createMesh(scene, material);
        }
    }
    */

    /*
    private getCameraDistanceToNode(camera: THREE.Camera): number {
        const nodeCenter = new THREE.Vector3(this.x + this.size / 2, 0, this.y + this.size / 2);
        let temp = new THREE.Vector3(camera.position.x, 0, camera.position.z);
        return temp.distanceTo(nodeCenter);
    }
    */

    // Create mesh for this tile (if not subdivided)
    createMesh(scene: THREE.Scene, material: THREE.Material) { //}, dataArray2D: number[][]) {
        if (!this.mesh) {

            let perlinTerrainGenerator = new PerlinTerrainGenerator();
            let mesh = perlinTerrainGenerator.createMesh(this.lodHeightmapChunk, this.size, material, this.heightScale);
          
            mesh.position.set(this.x + this.size / 2, 0, this.y + this.size / 2); // Center it            
 
            this.mesh = mesh;
            scene.add(mesh);            
        }
        else {
            this.mesh.visible = true;
        }
    }

    getTotalNodes(): number {
        
        if(this.children == null || this.children?.length == 0)
            return 1;

        let count = 0;
        for(const child of this.children)
        {
            count += child.getTotalNodes()
        }
        return count;
    }

    // Extract a sub-chunk of the heightmap from the current node
    private getSubChunk(offsetX: number, offsetY: number, subSize: number): number[][] {
        
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