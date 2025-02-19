// utils/positionUtils.ts
interface Position {
    x: number;
  y: number;
  positions?: number[]; 
  }
  
  const positionUtils = {
    calculateDistance: (start: Position, end: Position): number => {
      // Calculate the distance between two positions
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      return Math.sqrt(deltaX ** 2 + deltaY ** 2);
    },
  };
  
  export { positionUtils };
export type { Position };

