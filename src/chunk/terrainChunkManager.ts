import * as THREE from 'three'
import { TerrainChunk, TerrainLOD } from './terrainChunk';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { MeshGenerator } from '../meshGenerator';
import { TerrainGeneratorParams } from './terrainGeneratorParams';
import { TerrainGridParams } from './terrainGridParams';
import { SimplexNoiseGenerator } from './simplexNoiseGenerator';
import { VegetationGenerator } from './vegetationGenerator';
import { TerrainLodSettings } from './terrainLodSettings';

export class TerrainChunkManager {

    scene: THREE.Scene;
    isWireFrame: boolean;

    chunks: TerrainChunk[] = [];
    colors: THREE.Color[] = [];
    sectors: THREE.Vector2[] = [];

    meshGenerator: MeshGenerator;

    simplexNoiseGenerator: SimplexNoiseGenerator;
    vegetationNoiseGenerator: VegetationGenerator;
    
    terrainLodSettings: TerrainLodSettings;

    shaderMaterial: THREE.Material;

    constructor(scene: THREE.Scene, terrainGridParams: TerrainGridParams, terrainNoiseGenerator: SimplexNoiseGenerator,
      vegetationNoiseGenerator: VegetationGenerator, terrainLodSettings: TerrainLodSettings, isWireFrame: boolean) {
        this.scene = scene;
        this.isWireFrame = isWireFrame;

        this.meshGenerator = new MeshGenerator();

        this.simplexNoiseGenerator = terrainNoiseGenerator;
        this.vegetationNoiseGenerator = vegetationNoiseGenerator;

        this.terrainLodSettings = terrainLodSettings;

        let gridSize = 50;
        // add empty chunks for entire grid
        for(var i = -gridSize/2; i < gridSize/2; i++) {
          for(var j = -gridSize/2; j < gridSize/2; j++) {

            let offsetX = i * terrainGridParams.verticesPerSide;
            let offsetZ = j * terrainGridParams.verticesPerSide;      

            this.chunks.push(new TerrainChunk(i, j, new THREE.Vector2(offsetX, offsetZ), terrainGridParams.verticesPerSide));
          }  
        }

        this.shaderMaterial = this.generateMaterial(1, 100, false);
    }

    public async generateInitialChunks(terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams) {

        // todo: generate all chunks, but only generate meshes for nodes that are close to camera   
        console.log(`**GENERATE: ${terrainGridParams.chunksPerSideOfGrid} x ${terrainGridParams.chunksPerSideOfGrid} grid, ${terrainGridParams.verticesPerSide} vertices per side of chunk`);

        let rows = terrainGridParams.chunksPerSideOfGrid;
        let columns = terrainGridParams.chunksPerSideOfGrid;
       
        for(let i = -columns / 2; i < columns / 2; i++) {
          for(let j = -rows / 2; j < rows / 2; j++) {
                            
            let offsetX = i * terrainGridParams.verticesPerSide;
            let offsetZ = j * terrainGridParams.verticesPerSide;   
            
            await this.generateChunk(terrainGridParams, params, i, j, offsetX, offsetZ, TerrainLOD.Low);
          }
        }
    }

    private async generateChunk(terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams, gridX: number, gridZ: number, offsetX: number, offsetZ: number, terrainLOD: TerrainLOD) {
      const randomColor = new THREE.Color('green')//Math.random(), Math.random(), Math.random());
      if(this.colors.length <= this.chunks.length) {
        this.colors.push(randomColor);
      }
        //console.log(`-------- Chunk Offset (${offsetX}, ${offsetZ}) @ grid(${i}, ${j})`);
        await this.generateMeshesForChunk(gridX, gridZ, offsetX, offsetZ,
          terrainGridParams.verticesPerSide, terrainGridParams.heightScale,
          terrainGridParams, params, randomColor, terrainLOD).then((group) => {

            let existingChunk = this.chunks.find(x => x.offset.x == offsetX && x.offset.y == offsetZ);

            if(existingChunk) {
                existingChunk.setMeshes(group);      
                
                //this.scene.add(existingChunk.getMeshByLOD(TerrainLOD.High)!);
                this.scene.add(existingChunk.group);

                group.disposeGroupAndRemoveFromScene(this.scene);
                
                // vegetation generator 1
                
                this.vegetationNoiseGenerator.generateForChunk(existingChunk, this.simplexNoiseGenerator);
                if(existingChunk.instancedVegetationMesh != null)
                  this.scene.add(existingChunk.instancedVegetationMesh);
            }
            else {
                // logic only hit if outside of initialized grid

                let chunk = new TerrainChunk(gridX, gridZ, new THREE.Vector2(offsetX, offsetZ), terrainGridParams.verticesPerSide);                
                chunk.setMeshes(group);
                this.scene.add(chunk.group);

                this.chunks.push(chunk);
                

                group.disposeGroupAndRemoveFromScene(this.scene);
                //this.scene.add(chunk.getMeshByLOD(TerrainLOD.High)!);
                //this.scene.add(group);

                // vegetation generator 1
                //this.vegetationNoiseGenerator.generateForChunk(chunk, this.simplexNoiseGenerator);
                ////chunk.vegetationMeshes.forEach(x => this.scene.add(x));
                //this.scene.add(chunk.instancedVegetationMesh);

            }
        });    
    }

