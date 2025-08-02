import { Bullet } from "../../actor/bullet";
import { Game } from "../../game";
import { GameObject } from "../../lib/game-object";
import { Vector2 } from "../../lib/vector2";
import { Pattern } from "./pattern";

export class FanShotPattern extends Pattern {
    fire(enemy: GameObject): void {
        const bulletCount = 1;
        const speed = 15;
        const angleRange = Math.PI / 4;

        const myPos = enemy.transform.position;
        const playerPos = Game.player?.transform.position;

        if (!playerPos) return;

        const dx = playerPos.x - myPos.x;
        const dy = playerPos.y - myPos.y;

        const startAngle = Math.atan2(dy, dx);
        const angleOffset = -angleRange / 2;

        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + angleOffset + (angleRange / (bulletCount - 1)) * i;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const bullet = new Bullet(speed, new Vector2(vx, vy), 10);
            bullet.transform.position = new Vector2(myPos.x, myPos.y);
            GameObject.instantiate(bullet);
        }
    }
}
