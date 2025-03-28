import { Circle } from "../component/circle";
import { CircleCollider } from "../component/circle-colider";
import { Projectile } from "../component/projectile";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

export class Bullet extends GameObject{
    constructor(speed: number, velocity: Vector2, radius: number){
        super("bullet");
        this.addComponent(new Circle(radius, 'green'));
        this.addComponent(new CircleCollider(radius));
        this.addComponent(new Projectile(speed, velocity))
    }
}