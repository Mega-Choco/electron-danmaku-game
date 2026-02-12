import { BulletOwner } from "../../actor/bullet";
import { Game } from "../../game";
import { GameObject } from "../../lib/game-object";
import { Vector2 } from "../../lib/vector2";
import { PoolManager } from "../../manager/pool-manager";

export type EnemyPatternParams = Record<string, number | boolean | string | undefined>;
export type EnemyPatternHandler = (enemy: GameObject, params?: EnemyPatternParams) => void;

const enemyPatternRegistry: Record<string, EnemyPatternHandler> = {};

export function registerEnemyPattern(name: string, handler: EnemyPatternHandler): void {
    enemyPatternRegistry[name] = handler;
}

export function fireEnemyPattern(enemy: GameObject, name: string, params?: EnemyPatternParams): void {
    const pattern = enemyPatternRegistry[name];
    if (pattern == null) {
        console.warn(`Enemy pattern not found: ${name}`);
        return;
    }
    pattern(enemy, params);
}

function registerDefaultEnemyPatterns(): void {
    registerEnemyPattern("fanAimed", (enemy, params) => {
        const count = Math.max(1, Math.floor((params?.count as number) ?? 5));
        const speed = Math.max(0, (params?.speed as number) ?? 180);
        const spreadDeg = (params?.spreadDeg as number) ?? 40;
        const radius = Math.max(1, (params?.radius as number) ?? 8);
        const aimAtPlayer = (params?.aimAtPlayer as boolean) ?? true;
        const directionDeg = (params?.directionDeg as number) ?? 90;

        const myPos = enemy.transform.position;
        let baseAngle = (directionDeg * Math.PI) / 180;

        if (aimAtPlayer && Game.player != null) {
            const playerPos = Game.player.transform.position;
            baseAngle = Math.atan2(playerPos.y - myPos.y, playerPos.x - myPos.x);
        }

        const spreadRad = (spreadDeg * Math.PI) / 180;
        const startOffset = -spreadRad / 2;
        const divider = Math.max(1, count - 1);

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + startOffset + (spreadRad / divider) * i;
            PoolManager.acquireBullet({
                position: new Vector2(myPos.x, myPos.y),
                speed,
                velocity: new Vector2(Math.cos(angle), Math.sin(angle)),
                radius,
                owner: BulletOwner.Enemy,
                emitter: enemy,
            });
        }
    });

    registerEnemyPattern("radial", (enemy, params) => {
        const count = Math.max(1, Math.floor((params?.count as number) ?? 8));
        const speed = Math.max(0, (params?.speed as number) ?? 150);
        const radius = Math.max(1, (params?.radius as number) ?? 8);
        const startDeg = (params?.startDeg as number) ?? 0;
        const myPos = enemy.transform.position;

        for (let i = 0; i < count; i++) {
            const angle = ((startDeg + (360 / count) * i) * Math.PI) / 180;
            PoolManager.acquireBullet({
                position: new Vector2(myPos.x, myPos.y),
                speed,
                velocity: new Vector2(Math.cos(angle), Math.sin(angle)),
                radius,
                owner: BulletOwner.Enemy,
                emitter: enemy,
            });
        }
    });
}

registerDefaultEnemyPatterns();
