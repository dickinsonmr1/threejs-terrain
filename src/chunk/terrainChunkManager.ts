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

    async generate(gridDimension: number, verticesPerSide: number, heightScale: number) {

        for(let i = 0; i < gridDimension; i++) {
            for(let j = 0; j < gridDimension; j++) {

               let chunk = await this.generateChunk(i, j, verticesPerSide, heightScale);
               this.chunks.push(chunk);
               this.scene.add(chunk);
            }
        }
    }

    private async generateChunk(x: number, y: number, verticesPerSide: number, heightScale: number): Promise<THREE.Mesh> {

        let terrainFullSize = verticesPerSide;
        let terrainLodResolution = 64;

        const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        const material1 = new THREE.MeshStandardMaterial({ color: randomColor, wireframe: true });
        const baseHeightmap = await this.perlinTerrainGenerator.generateHeightmapWithSimplexNoise(terrainFullSize, heightScale); // full resolution
        const baseMesh = this.perlinTerrainGenerator.createMesh(baseHeightmap, terrainFullSize, material1);

        baseMesh.position.set(x * terrainFullSize, 0, y * terrainFullSize);

        return baseMesh;
    }

    update(camera: THREE.Camera ) {
        // todo: regenerate chunks based on camera location
    }
}