export class TerrainGeneratorParams
{
    constructor(scale: number, octaves: number, lacunarity: number,
        exponentiation: number, height: number, persistence: number) {
            this.scale = scale;
            this.octaves = octaves;
            this.lacunarity = lacunarity;
            this.exponentiation = exponentiation;
            this.height = height;
            this.persistence = persistence;
    }

    scale: number;
    octaves: number;
    lacunarity: number;
    exponentiation: number;
    height: number;
    persistence: number;
}