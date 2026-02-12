import { Bullet, BulletOwner } from "../actor/bullet";
import { Collider } from "../lib/collider";
import { AssetManager } from "../manager/asset-manager";
import { Health } from "./health";
import { CircleCollider } from "./circle-colider";

const ENEMY_DAMAGE_SE_PATH = "/assets/sounds/se/se_damage00.wav";

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
        void AssetManager.playSound(ENEMY_DAMAGE_SE_PATH, 0.45);
        target.gameObject.disable();
    }
}
