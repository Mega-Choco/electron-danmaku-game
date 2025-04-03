import { Component } from "../lib/component";
import { Vector2 } from "../lib/vector2";

export class Projectile extends Component{
    speed: number;
    velocity: Vector2
    constructor(speed: number, velocity: Vector2 = new Vector2()){
        super();
        this.speed = speed;
        this.velocity = velocity;
    }
    
    update(delta: number): void {

        if((this.gameObject.transform.position.x <= -30 || this.gameObject.transform.position.x >= 830) ||
        (this.gameObject.transform.position.y <= -30 || this.gameObject.transform.position.y >= 630)){
            this.gameObject.disable();
        }
        this.gameObject.transform.position.x += (this.speed * delta) * this.velocity.x;
        this.gameObject.transform.position.y += (this.speed * delta) * this.velocity.y;
    }
}