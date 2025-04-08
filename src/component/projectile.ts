import { Component } from "../lib/component";
import { Vector2 } from "../lib/vector2";
import { Setting } from "../setting";

export class Projectile extends Component{
    speed: number;
    velocity: Vector2
    constructor(speed: number, velocity: Vector2 = new Vector2()){
        super();
        this.speed = speed;
        this.velocity = velocity;
    }
    
    update(delta: number): void {

        const deadzoneOffset = Setting.system.bulletDeadZoneOffset;

        if(
            (this.gameObject.transform.position.x <= -deadzoneOffset || this.gameObject.transform.position.x >= (Setting.screen.width + deadzoneOffset)) ||
            (this.gameObject.transform.position.y <= -deadzoneOffset || this.gameObject.transform.position.y >= (Setting.screen.height + deadzoneOffset))
        ){
            this.gameObject.disable();
            return;
        }

        this.gameObject.transform.position.x += (this.speed * delta) * this.velocity.x;
        this.gameObject.transform.position.y += (this.speed * delta) * this.velocity.y;
    }
}