    public getVisibleChunkCount(): number {
      return this.chunks.filter(x => x.group.children.length > 0).length;
    }
    
    public async clearAllChunks(terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams) {

        this.chunks.forEach(chunk => {
          
            // Remove the mesh from the scene (if needed)
            this.scene.remove(chunk.group);
            
            chunk.group.children.forEach(x => {
              if(x != null) {
  
                  let mesh = x as THREE.Mesh;
  
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
              }

          })        
        });
              
        // Clear the array after disposing
        this.chunks.length = 0;        
    }

    private async generateMeshesForChunk(gridX: number, gridZ: number,
      offsetX: number,
      offsetZ: number,
      verticesPerSide: number, heightScale: number,
      terrainGridParams: TerrainGridParams,
      params: TerrainGeneratorParams, randomColor: THREE.Color, terrainLOD: TerrainLOD): Promise<THREE.Group> {

        let group = new THREE.Group();

        //const material1 = new THREE.MeshStandardMaterial({ color: randomColor, wireframe: this.isWireFrame});        /
        //console.log(heightScale);

        switch(terrainLOD) {
          case TerrainLOD.High:
          // high detail
          const highDetailPlaneMesh = this.meshGenerator.createPlaneMeshFromNoise(offsetX, offsetZ, this.simplexNoiseGenerator, verticesPerSide, verticesPerSide, this.shaderMaterial, terrainGridParams.meshRotation, params);
          highDetailPlaneMesh.receiveShadow = true;
          highDetailPlaneMesh.position.setX(gridX * verticesPerSide);
          highDetailPlaneMesh.position.setZ(-gridZ * verticesPerSide);
          highDetailPlaneMesh.userData.LOD = TerrainLOD.High;
          highDetailPlaneMesh.visible = false;
          group.add(highDetailPlaneMesh);
          break;

        case TerrainLOD.Medium:
          // medium detail
          const mediumDetailPlaneMesh = this.meshGenerator.createPlaneMeshFromNoise(offsetX, offsetZ, this.simplexNoiseGenerator, verticesPerSide, verticesPerSide/8, this.shaderMaterial, terrainGridParams.meshRotation, params);
          mediumDetailPlaneMesh.receiveShadow = true;
          mediumDetailPlaneMesh.position.setX(gridX * verticesPerSide);
          mediumDetailPlaneMesh.position.setZ(-gridZ * verticesPerSide);
          mediumDetailPlaneMesh.userData.LOD = TerrainLOD.Medium;
          mediumDetailPlaneMesh.visible = false;
          group.add(mediumDetailPlaneMesh);
          break;
        
        case TerrainLOD.Low:
          // low detail
          const lowDetailPlaneMesh = this.meshGenerator.createPlaneMeshFromNoise(offsetX, offsetZ, this.simplexNoiseGenerator, verticesPerSide, verticesPerSide/16, this.shaderMaterial, terrainGridParams.meshRotation, params);
          lowDetailPlaneMesh.receiveShadow = true;
          lowDetailPlaneMesh.position.setX(gridX * verticesPerSide);
          lowDetailPlaneMesh.position.setZ(-gridZ * verticesPerSide);
          lowDetailPlaneMesh.userData.LOD = TerrainLOD.Low;
          lowDetailPlaneMesh.visible = false;
          group.add(lowDetailPlaneMesh);      
          break;
        }
  
        return group;
    }

    public update(camera: THREE.Camera, terrainGridParams: TerrainGridParams, params: TerrainGeneratorParams) {
      
        
        // one chunk at a time  
        /*

        let column = Math.floor((camera.position.x + terrainGridParams.verticesPerSide * 0.5) / terrainGridParams.verticesPerSide);
        let row = -Math.floor((camera.position.z + terrainGridParams.verticesPerSide * 0.5) / terrainGridParams.verticesPerSide);
      
        const offsetX = column * terrainGridParams.verticesPerSide;
        const offsetZ = row * terrainGridParams.verticesPerSide;      
        let closestChunk = this.chunks.find(x => x.offset.x == offsetX && x.offset.y == offsetZ);
        if(!closestChunk?.meshesAreGenerated()) {
          this.generateChunk(terrainGridParams, params, column, row, offsetX, offsetZ);
        } 
        */       
        let allCloseChunks = this.chunks.filter(chunk => chunk.offset.distanceTo(new THREE.Vector2(camera.position.x, -camera.position.z)) < this.terrainLodSettings.drawDistance);
        allCloseChunks.forEach(chunk => {
          let distance = chunk.offset.distanceTo(new THREE.Vector2(camera.position.x, -camera.position.z));

          if(distance > this.terrainLodSettings.lowDetailThreshold) {
            if(!chunk.getMeshByLOD(TerrainLOD.Low)) {
              chunk.removeMeshes(this.scene);
              this.generateChunk(terrainGridParams, params, chunk.gridX, chunk.gridZ, chunk.offset.x, chunk.offset.y, TerrainLOD.Low);
              chunk.setRed();
            }
            if(chunk.instancedVegetationMesh != null)
              chunk.instancedVegetationMesh.visible = false;
          }              
          else if(distance > this.terrainLodSettings.mediumDetailThreshold)
          {
            if(!chunk.getMeshByLOD(TerrainLOD.Medium)) {
              chunk.removeMeshes(this.scene);
              this.generateChunk(terrainGridParams, params, chunk.gridX, chunk.gridZ, chunk.offset.x, chunk.offset.y, TerrainLOD.Medium);
              chunk.setYellow();
            }
            if(chunk.instancedVegetationMesh != null)
              chunk.instancedVegetationMesh.visible = false;
          }
          else 
          {
            if(!chunk.getMeshByLOD(TerrainLOD.High)) {
              chunk.removeMeshes(this.scene);
              this.generateChunk(terrainGridParams, params, chunk.gridX, chunk.gridZ, chunk.offset.x, chunk.offset.y, TerrainLOD.High);
              chunk.setGreen();
            }
            if(chunk.instancedVegetationMesh != null)
              chunk.instancedVegetationMesh.visible = true;
          }
        });

        let allFarChunks = this.chunks.filter(chunk => chunk.offset.distanceTo(new THREE.Vector2(camera.position.x, -camera.position.z)) >= this.terrainLodSettings.drawDistance);
        allFarChunks.forEach(chunk => {
          chunk.removeMeshes(this.scene);
        });
    }

