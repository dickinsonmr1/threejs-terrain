import * as THREE from 'three'
import '../threeExtensions'; // Import the extension method to enhance THREE.Group

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

    gridX: number;
    gridZ: number;
    position: THREE.Vector3;
    offset: THREE.Vector2;
    verticesPerSide: number;

    vegetationMeshes: THREE.Mesh[] = [];
    instancedVegetationMesh!: THREE.InstancedMesh;

    constructor(gridX: number, gridZ: number, offset: THREE.Vector2, verticesPerSide: number) {

        this.gridX = gridX;
        this.gridZ = gridZ;
        this.position = new THREE.Vector3(gridX * verticesPerSide, 0, -gridZ * verticesPerSide);

        this.offset = offset;
        this.verticesPerSide = verticesPerSide;
    }

    public meshesAreGenerated() {
        return this.group.children.length > 0;
    }

    public setMeshes(group: THREE.Group) {

        group.children.forEach(x => {
            if(x != null) {

                let mesh = x as THREE.Mesh;
                                
                this.group.add(mesh);
                mesh.visible = true;
                this.group.visible = true;
            }
        });
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

        this.group.disposeGroupAndRemoveFromScene(scene);
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
        });   
        this.group.clear();
        scene.remove(this.group);    
    }

    setGreen() {
        this.group.children.forEach(x => {
            if(x != null) {

                let mesh = x as THREE.Mesh;

                const meshMaterial = mesh.material as THREE.MeshStandardMaterial; // Ensure correct type
                meshMaterial.color.set(0x00ff00);

                if(x.userData.LOD == TerrainLOD.High)
                    mesh.visible = true;
                else   
                    mesh.visible = false;
            }
        });
    }

    setYellow() {
        this.group.children.forEach(x => {
            if(x != null) {

                let mesh = x as THREE.Mesh;

                const meshMaterial = mesh.material as THREE.MeshStandardMaterial; // Ensure correct type
                meshMaterial.color.set(0xffff00);

                if(x.userData.LOD == TerrainLOD.Medium)
                    mesh.visible = true;
                else   
                    mesh.visible = false;
            }
        });
    }

    setRed() {
        this.group.children.forEach(x => {
            if(x != null) {

                let mesh = x as THREE.Mesh;

                const meshMaterial = mesh.material as THREE.MeshStandardMaterial; // Ensure correct type
                meshMaterial.color.set(0xff0000);

                if(x.userData.LOD == TerrainLOD.Low)
                    mesh.visible = true;
                else   
                    mesh.visible = false;
            }
        });        
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