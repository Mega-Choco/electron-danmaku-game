import { Circle } from "../component/circle";
import { EnemyHitCollider } from "../component/enemy-hit-collider";
import { EmenyController } from "../component/enemy-controller";
import { Health } from "../component/health";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

export class Enemy extends GameObject{
    constructor(position: Vector2, maxHealth: number = 20, hitboxRadius: number = 15){
        super("enemy", position);
        this.addComponent(new Circle(hitboxRadius,"red"));
        this.addComponent(new Health(maxHealth));
        this.addComponent(new EnemyHitCollider(hitboxRadius));
        this.addComponent(new EmenyController(.5,10));
    }
}
