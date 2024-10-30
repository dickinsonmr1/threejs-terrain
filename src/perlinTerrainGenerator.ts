import * as THREE from 'three';
import perlinNoise from 'perlin-noise';

export class PerlinTerrainGenerator {

    //mesh: THREE.Mesh;

    constructor() {
    }

    generateSimpleTerrain(size: number, heightScale: number): THREE.Mesh {
        const width = size; // width of the plane
        const height = size; // height of the plane
        const segmentSize = 1; // controls vertex density
        
        // Create a plane geometry with segments
        const geometry = new THREE.PlaneGeometry(width, height, width / segmentSize, height / segmentSize);
        
        // Generate Perlin noise for each vertex
        const noise = perlinNoise.generatePerlinNoise(width / segmentSize + 1, height / segmentSize + 1);
        
        // Apply Perlin noise to vertices
        geometry.attributes.position.array.forEach((_, i) => {
            if (i % 3 === 2) { // z component (height) is at every 3rd position in the array
                geometry.attributes.position.array[i] = noise[Math.floor(i / 3)] * heightScale;
            }
        });
        
        // Update geometry after modifications
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals(); // Recalculate normals for smooth shading
        
        // Create a mesh with a material
        const material = new THREE.MeshStandardMaterial({ color: 0x556b2f, wireframe: false });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
        
        // Add the mesh to the scene
        //scene.add(mesh);
        return mesh;
    }
    
    public generateHeightmap(resolution: number, heightScale: number): number[][] {
        const noise = perlinNoise.generatePerlinNoise(resolution, resolution);
        const heightmap: number[][] = [];
        for (let i = 0; i < resolution; i++) {
            heightmap[i] = [];
            for (let j = 0; j < resolution; j++) {
                heightmap[i][j] = noise[i * resolution + j] * heightScale;
            }
        }
        return heightmap;
    }

    // Create a lower-resolution heightmap using bilinear filtering
    public createFilteredHeightmapFromFullResolutionHeightMap(baseHeightmap: number[][], targetResolution: number): number[][] {
        const scale = baseHeightmap.length / targetResolution;
        const filteredHeightmap: number[][] = [];

        for (let i = 0; i < targetResolution; i++) {
            filteredHeightmap[i] = [];
            for (let j = 0; j < targetResolution; j++) {
                const x = i * scale;
                const y = j * scale;
                filteredHeightmap[i][j] = this.bilinearInterpolation(x, y, baseHeightmap);
            }
        }
        return filteredHeightmap;
    }

    // Bilinear interpolation function
    private bilinearInterpolation(x: number, y: number, heightmap: number[][]): number {
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;

        const q00 = heightmap[x0]?.[y0] ?? 0;
        const q01 = heightmap[x0]?.[y1] ?? 0;
        const q10 = heightmap[x1]?.[y0] ?? 0;
        const q11 = heightmap[x1]?.[y1] ?? 0;

        const tx = x - x0;
        const ty = y - y0;

        const a = q00 * (1 - tx) + q10 * tx;
        const b = q01 * (1 - tx) + q11 * tx;
        return a * (1 - ty) + b * ty;
    }

    public createMesh(heightmap: number[][], size: number, material: THREE.Material): THREE.Mesh {
        const mesh = new THREE.Mesh(this.createLODGeometry(heightmap, size), material);
        mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat

        return mesh;
    }

    private createLODGeometry(heightmap: number[][], size: number): THREE.PlaneGeometry {
        const geometry = new THREE.PlaneGeometry(size, size, heightmap.length - 1, heightmap.length - 1);
        const vertices = geometry.attributes.position.array;
    
        for (let i = 0, k = 0; i < heightmap.length; i++) {
            for (let j = 0; j < heightmap[i].length; j++, k += 3) {
                vertices[k + 2] = heightmap[i][j]; // Set z position as height
            }
        }
    
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        return geometry;
    }
    
}