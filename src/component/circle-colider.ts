
import { Collider } from "../lib/collider";
import { GameObject } from "../lib/game-object";

export class CircleCollider extends Collider{
    radius: number = 0;
    debug: boolean = false;
    debugStyle: string = 'red';
    
    constructor(radius: number, debug: boolean = false, debugColor: string = 'red'){
        super();
        this.radius = radius;
        this.debug = debug;
        this.debugStyle = debugColor;
    }
    
   checkCollision(target: Collider): boolean {
    const targetPos = target.gameObject.transform.position;
    const myPos = this.gameObject.transform.position;
    
    if (target instanceof CircleCollider) {
        const dx = targetPos.x - myPos.x;
        const dy = targetPos.y - myPos.y;
        
        const distanceSquared = dx ** 2 + dy ** 2;
        const radiusSum = this.radius + target.radius;
        const radiusSumSquared = radiusSum ** 2;
        
        const collided = distanceSquared <= radiusSumSquared;
    
        return collided;
    }
    
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
    
    doCollisionEnter(target: Collider): void {
        console.log('콜리전 ㅇㅇ');
    }

    doCollisionStay(target: Collider): void {
        
    }
    doCollisionExit(target: Collider): void {
        
    }
}