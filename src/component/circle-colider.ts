import { Collision } from "../lib/collision";
import { GameObject } from "../lib/game-object";

export class CircleCollider extends Collision{
    radius: number = 0;
    debug: boolean = false;
    debugStyle: string = 'red';
    
    constructor(radius: number, debug: boolean = false, debugColor: string = 'red'){
        super();
        this.radius = radius;
        this.debug = debug;
        this.debugStyle = debugColor;
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
    
        if(this.debug){
        
            context.beginPath();
            context.arc(
                this.gameObject.transform.position.x,
                this.gameObject.transform.position.y,
                this.radius,
                0,
                Math.PI * 2
            );
            context.fillStyle =this.debugStyle;
            context.lineWidth = 2;
            context.fill();
        }
    }
    
    doCollide(target: Collision): void {
        console.log("circle collider collision detected");
        throw new Error("Method not implemented.");
    }
}