import { Bullet } from "../../actor/bullet";
import { GameObject } from "../../lib/game-object";
import { Vector2 } from "../../lib/vector2";
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

            const bullet = new Bullet(speed, new Vector2(vx, vy), 10);
            bullet.transform.position = new Vector2(myPos.x, myPos.y);
            GameObject.instantiate(bullet);
        }
    }
}
