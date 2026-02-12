import { Bullet, BulletOwner } from "../actor/bullet";
import { Game } from "../game";
import { Collider } from "../lib/collider";
import { CircleCollider } from "./circle-colider";

export class PlayerHitboxColider extends CircleCollider {
    constructor(radius: number, debug: boolean = false, debugStyle: string = "red") {
        super(radius, debug, debugStyle);
        this.tag = "player-hitbox";
    }

    override doCollisionEnter(target: Collider): void {
        if (target.gameObject instanceof Bullet) {
            if (target.gameObject.owner !== BulletOwner.Enemy) {
                return;
            }
            Game.increaseHitCount();
        }
    }
}
