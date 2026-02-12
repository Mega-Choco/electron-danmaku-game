import { Bullet, BulletOwner } from "../actor/bullet";
import { Collider } from "../lib/collider";
import { Health } from "./health";
import { CircleCollider } from "./circle-colider";

export class EnemyHitCollider extends CircleCollider {
    damagePerHit: number;

    constructor(radius: number, damagePerHit: number = 1, debug: boolean = false, debugStyle: string = "rgba(255,0,255,0.3)") {
        super(radius, debug, debugStyle);
        this.damagePerHit = damagePerHit;
        this.tag = "enemy-hitbox";
    }

    override doCollisionEnter(target: Collider): void {
        if (!(target.gameObject instanceof Bullet)) {
            return;
        }

        if (target.gameObject.owner !== BulletOwner.Player) {
            return;
        }

        const health = this.gameObject.getComponent(Health);
        if (health == null || health.isDead()) {
            return;
        }

        health.takeDamage(this.damagePerHit);
        target.gameObject.disable();
    }
}
