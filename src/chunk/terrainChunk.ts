import * as THREE from 'three'

export enum TerrainLOD {
    Low = 0.25,
    Medium = 0.5,
    High = 1
}

export class TerrainChunk {

    mesh!: THREE.Mesh;

    // TODO: refactor meshes, potentially into group?
    highDetailMesh!: THREE.Mesh;
    mediumDetailMesh!: THREE.Mesh;
    lowDetailMesh!: THREE.Mesh;

    group: THREE.Group = new THREE.Group();

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

    setMesh(mesh: THREE.Mesh, lod: TerrainLOD) {

        if(!this.mesh) {
            this.mesh = mesh;
        }

        switch(lod){
            case TerrainLOD.High:
                this.setHighDetailMesh(mesh);
                break;
            case TerrainLOD.Medium:
                this.setMediumDetailMesh(mesh);
                break;
            case TerrainLOD.Low:
                this.setLowDetailMesh(mesh);
            break;
        }
    }
    
    private setHighDetailMesh(mesh: THREE.Mesh) {
        if(!this.highDetailMesh) {
            this.highDetailMesh = mesh;
        }
    }

    private setMediumDetailMesh(mesh: THREE.Mesh) {
        if(!this.mediumDetailMesh) {
            this.mediumDetailMesh = mesh;
        }
    }

    private setLowDetailMesh(mesh: THREE.Mesh) {
        if(!this.lowDetailMesh) {
            this.lowDetailMesh = mesh;
        }
    }

    removeMesh(scene: THREE.Scene) {
        // TODO: update to remove all LOD meshes
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