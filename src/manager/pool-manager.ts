import { Bullet, BulletOwner } from "../actor/bullet";
import { Game } from "../game";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

export interface BulletSpawnConfig {
    position: Vector2;
    speed: number;
    velocity: Vector2;
    radius: number;
    owner: BulletOwner;
}

export interface BulletPoolStats {
    total: number;
    active: number;
    inactive: number;
}

class BulletPool {
    private bullets: Bullet[] = [];
    private available: Bullet[] = [];
    private availableSet = new Set<Bullet>();

    prewarm(count: number): void {
        for (let i = 0; i < count; i++) {
            const bullet = this.createBullet();
            bullet.disable();
            this.available.push(bullet);
            this.availableSet.add(bullet);
        }
    }

    acquire(config: BulletSpawnConfig): Bullet {
        this.collectDisabledBullets();

        let bullet = this.available.pop();
        if (bullet != null) {
            this.availableSet.delete(bullet);
        } else {
            bullet = this.createBullet();
        }

        bullet.configure(config.speed, config.velocity, config.radius, config.owner);
        bullet.transform.position.x = config.position.x;
        bullet.transform.position.y = config.position.y;
        bullet.enable();
        Game.registerCollidersForObject(bullet);

        return bullet;
    }

    clear(): void {
        this.bullets = [];
        this.available = [];
        this.availableSet.clear();
    }

    getStats(): BulletPoolStats {
        let active = 0;
        for (const bullet of this.bullets) {
            if (bullet.enabled) {
                active++;
            }
        }

        return {
            total: this.bullets.length,
            active,
            inactive: this.bullets.length - active,
        };
    }

    private createBullet(): Bullet {
        const bullet = new Bullet();
        this.bullets.push(bullet);
        GameObject.instantiate(bullet);
        return bullet;
    }

    private collectDisabledBullets(): void {
        for (const bullet of this.bullets) {
            if (!bullet.enabled && !this.availableSet.has(bullet)) {
                this.available.push(bullet);
                this.availableSet.add(bullet);
            }
        }
    }
}

export class PoolManager {
    private static bulletPool = new BulletPool();

    static prewarmBulletPool(count: number): void {
        this.bulletPool.prewarm(Math.max(0, Math.floor(count)));
    }

    static acquireBullet(config: BulletSpawnConfig): Bullet {
        return this.bulletPool.acquire(config);
    }

    static getBulletPoolStats(): BulletPoolStats {
        return this.bulletPool.getStats();
    }

    static clear(): void {
        this.bulletPool.clear();
    }
}
