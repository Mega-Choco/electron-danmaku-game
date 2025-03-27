import { Collision } from "../lib/collision";
import { GameObject } from "../lib/game-object";

export class CircleCollider extends Collision{
    radius: number = 0;
    
    constructor(radius: number){
        super();
        this.radius = radius;
    }
    
    checkCollision(target: Collision): boolean {
        const targetPos = target.gameObject.transform.position;
        const myPos = this.gameObject.transform.position;
        
        if(target instanceof CircleCollider){
            const d = (targetPos.x - myPos.x) ^ 2 + (targetPos.y - targetPos.y) ^ 2;
            const r = (this.radius + target.radius) ^ 2;
            return d <= r;
        }
        // not supported
        return false;
    }
    doCollide(target: Collision): void {
        throw new Error("Method not implemented.");
    }
}