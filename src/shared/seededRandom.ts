export class SeededRandom {
    private seed: number;
  
    constructor(seed: number) {
      this.seed = seed;
    }
  
    // Generate a pseudo-random number between 0 and 1
    next(): number {
      const x = Math.sin(this.seed++) * 10000;
      return x - Math.floor(x);
    }
  }