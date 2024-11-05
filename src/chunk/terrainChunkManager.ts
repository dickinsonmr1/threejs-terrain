import * as THREE from 'three'
import { PerlinTerrainGenerator } from "../perlinTerrainGenerator";

export class TerrainChunkManager {

    scene: THREE.Scene;

    perlinTerrainGenerator: PerlinTerrainGenerator;

    chunks: THREE.Mesh[] = [];

    sectors: THREE.Vector2[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.perlinTerrainGenerator = new PerlinTerrainGenerator();
    }

    async generate(gridDimension: number, verticesPerSide: number) {

        for(let i = 0; i < gridDimension; i++) {
            for(let j = 0; j < gridDimension; j++) {

               let chunk = await this.generateChunk(i, j, verticesPerSide);
               this.chunks.push(chunk);
               this.scene.add(chunk);
            }
        }
    }

    async generateChunk(x: number, y: number, verticesPerSide: number): Promise<THREE.Mesh> {

        let terrainFullSize = verticesPerSide;
        let terrainLodResolution = 64;
        let heightScale2 = 10;

        const material1 = new THREE.MeshStandardMaterial({ color: 'green', wireframe: true });
        const baseHeightmap = await this.perlinTerrainGenerator.generateHeightmap(terrainFullSize, heightScale2); // full resolution
        const baseMesh = this.perlinTerrainGenerator.createMesh(baseHeightmap, terrainFullSize, material1);

        baseMesh.position.set(x * terrainFullSize, 0, y * terrainFullSize);

        return baseMesh;
    }

    update(camera: THREE.Camera ) {
        // todo: regenerate chunks based on camera location
    }
}