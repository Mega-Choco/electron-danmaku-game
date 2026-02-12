import { BulletOwner } from "../actor/bullet";
import { Component } from "../lib/component";
import { Vector2 } from "../lib/vector2";
import { AssetManager } from "../manager/asset-manager";
import { InputKey, InputManager } from "../manager/input-manager";
import { PoolManager } from "../manager/pool-manager";

const PLAYER_SHOT_SE_PATH = "/assets/sounds/se/se_plst00.wav";

export class PlayerShooter extends Component {
    fireInterval: number;
    bulletSpeed: number;
    bulletRadius: number;
    spawnOffsetY: number;

    private cooldown: number = 0;

    constructor(fireInterval: number, bulletSpeed: number, bulletRadius: number, spawnOffsetY: number) {
        super();
        this.fireInterval = fireInterval;
        this.bulletSpeed = bulletSpeed;
        this.bulletRadius = bulletRadius;
        this.spawnOffsetY = spawnOffsetY;
    }

    update(delta: number): void {
        this.cooldown = Math.max(0, this.cooldown - delta);

        if (!InputManager.geyKey(InputKey.Shot)) {
            return;
        }

        if (this.fireInterval <= 0) {
            this.fire();
            this.cooldown = 0;
            return;
        }

        while (this.cooldown <= 0) {
            this.fire();
            this.cooldown += this.fireInterval;
        }
    }

    private fire(): void {
        const position = this.gameObject.transform.position;
        PoolManager.acquireBullet({
            position: new Vector2(position.x, position.y - this.spawnOffsetY),
            speed: this.bulletSpeed,
            velocity: new Vector2(0, -1),
            radius: this.bulletRadius,
            owner: BulletOwner.Player,
        });
        void AssetManager.playSound(PLAYER_SHOT_SE_PATH, 0.35);
    }
}
