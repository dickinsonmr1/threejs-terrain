import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { TerrainGeneratorParams } from './terrainGeneratorParams';

export class SimplexNoiseGenerator {

    private noise2D: NoiseFunction2D;
    private terrainGeneratorParams: TerrainGeneratorParams;
    
    constructor(params: TerrainGeneratorParams, ){
        this.noise2D = createNoise2D();  
        this.terrainGeneratorParams = params;
    }

    public getHeightFromNoiseFunction(x: number, y: number): number {
  
        const xs = x / this.terrainGeneratorParams.scale;
          const ys = y / this.terrainGeneratorParams.scale;
          const G = 2.0 ** (-this.terrainGeneratorParams.persistence);
  
          let amplitude = 1.0;
          let frequency = 1.0;
          let normalization = 0;
          let total = 0;
  
          for (let o = 0; o < this.terrainGeneratorParams.octaves; o++) {
              const noiseValue = this.noise2D(xs * frequency, ys * frequency) * 0.5 + 0.5;
              total += noiseValue * amplitude;
              normalization += amplitude;
              amplitude *= G;
              frequency *= this.terrainGeneratorParams.lacunarity;
          }
  
          total /= normalization;
          return Math.pow(total, this.terrainGeneratorParams.exponentiation) * this.terrainGeneratorParams.height;
    }
}