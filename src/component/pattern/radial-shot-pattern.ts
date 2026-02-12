import { BulletOwner } from "../../actor/bullet";
import { GameObject } from "../../lib/game-object";
import { Vector2 } from "../../lib/vector2";
import { PoolManager } from "../../manager/pool-manager";
import { Pattern } from "./pattern";

export class RadialShotPattern extends Pattern {
    fire(enemy: GameObject): void {
        const cnt = 5;
        const speed = 10;
        const myPos = enemy.transform.position;

        for (let i = 0; i < cnt; i++) {
            const angle = (2 * Math.PI / cnt) * i;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            PoolManager.acquireBullet({
                position: new Vector2(myPos.x, myPos.y),
                speed,
                velocity: new Vector2(vx, vy),
                radius: 10,
                owner: BulletOwner.Enemy,
            });
        }
    }
}
