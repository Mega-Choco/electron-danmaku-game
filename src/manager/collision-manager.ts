import { CircleCollider } from "../component/circle-colider";

export class CollisionManager {
    cellSize: number;
    grid: Map<string, Set<CircleCollider>> = new Map();
    colliderToCellKeys: Map<CircleCollider, Set<string>> = new Map();
    colliders: CircleCollider[] = [];

    constructor(cellSize: number = 100) {
      this.cellSize = cellSize;
    }
  
    private getCellKey(x: number, y: number): string {
      const cx = Math.floor(x / this.cellSize);
      const cy = Math.floor(y / this.cellSize);
      return `${cx},${cy}`;
    }
  
    private getOverlappingCellKeys(collider: CircleCollider): Set<string> {
      const { x, y } = collider.gameObject.transform.position;
      const r = collider.radius;
      const left = Math.floor((x - r) / this.cellSize);
      const right = Math.floor((x + r) / this.cellSize);
      const top = Math.floor((y - r) / this.cellSize);
      const bottom = Math.floor((y + r) / this.cellSize);
  
      const keys = new Set<string>();
      for (let cx = left; cx <= right; cx++) {
        for (let cy = top; cy <= bottom; cy++) {
          keys.add(`${cx},${cy}`);
        }
      }
      return keys;
    }
  
    update(){
        for(const c of this.colliders){
            if(c.enabled)
              this.updateCollider(c);
        }
    }

    updateCollider(collider: CircleCollider) {
      const newKeys = this.getOverlappingCellKeys(collider);
      const oldKeys = this.colliderToCellKeys.get(collider) || new Set();
  
      for (const key of oldKeys) {
        this.grid.get(key)?.delete(collider);
      }
  
      for (const key of newKeys) {
        if (!this.grid.has(key)) {
          this.grid.set(key, new Set());
        }
        this.grid.get(key)!.add(collider);
      }
  
      this.colliderToCellKeys.set(collider, newKeys);
    }
  
    getPotentialCollisions(collider: CircleCollider): CircleCollider[] {
      const keys = this.getOverlappingCellKeys(collider);
      const result = new Set<CircleCollider>();
  
      for (const key of keys) {
        const cell = this.grid.get(key);
        if (!cell) continue;
        for (const other of cell) {
          if (other !== collider) result.add(other);
        }
      }
  
      return Array.from(result);
    }
  
    detectAllCollisions(): [CircleCollider, CircleCollider][] {
      const result: [CircleCollider, CircleCollider][] = [];
      const processed = new Set<CircleCollider>();
  
      for (const cell of this.grid.values()) {
        for (const collider of cell) {
          const neighbors = this.getPotentialCollisions(collider);
          for (const other of neighbors) {
            if (!processed.has(other) &&
                (collider.checkCollision(other))) {
                    collider.doCollide(other)
              result.push([collider, other]);
            }
          }
          processed.add(collider);
        }
      }
  
      return result;
    }
  
    clear() {
      this.grid.clear();
      this.colliderToCellKeys.clear();
    }

    drawDebugLine(ctx: CanvasRenderingContext2D){
        ctx.strokeStyle = "#ddd";
        const cellSize = this.cellSize;
        for (let x = 0; x <= 800; x += cellSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0); 
          ctx.lineTo(x, 600);
          ctx.stroke();
        }
        for (let y = 0; y <= 600; y += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(800, y);
          ctx.stroke();
        }
        
        //this.drawDebugInfo(ctx);
    }

    drawDebugInfo(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = "black";
        ctx.font = "14px monospace";
        let offset: number = 20;
        
        for(const [key, set] of this.grid){
            ctx.fillText(`cell [${key}]: ${set.size} `, 10, offset);
            offset += 20;
        }
    }
  }