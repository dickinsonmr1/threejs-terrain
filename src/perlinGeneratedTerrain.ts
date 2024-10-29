import * as THREE from 'three';
import perlinNoise from 'perlin-noise';

export class PerlinGeneratedTerrain {

    mesh: THREE.Mesh;
    constructor(scene: THREE.Scene, size: number, heightScale: number) {
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
        
        this.mesh = mesh;
        
        // Add the mesh to the scene
        scene.add(mesh);
    }
}
