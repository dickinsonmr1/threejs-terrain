import * as THREE from 'three'
import { TerrainChunk, TerrainLOD } from './terrainChunk';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { MeshGenerator } from '../meshGenerator';
import { TerrainGeneratorParams } from './terrainGeneratorParams';
import { TerrainGridParams } from './terrainGridParams';
import { SimplexNoiseGenerator } from './simplexNoiseGenerator';
import { VegetationGenerator } from './vegetationGenerator';

export class TerrainChunkManager {

    scene: THREE.Scene;
    isWireFrame: boolean;

    chunks: TerrainChunk[] = [];
    colors: THREE.Color[] = [];
    sectors: THREE.Vector2[] = [];

    meshGenerator: MeshGenerator;

    simplexNoiseGenerator: SimplexNoiseGenerator;
    vegetationNoiseGenerator: VegetationGenerator;

    constructor(scene: THREE.Scene, terrainGridParams: TerrainGridParams, terrainNoiseGenerator: SimplexNoiseGenerator,
      vegetationNoiseGenerator: VegetationGenerator, isWireFrame: boolean) {
        this.scene = scene;
        this.isWireFrame = isWireFrame;

        this.meshGenerator = new MeshGenerator();

        this.simplexNoiseGenerator = terrainNoiseGenerator;
        this.vegetationNoiseGenerator = vegetationNoiseGenerator;

        // add empty chunks for entire grid
        for(var i = -100; i < 100; i++) {
          for(var j = -100; j < 100; j++) {

            let offsetX = i * terrainGridParams.verticesPerSide;
            let offsetZ = j * terrainGridParams.verticesPerSide;      

            this.chunks.push(new TerrainChunk(new THREE.Vector2(offsetX, offsetZ), terrainGridParams.verticesPerSide));
          }  
        }
    }

    public async generate(terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams) {

        // todo: generate all chunks, but only generate meshes for nodes that are close to camera   
        console.log(`**GENERATE: ${terrainGridParams.chunksPerSideOfGrid} x ${terrainGridParams.chunksPerSideOfGrid} grid, ${terrainGridParams.verticesPerSide} vertices per side of chunk`);

        let rows = terrainGridParams.chunksPerSideOfGrid;
        let columns = terrainGridParams.chunksPerSideOfGrid;
       
        for(let i = -columns / 2; i < columns / 2; i++) {
          for(let j = -rows / 2; j < rows / 2; j++) {
                            
            let offsetX = i * terrainGridParams.verticesPerSide;
            let offsetZ = j * terrainGridParams.verticesPerSide;   
            
            await this.generateChunk(terrainGridParams, params, i, j, offsetX, offsetZ);
          }
        }
    }

    private async generateChunk(terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams, gridX: number, gridZ: number, offsetX: number, offsetZ: number) {
      const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
      if(this.colors.length <= this.chunks.length) {
        this.colors.push(randomColor);
      }
        //console.log(`-------- Chunk Offset (${offsetX}, ${offsetZ}) @ grid(${i}, ${j})`);
        await this.generateMeshesForChunk(gridX, gridZ, offsetX, offsetZ,
          terrainGridParams.verticesPerSide, terrainGridParams.heightScale,
          terrainGridParams, params, randomColor).then((group) => {

            let existingChunk = this.chunks.find(x => x.offset.x == offsetX && x.offset.y == offsetZ);

            if(existingChunk) {
                existingChunk.setMesh(group.children[0]! as THREE.Mesh, TerrainLOD.High);
                this.scene.add(existingChunk.mesh);

                // vegetation generator 1
                this.vegetationNoiseGenerator.generateForChunk(existingChunk, this.simplexNoiseGenerator);
                //existingChunk.vegetationMeshes.forEach(x => this.scene.add(x));
                this.scene.add(existingChunk.instancedVegetationMesh);
            }
            else {
                let chunk = new TerrainChunk(new THREE.Vector2(offsetX, offsetZ), terrainGridParams.verticesPerSide);                
                chunk.setMesh(group.children[0]! as THREE.Mesh, TerrainLOD.High);
                this.chunks.push(chunk);
                this.scene.add(chunk.mesh);

                // vegetation generator 1
                this.vegetationNoiseGenerator.generateForChunk(chunk, this.simplexNoiseGenerator);
                //chunk.vegetationMeshes.forEach(x => this.scene.add(x));
                this.scene.add(chunk.instancedVegetationMesh);

            }
        });    
    }

