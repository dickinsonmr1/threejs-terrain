export class TerrainLodSettings
{
    constructor(drawDistance: number, lowDetailThreshold: number, mediumDetailThreshold: number, highDetailThreshold: number) {
      this.drawDistance = drawDistance;
      this.lowDetailThreshold = lowDetailThreshold;      
      this.mediumDetailThreshold = mediumDetailThreshold;
      this.highDetailThreshold = highDetailThreshold;
    }

    drawDistance: number;
    lowDetailThreshold: number;
    mediumDetailThreshold: number;
    highDetailThreshold: number;
}