    private generateMaterial(repeats: number, heightFactor: number, isWireframe: boolean): THREE.Material {

      const loader = new THREE.TextureLoader();

      const texture1 = this.loadAndConfigureTexture(loader, "assets/sand.png", repeats);                
      const texture2 = this.loadAndConfigureTexture(loader, "assets/tileable_grass_00.png", repeats);        
      const texture3 = this.loadAndConfigureTexture(loader, "assets/stone.png", repeats);        
      const texture4 = this.loadAndConfigureTexture(loader, "assets/stone.png", repeats);
      const texture5 = this.loadAndConfigureTexture(loader, "assets/snow.png", repeats);

      return new THREE.ShaderMaterial({
          uniforms: {
            lowTexture: { value: texture1},
            lowMidTexture: { value: texture2 },
            midTexture: { value: texture3 },
            highMidTexture: { value: texture4 },
            highTexture: { value: texture5 },
            repeats: { value: repeats },
            heightFactor: { value: heightFactor },
            //fogColor: { value: this.fog?.color ?? new THREE.Color('black') },
            //fogNear: { value: (this.fog as THREE.Fog)?.near ?? 10000 },
            //fogFar: { value: (this.fog as THREE.Fog)?.far ?? 10000 },
          },
          //fog: this.gameConfig.useFog,
          vertexShader: this.vertexShader4(),
          fragmentShader: this.fragmentShader4(),
          wireframe: isWireframe
      });
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
    loadAndConfigureTexture(loader: THREE.TextureLoader, asset: string, repeats: number): THREE.Texture
    {
        const texture = loader.load(asset);                
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        //texture.minFilter = THREE.NearestMipMapLinearFilter;
        //texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.repeat.set(repeats, repeats);
        texture.needsUpdate = true;

        return texture;
    }
    
    vertexShader4() {
      return `
      varying vec3 vPosition;
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        vPosition = position;
        vUv = uv;
        
        // Calculate model-view position (required for fog)
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        // Pass the fog depth (distance from the camera)
        vFogDepth = -mvPosition.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `
    }

    fragmentShader4() {
      return `

      uniform sampler2D lowTexture;
      uniform sampler2D lowMidTexture;
      uniform sampler2D midTexture;
      uniform sampler2D highMidTexture;
      uniform sampler2D highTexture;      
      
      uniform float repeats;
      uniform float heightFactor;

      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;

      varying vec3 vPosition;      
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        float height = vPosition.z / heightFactor; // Normalize height to 0.0 - 1.0

        vec2 repeatedUv = vUv * repeats; // Adjust the number of repetitions here

        vec4 lowColor = texture2D(lowTexture, repeatedUv);
        vec4 lowMidColor = texture2D(lowMidTexture, repeatedUv);
        vec4 midColor = texture2D(midTexture, repeatedUv);
        vec4 highMidColor = texture2D(highMidTexture, repeatedUv);
        vec4 highColor = texture2D(highTexture, repeatedUv);

        vec4 color = mix(lowColor, lowMidColor, smoothstep(0.0, 0.1, height));
        color = mix(color, midColor, smoothstep(0.1, 0.5, height));
        color = mix(color, highMidColor, smoothstep(0.5, 0.75, height));
        color = mix(color, highColor, smoothstep(0.75, 1.0, height));

        gl_FragColor = color;

        
        //// Fog factor calculation (standard linear fog)
        //float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

        //// Mix base color with fog color based on fog factor
        //gl_FragColor = vec4(mix(color.rgb, fogColor, fogFactor), color.a);
      }
        `
    }
}

export { TerrainGridParams, TerrainGeneratorParams };
