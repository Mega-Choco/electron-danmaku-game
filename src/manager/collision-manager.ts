import { CircleCollider } from "../component/circle-colider";
import { Setting } from "../setting";

export class CollisionManager {
    private cellSize: number;
    private grid: Map<string, Set<CircleCollider>> = new Map();
    private colliderToCellKeys: Map<CircleCollider, Set<string>> = new Map();
    private colliders: Set<CircleCollider> = new Set();

    constructor(cellSize: number = 100) {
        this.cellSize = cellSize;
    }

    // 콜라이더 추가/제거
    addCollider(collider: CircleCollider): void {
        this.colliders.add(collider);
        this.updateCollider(collider);
    }

    removeCollider(collider: CircleCollider): void {
        this.colliders.delete(collider);
        this.removeColliderFromGrid(collider);
    }

    private removeColliderFromGrid(collider: CircleCollider): void {
        const cellKeys = this.colliderToCellKeys.get(collider);
        if (cellKeys) {
            for (const key of cellKeys) {
                this.grid.get(key)?.delete(collider);
            }
            this.colliderToCellKeys.delete(collider);
        }
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

    update(): void {
        // 활성화된 콜라이더들의 그리드 위치 업데이트
        for (const collider of this.colliders) {
            if (collider.enabled) {
                this.updateCollider(collider);
            } else {
                // 비활성화된 콜라이더는 그리드에서 제거
                this.removeColliderFromGrid(collider);
            }
        }
        
        this.detectAllCollisions();
    }

    private updateCollider(collider: CircleCollider): void {
        const newKeys = this.getOverlappingCellKeys(collider);
        const oldKeys = this.colliderToCellKeys.get(collider) || new Set();

        const keysToRemove = new Set<string>();
        const keysToAdd = new Set<string>();

        for (const key of oldKeys) {
            if (!newKeys.has(key)) {
                keysToRemove.add(key);
            }
        }

        for (const key of newKeys) {
            if (!oldKeys.has(key)) {
                keysToAdd.add(key);
            }
        }

        // 제거
        for (const key of keysToRemove) {
            this.grid.get(key)?.delete(collider);
        }

        // 추가
        for (const key of keysToAdd) {
            if (!this.grid.has(key)) {
                this.grid.set(key, new Set());
            }
            this.grid.get(key)!.add(collider);
        }

        this.colliderToCellKeys.set(collider, newKeys);
    }

    private getPotentialCollisions(collider: CircleCollider): Set<CircleCollider> {
        const keys = this.getOverlappingCellKeys(collider);
        const result = new Set<CircleCollider>();

        for (const key of keys) {
            const cell = this.grid.get(key);
            if (!cell) continue;
            
            for (const other of cell) {
                if (other !== collider && other.enabled) {
                    result.add(other);
                }
            }
        }

        return result;
    }

    private detectAllCollisions(): void {
        const checkedPairs = new Set<string>();
        for (const cellColliders of this.grid.values()) {
        
            if (cellColliders.size < 2) continue;
            
            const colliderArray = Array.from(cellColliders);
            
            for (let i = 0; i < colliderArray.length - 1; i++) {
                for (let j = i + 1; j < colliderArray.length; j++) {
                    const colliderA = colliderArray[i];
                    const colliderB = colliderArray[j];
                    
                    const pairKey = this.createPairKey(colliderA, colliderB);
                    if (checkedPairs.has(pairKey)) continue;
                    
                    checkedPairs.add(pairKey);
                    
                    if (colliderA.checkCollision(colliderB)) {
                        colliderA.doCollide(colliderB);
                        colliderB.doCollide(colliderA);
                    }
                }
            }
        }
    }
    
    private createPairKey(a: CircleCollider, b: CircleCollider): string {
        return a < b ? `${a}-${b}` : `${b}-${a}`;
    }

    clear(): void {
        this.grid.clear();
        this.colliderToCellKeys.clear();
        this.colliders.clear();
    }

    // 디버그 그리드 그리기
    drawDebugGrid(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        
        const { width, height } = Setting.screen;
        
        // 수직선
        for (let x = 0; x <= width; x += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // 수평선
        for (let y = 0; y <= height; y += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawDebugInfo(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = "12px monospace";
        
        let y = 20;
        const lineHeight = 16;
        
        ctx.fillText(`Total Colliders: ${this.colliders.size}`, 10, y);
        y += lineHeight;
        
        ctx.fillText(`Active Cells: ${this.grid.size}`, 10, y);
        y += lineHeight;
        
        // 셀별 정보 (많을 경우 처음 10개만)
        let cellCount = 0;
        for (const [key, colliders] of this.grid) {
            if (cellCount >= 10) {
                ctx.fillText("...", 10, y);
                break;
            }
            
            if (colliders.size > 0) {
                ctx.fillText(`Cell [${key}]: ${colliders.size} colliders`, 10, y);
                y += lineHeight;
                cellCount++;
            }
        }
        
        ctx.restore();
    }

    // 통합 디버그 렌더링
    drawDebug(ctx: CanvasRenderingContext2D, showGrid: boolean = true, showInfo: boolean = true): void {
        if (showGrid) this.drawDebugGrid(ctx);
        if (showInfo) this.drawDebugInfo(ctx);
    }
}