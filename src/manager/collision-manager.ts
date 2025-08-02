import { CircleCollider } from "../component/circle-colider";
import { Collider } from "../lib/collider";
import { Setting } from "../setting";

export class CollisionManager {
  cellSize: number;
  grid: Map<string, Set<Collider>> = new Map();
  colliderToCellKeys: Map<Collider, Set<string>> = new Map();
  colliders: Collider[] = [];

  private currentCollisions = new Set<string>();
  private previousCollisions = new Set<string>();

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  private getOverlappingCellKeys(collider: Collider): Set<string> {

    if(collider instanceof CircleCollider){
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
    return new Set<string>();
  }

  private createPairId(a: Collider, b: Collider): string {
    const idA = a.getComponentId();
    const idB = b.getComponentId();
    return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
  }

  private getPairFromId(pairId: string): [Collider | null, Collider | null] {
    const [idA, idB] = pairId.split('-').map(Number);

    let colliderA: Collider | null = null;
    let colliderB: Collider | null = null;

    for (const collider of this.colliders) {
      if (collider.getComponentId() === idA) colliderA = collider;
      if (collider.getComponentId() === idB) colliderB = collider;
      if (colliderA && colliderB) break;
    }

    return [colliderA, colliderB];
  }

  update() {
    for (const c of this.colliders) {
      if (c.enabled) {
        this.updateCollider(c);
      
      }
    }

    this.detectAllCollisions();
  }

  updateCollider(collider: Collider) {
    const newKeys = this.getOverlappingCellKeys(collider);
    const oldKeys = this.colliderToCellKeys.get(collider) || new Set();

    for (const key of oldKeys) {
      const cell = this.grid.get(key);
      if (cell) {
        cell.delete(collider);
        if (cell.size === 0) {
          this.grid.delete(key);
        }
      }
    }

    for (const key of newKeys) {
      if (!this.grid.has(key)) {
        this.grid.set(key, new Set());
      }
      this.grid.get(key)!.add(collider);
    }

    this.colliderToCellKeys.set(collider, newKeys);
  }

  getPotentialCollisions(collider: Collider): Collider[] {
    const keys = this.colliderToCellKeys.get(collider) || new Set();
    const result = new Set<Collider>();

    for (const key of keys) {
      const cell = this.grid.get(key);
      if (!cell) continue;
      for (const other of cell) {
        if (other !== collider && other.enabled) {
          result.add(other);
        }
      }
    }

    return Array.from(result);
  }

  detectAllCollisions(): [Collider, Collider][] {
    const result: [Collider, Collider][] = [];
    const processedPairs = new Set<string>();
    const processedColliders = new Set<Collider>();

    this.previousCollisions = new Set(this.currentCollisions);
    this.currentCollisions.clear();

    for (const cell of this.grid.values()) {
      for (const collider of cell) {
        if (!collider.enabled || processedColliders.has(collider)) continue;

        const neighbors = this.getPotentialCollisions(collider);
        for (const other of neighbors) {
          const pairId = this.createPairId(collider, other);
          if (processedPairs.has(pairId)) continue;

          if (collider.checkCollision(other)) {
            this.currentCollisions.add(pairId);

            if (!this.previousCollisions.has(pairId)) {
              console.log(`충돌 시작: ${collider.getComponentId()} <-> ${other.getComponentId()}`);
              collider.doCollisionEnter(other);
              other.doCollisionEnter(collider);
            }
            else {
              collider.doCollisionStay?.(other);
              other.doCollisionStay?.(collider);
            }

            processedPairs.add(pairId);
            result.push([collider, other]);
          }
        }
        processedColliders.add(collider);
      }
    }

    for (const pairId of this.previousCollisions) {
      if (!this.currentCollisions.has(pairId)) {
        console.log(`충돌 종료: ${pairId}`);
        const [colliderA, colliderB] = this.getPairFromId(pairId);
        if (colliderA && colliderB) {
          colliderA.doCollisionExit?.(colliderB);
          colliderB.doCollisionExit?.(colliderA);
        }
      }
    }

    return result;
  }

  addCollider(collider: Collider) {
    if (!this.colliders.includes(collider)) {
      this.colliders.push(collider);
      this.updateCollider(collider);
    }
  }

  removeCollider(collider: Collider) {
    const index = this.colliders.indexOf(collider);
    if (index > -1) {
      this.colliders.splice(index, 1);
    }

    const toRemove: string[] = [];
    for (const pairId of this.currentCollisions) {
      const [colliderA, colliderB] = this.getPairFromId(pairId);
      if (colliderA === collider || colliderB === collider) {
        if (colliderA && colliderB) {
          colliderA.doCollisionExit?.(colliderB);
          colliderB.doCollisionExit?.(colliderA);
        }
        toRemove.push(pairId);
      }
    }

    for (const pairId of toRemove) {
      this.currentCollisions.delete(pairId);
      this.previousCollisions.delete(pairId);
    }

    const keys = this.colliderToCellKeys.get(collider) || new Set();
    for (const key of keys) {
      const cell = this.grid.get(key);
      if (cell) {
        cell.delete(collider);
        if (cell.size === 0) {
          this.grid.delete(key);
        }
      }
    }
    this.colliderToCellKeys.delete(collider);
  }
  clear() {
    this.grid.clear();
    this.colliderToCellKeys.clear();
    this.colliders.length = 0;
    this.currentCollisions.clear();
    this.previousCollisions.clear();
  }

  drawDebugLine(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#ddd";
    const cellSize = this.cellSize;
    for (let x = 0; x <= Setting.screen.width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, Setting.screen.height);
      ctx.stroke();
    }

    for (let y = 0; y <= Setting.screen.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(Setting.screen.width, y);
      ctx.stroke();
    }
  }

  drawDebugInfo(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "black";
    ctx.font = "14px monospace";
    let offset: number = 20;

    ctx.fillText(`총 콜라이더: ${this.colliders.length}`, 10, offset);
    offset += 20;
    ctx.fillText(`활성 셀: ${this.grid.size}`, 10, offset);
    offset += 20;
    ctx.fillText(`현재 충돌: ${this.currentCollisions.size}`, 10, offset);
    offset += 20;

    for (const [key, set] of this.grid) {
      if (set.size > 0) {
        ctx.fillText(`셀 [${key}]: ${set.size}개`, 10, offset);
        offset += 20;
      }
    }
  }
}