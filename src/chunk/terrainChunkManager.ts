import * as THREE from 'three'
import { TerrainChunk } from './terrainChunk';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { MeshGenerator } from '../meshGenerator';

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

    chunks: TerrainChunk[] = [];

    sectors: THREE.Vector2[] = [];

    meshGenerator: MeshGenerator;

    constructor(scene: THREE.Scene, isWireFrame: boolean) {
        this.scene = scene;
        this.isWireFrame = isWireFrame;

        this.meshGenerator = new MeshGenerator();
    }

    async generate(gridDimension: number, verticesPerSide: number, heightScale: number, params: TerrainGeneratorParams) {

        //const noise2D = createNoise2D();
        const noise = createNoise2D();

        for(let i = 0; i < gridDimension; i++) {
            for(let j = 0; j < gridDimension; j++) {

               let mesh = await this.generateChunk(i, j, verticesPerSide, heightScale, params, noise);

               let chunk = new TerrainChunk(mesh);
               this.chunks.push(chunk);

               this.scene.add(chunk.mesh);
            }
        }
    }
    async regenerate(gridDimension: number, verticesPerSide: number, heightScale: number, params: TerrainGeneratorParams) {

        this.chunks.forEach(chunk => {
            // Remove the mesh from the scene (if needed)
            this.scene.remove(chunk.mesh);
            
            // Dispose of the geometry and material associated with the mesh
            if (chunk.mesh.geometry) chunk.mesh.geometry.dispose();
            if (chunk.mesh.material) {
                // If the material is an array (e.g., for MultiMaterial), dispose each one
                if (Array.isArray(chunk.mesh.material)) {
                    chunk.mesh.material.forEach(material => material.dispose());
                } else {
                    chunk.mesh.material.dispose();
                }
            }
        });
        
        // Clear the array after disposing
        this.chunks.length = 0;
        
        this.generate(gridDimension, verticesPerSide, heightScale, params);
    }

    private async generateChunk(x: number, y: number, verticesPerSide: number, heightScale: number,
      params: TerrainGeneratorParams, noise2D: NoiseFunction2D): Promise<THREE.Mesh> {

        let terrainFullSize = verticesPerSide;
        let terrainLodResolution = 64;
        
        const baseHeightmap = await this.generateHeightmap(terrainFullSize, heightScale, params, noise2D); // full resolution
        
        const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        const material1 = new THREE.MeshStandardMaterial({ color: randomColor, wireframe: this.isWireFrame});        
        const baseMesh = this.meshGenerator.createMesh(baseHeightmap, terrainFullSize, material1);

        baseMesh.receiveShadow = true;
        baseMesh.position.set(x * terrainFullSize, 0, y * terrainFullSize);

        return baseMesh;
    }

    private async generateHeightmap(resolution: number, heightScale: number,
      params: TerrainGeneratorParams, noise2D: NoiseFunction2D): Promise<number[][]> {
        
        const heightmap: number[][] = [];
        for (let i = 0; i < resolution; i++) {
            heightmap[i] = [];
            for (let j = 0; j < resolution; j++) {
                // TODO: ensure offset is correct for noise function
                heightmap[i][j] = this.getHeight(i * resolution, j * resolution, params, noise2D);
            }
        }
        return heightmap;
    }

    private getHeight(x: number, y: number,
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

    update(camera: THREE.Camera ) {
        // todo: regenerate chunks based on camera location
    }
    /*
    stitchChunks(chunk: TerrainChunk) {
        // Check each edge to see if stitching is needed with a lower-LOD neighbor
        const edges = ['top', 'bottom', 'left', 'right'] as const;
        edges.forEach((edge) => {
          const neighbor = chunk.neighbors[edge];
          if (neighbor && neighbor.LOD < chunk.LOD) {
            this.alignEdgeVertices(chunk, neighbor, edge);
          }
        });
    }

    getEdgeIndices(chunk: TerrainChunk, edge: string): number[] {
        const size = Math.sqrt(chunk.mesh.geometry.attributes.position.count);
        const indices = [];
      
        switch (edge) {
          case 'top':
            for (let i = 0; i < size; i++) indices.push(i); // Top row indices
            break;
          case 'bottom':
            for (let i = 0; i < size; i++) indices.push((size - 1) * size + i); // Bottom row indices
            break;
          case 'left':
            for (let i = 0; i < size; i++) indices.push(i * size); // Left column indices
            break;
          case 'right':
            for (let i = 0; i < size; i++) indices.push(i * size + (size - 1)); // Right column indices
            break;
        }
        return indices;
      }

      alignEdgeVertices(chunk: TerrainChunk, neighbor: TerrainChunk, edge: string) {
        const chunkPositions = chunk.mesh.geometry.attributes.position.array as Float32Array;
        const neighborPositions = neighbor.mesh.geometry.attributes.position.array as Float32Array;
      
        // Get edge indices for both chunks
        const chunkEdgeIndices = this.getEdgeIndices(chunk, edge);
        const neighborEdgeIndices = this.getEdgeIndices(neighbor, this.oppositeEdge(edge));
      
        // Align chunk edge vertices to match the neighbor's vertices
        chunkEdgeIndices.forEach((chunkIdx, i) => {
          const neighborIdx = Math.floor(i / (chunkEdgeIndices.length / neighborEdgeIndices.length));
          chunkPositions[chunkIdx * 3] = neighborPositions[neighborIdx * 3];        // x
          chunkPositions[chunkIdx * 3 + 1] = neighborPositions[neighborIdx * 3 + 1]; // y
          chunkPositions[chunkIdx * 3 + 2] = neighborPositions[neighborIdx * 3 + 2]; // z
        });
      
        chunk.mesh.geometry.attributes.position.needsUpdate = true;
      }

    oppositeEdge(edge: 'top' | 'bottom' | 'left' | 'right'): 'top' | 'bottom' | 'left' | 'right' {
        return { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[edge];
    }
    */
}