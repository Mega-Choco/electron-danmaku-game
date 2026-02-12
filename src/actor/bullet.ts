import { Circle } from "../component/circle";
import { CircleCollider } from "../component/circle-colider";
import { Projectile } from "../component/projectile";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

export enum BulletOwner {
    Player = "player",
    Enemy = "enemy",
}

export class Bullet extends GameObject{
    isGrazed = false;
    owner: BulletOwner = BulletOwner.Enemy;

    private circleRenderer: Circle;
    private collision: CircleCollider;
    private projectile: Projectile;
    
    constructor(speed: number = 0, velocity: Vector2 = new Vector2(), radius: number = 10, owner: BulletOwner = BulletOwner.Enemy){
        super("bullet");
        this.circleRenderer = new Circle(radius, 'green');
        this.collision = new CircleCollider(radius);
        this.projectile = new Projectile(speed, velocity);

        this.addComponent(this.circleRenderer);
        this.addComponent(this.collision);
        this.addComponent(this.projectile);

        this.owner = owner;
    }

    configure(speed: number, velocity: Vector2, radius: number, owner: BulletOwner): void {
        this.projectile.speed = speed;
        this.projectile.velocity = velocity;
        this.circleRenderer.radius = radius;
        this.collision.radius = radius;
        this.owner = owner;
        this.isGrazed = false;
    }
}
