import * as THREE from 'three'

export class TerrainChunk {

    mesh: THREE.Mesh;
    neighborTop!: TerrainChunk;
    neighborBottom!: TerrainChunk;
    neighborLeft!: TerrainChunk;
    neighborRight!: TerrainChunk;

    constructor(mesh: THREE.Mesh) {
        this.mesh = mesh;
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
}