import { Circle } from "../component/circle";
import { EnemyAutoDespawn } from "../component/enemy-auto-despawn";
import { EnemyBehavior } from "../component/enemy-behavior";
import { EnemyBehaviorScript } from "../component/enemy-behavior-builder";
import { EnemyHitCollider } from "../component/enemy-hit-collider";
import { EmenyController } from "../component/enemy-controller";
import { Health } from "../component/health";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";
import { AssetManager } from "../manager/asset-manager";
import { PoolManager } from "../manager/pool-manager";

const ENEMY_DEATH_SE_PATH = "/assets/sounds/se/se_enep00.wav";

export interface EnemyConfig {
    maxHealth?: number;
    hitboxRadius?: number;
    color?: string;
    behavior?: EnemyBehaviorScript;
    autoDespawnOutOfBounds?: boolean;
}

export class Enemy extends GameObject{
    constructor(position: Vector2, config: EnemyConfig = {}){
        super("enemy", position);
        const maxHealth = config.maxHealth ?? 20;
        const hitboxRadius = config.hitboxRadius ?? 15;
        const color = config.color ?? "red";

        this.addComponent(new Circle(hitboxRadius, color));
        const health = new Health(maxHealth);
        health.setOnDeath(() => {
            void AssetManager.playSound(ENEMY_DEATH_SE_PATH, 0.6);
            this.recallOwnBullets();
        });
        this.addComponent(health);
        this.addComponent(new EnemyHitCollider(hitboxRadius));
        if (config.autoDespawnOutOfBounds ?? true) {
            this.addComponent(new EnemyAutoDespawn());
        }

        if (config.behavior != null) {
            this.addComponent(new EnemyBehavior(config.behavior));
        } else {
            this.addComponent(new EmenyController(.5,10));
        }
    }

    recallOwnBullets(): number {
        return PoolManager.recallBulletsByEmitter(this);
    }
}
