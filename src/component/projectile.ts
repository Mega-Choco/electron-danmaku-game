import { Component } from "../lib/component";
import { Vector2 } from "../lib/vector2";
import { Setting } from "../setting";

export class Projectile extends Component{
    speed: number;
    velocity: Vector2;
    acceleration: number;
    turnRateDegPerSec: number;
    grazed: boolean = false;
    
    constructor(speed: number, velocity: Vector2 = new Vector2(), acceleration: number = 0, turnRateDegPerSec: number = 0){
        super();
        this.speed = speed;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.turnRateDegPerSec = turnRateDegPerSec;
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

        if (this.turnRateDegPerSec !== 0) {
            const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
            const nextAngle = currentAngle + ((this.turnRateDegPerSec * Math.PI) / 180) * delta;
            this.velocity.x = Math.cos(nextAngle);
            this.velocity.y = Math.sin(nextAngle);
        }

        if (this.acceleration !== 0) {
            this.speed = Math.max(0, this.speed + this.acceleration * delta);
        }

        this.gameObject.transform.position.x += (this.speed * delta) * this.velocity.x;
        this.gameObject.transform.position.y += (this.speed * delta) * this.velocity.y;
    }
}
