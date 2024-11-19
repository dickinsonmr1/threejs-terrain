import * as THREE from 'three'

export class TerrainChunk {

    mesh!: THREE.Mesh;
    neighborTop!: TerrainChunk;
    neighborBottom!: TerrainChunk;
    neighborLeft!: TerrainChunk;
    neighborRight!: TerrainChunk;

    offset: THREE.Vector2;
    verticesPerSide: number;

    vegetationMeshes: THREE.Mesh[] = [];
    instancedVegetationMesh!: THREE.InstancedMesh;

    constructor(offset: THREE.Vector2, verticesPerSide: number) {
        this.offset = offset;
        this.verticesPerSide = verticesPerSide;
    }
    
    setMesh(mesh: THREE.Mesh) {
        if(!this.mesh) {
            this.mesh = mesh;
        }
    }

    removeMesh(scene: THREE.Scene) {
        if(this.mesh != null) {
            scene.remove(this.mesh);
            
            // Dispose of the geometry and material associated with the mesh
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) {
                // If the material is an array (e.g., for MultiMaterial), dispose each one
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(material => material.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
        }
    }

    setNeighborTop(neighborChunk: TerrainChunk) {
        this.neighborTop = neighborChunk;
    }

    setNeighborButtom(neighborChunk: TerrainChunk) {
        this.neighborBottom = neighborChunk;
    }
    
    setNeighborLeft(neighborChunk: TerrainChunk) {
        this.neighborLeft = neighborChunk;
    }

    setNeighborRight(neighborChunk: TerrainChunk) {
        this.neighborRight = neighborChunk;
    }

    public addVegetationMesh(mesh: THREE.Mesh) 
    {
        this.vegetationMeshes.push(mesh);
    }

    public addInstancedVegetationMesh(mesh: THREE.InstancedMesh) 
    {
        //this.vegetationMeshes.push(mesh);
        this.instancedVegetationMesh = mesh;
    }
} 