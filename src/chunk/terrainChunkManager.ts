import * as THREE from 'three'
import { PerlinTerrainGenerator } from "../perlinTerrainGenerator";

export class TerrainGeneratorParams
{
    constructor(scale: number, octaves: number, lacunarity: number,
        exponentiation: number, height: number, persistence: number) {
            this.scale = scale;
            this.octaves = octaves;
            this.lacunarity = lacunarity;
            this.exponentiation = exponentiation;
            this.height = height;
            this.persistence = persistence;
    }

    scale: number;
    octaves: number;
    lacunarity: number;
    exponentiation: number;
    height: number;
    persistence: number;
}

export class TerrainChunkManager {

    scene: THREE.Scene;
    isWireFrame: boolean;

    perlinTerrainGenerator: PerlinTerrainGenerator;

    chunks: THREE.Mesh[] = [];

    sectors: THREE.Vector2[] = [];

    constructor(scene: THREE.Scene, isWireFrame: boolean) {
        this.scene = scene;
        this.perlinTerrainGenerator = new PerlinTerrainGenerator();
        this.isWireFrame = isWireFrame;
    }

    async generate(gridDimension: number, verticesPerSide: number, heightScale: number, params: TerrainGeneratorParams) {

        for(let i = 0; i < gridDimension; i++) {
            for(let j = 0; j < gridDimension; j++) {

               let chunk = await this.generateChunk(i, j, verticesPerSide, heightScale, params);
               this.chunks.push(chunk);
               this.scene.add(chunk);
            }
        }
    }
    async regenerate(gridDimension: number, verticesPerSide: number, heightScale: number, params: TerrainGeneratorParams) {

        this.chunks.forEach(mesh => {
            // Remove the mesh from the scene (if needed)
            this.scene.remove(mesh);
            
            // Dispose of the geometry and material associated with the mesh
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                // If the material is an array (e.g., for MultiMaterial), dispose each one
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(material => material.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });
        
        // Clear the array after disposing
        this.chunks.length = 0;
        
        this.generate(gridDimension, verticesPerSide, heightScale, params);
    }

    private async generateChunk(x: number, y: number, verticesPerSide: number, heightScale: number, params: TerrainGeneratorParams): Promise<THREE.Mesh> {

        let terrainFullSize = verticesPerSide;
        let terrainLodResolution = 64;

        const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        const material1 = new THREE.MeshStandardMaterial({ color: randomColor, wireframe: this.isWireFrame});
        const baseHeightmap = await this.perlinTerrainGenerator.generateHeightmapWithSimplexNoise(terrainFullSize, heightScale, params); // full resolution
        const baseMesh = this.perlinTerrainGenerator.createMesh(baseHeightmap, terrainFullSize, material1);

        baseMesh.receiveShadow = true;
        baseMesh.position.set(x * terrainFullSize, 0, y * terrainFullSize);

        return baseMesh;
    }

    update(camera: THREE.Camera ) {
        // todo: regenerate chunks based on camera location
    }
}