    /*
    private isChunkAtPosition(position: THREE.Vector3, chunkSize: number): boolean {

      this.chunks.forEach(chunk => {
         if(position.distanceTo(new THREE.Vector3(chunk.offset.x + chunkSize / 2, 0, chunk.offset.y + chunkSize / 2)) < chunkSize)
            return true;
      })
      return false;      
    }
    */
    
    public async regenerate(terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams) {

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
          
        this.generate(terrainGridParams, params);
    }

    private async generateMeshesForChunk(gridX: number, gridZ: number,
      offsetX: number,
      offsetZ: number,
      verticesPerSide: number, heightScale: number,
      terrainGridParams: TerrainGridParams,
      params: TerrainGeneratorParams, randomColor: THREE.Color): Promise<THREE.Group> {

        const material1 = new THREE.MeshStandardMaterial({ color: randomColor, wireframe: this.isWireFrame});        
        //console.log(heightScale);

        const planeMesh = this.meshGenerator.createPlaneMeshFromNoise(offsetX, offsetZ, this.simplexNoiseGenerator, verticesPerSide, verticesPerSide, material1, terrainGridParams.meshRotation, params);
        planeMesh.receiveShadow = true;
        planeMesh.position.setX(gridX * verticesPerSide);
        planeMesh.position.setZ(-gridZ * verticesPerSide);

        // TODO: generate and add meshes for multiple LOD

        let group = new THREE.Group();
        group.add(planeMesh);
        return group;
    }

    public getPositionOnTerrain(position: THREE.Vector3) {
      //return this.simplexNoiseGenerator.getHeightFromNoiseFunction
    }

    /*
    private async generateHeightmap(
      offsetX: number,
      offsetZ: number,
      verticesPerSide: number,
      heightScale: number,
      params: TerrainGeneratorParams,
      noise2D: NoiseFunction2D): Promise<number[][]> {
                
        const heightmap: number[][] = [];
        for (let i = 0; i < verticesPerSide; i++) {

            heightmap[i] = [];
            for (let j = 0; j < verticesPerSide; j++) {
                // TODO: ensure offset is correct for noise function

                let z = verticesPerSide * i + offsetX;
                let x = verticesPerSide * j + offsetZ;                
                heightmap[i][j] =  this.getHeightFromNoiseFunction(x, z, params, noise2D);
                //heightmap[i][j] = noise2D(x, z);
                //console.log(`using noise @ (${x}, ${z}): ${heightmap[i][j].toFixed(2)}`);
            }
        }
        return heightmap;
    }
    

    private getHeightFromNoiseFunction(x: number, y: number,
      params: TerrainGeneratorParams, noise2D: NoiseFunction2D): number {

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
    */

    public update(camera: THREE.Camera, terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams) {
        const column = Math.floor((camera.position.x + terrainGridParams.verticesPerSide * 0.5) / terrainGridParams.verticesPerSide);
        const row = -Math.floor((camera.position.z + terrainGridParams.verticesPerSide * 0.5) / terrainGridParams.verticesPerSide);

        // one chunk at a time
        const offsetX = column * terrainGridParams.verticesPerSide;
        const offsetZ = row * terrainGridParams.verticesPerSide;

        let closestChunk = this.chunks.find(x => x.offset.x == offsetX && x.offset.y == offsetZ);
        if(!closestChunk?.mesh) {
          this.generateChunk(terrainGridParams, params, column, row, offsetX, offsetZ);

        }

        // TODO: only make vegetation visible on close chunks
        
        // TODO: closest and surrounding chunks
        /*
        for(let i = column-4; i < column+4; i++) {
          for(let j = row-4; j < row+4; j++) {

            const offsetX = i * terrainGridParams.verticesPerSide;
            const offsetZ = j * terrainGridParams.verticesPerSide;
    
            let closestChunk = this.chunks.find(x => x.offset.x == offsetX && x.offset.y == offsetZ);
            if(!closestChunk?.mesh)
              this.generateChunk(terrainGridParams, params, column, row, offsetX, offsetZ);
          }  
        }
        */

        //if(!this.isChunkAtPosition(camera.position, terrainGridParams.verticesPerSide)) {
        //
        //}
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

export { TerrainGridParams, TerrainGeneratorParams };
