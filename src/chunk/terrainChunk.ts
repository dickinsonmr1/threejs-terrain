import * as THREE from 'three'

export enum TerrainLOD {
    Low = 0.25,
    Medium = 0.5,
    High = 1
}

export class TerrainChunk {

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

    public isVisible() {
        return this.group.children.length > 0;
    }

    public setMeshes(group: THREE.Group) {
        this.group = group;
    }

    public getMesh(camera?: THREE.Camera): THREE.Mesh {
        
        if(!camera)
            return this.group.children[0]! as THREE.Mesh;
        
        return this.group.children[0]! as THREE.Mesh;
    }

    public getMeshByLOD(terrainLOD: TerrainLOD): THREE.Mesh | null {
        
        let result = this.group.children.find(x => x.userData.LOD == terrainLOD)! as THREE.Mesh;
        if(!result)
            return null;
        
        return result;
    }

    removeMeshes(scene: THREE.Scene) {
        this.group.children.forEach(x => {
            if(x != null) {

                let mesh = x as THREE.Mesh;

                scene.remove(mesh);
                
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
    }

    /*
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
    */

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