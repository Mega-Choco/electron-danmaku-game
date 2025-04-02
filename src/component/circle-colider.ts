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

    draw(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.arc(this.gameObject.transform.position.x,
            this.gameObject.transform.position.y,
            this.radius,
            0,
            Math.PI * 2, 
            true
        );
        
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.stroke();
    }
    doCollide(target: Collision): void {
        throw new Error("Method not implemented.");
    }
}