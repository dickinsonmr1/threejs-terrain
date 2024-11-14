export class TerrainGridParams
{
    constructor(chunksPerSideOfGrid: number, verticesPerSide: number, heightScale: number, meshRotation: number) {
      this.chunksPerSideOfGrid = chunksPerSideOfGrid;
      this.verticesPerSide = verticesPerSide;      
      this.heightScale = heightScale;
      this.meshRotation = meshRotation;
    }

    chunksPerSideOfGrid: number;
    verticesPerSide: number;
    heightScale: number;
    meshRotation: number;
}