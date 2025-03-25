import { GameObject } from "../lib/game-object";
import { Controller } from "../component/controller";
import { Circle } from "../component/circle";
import { SpriteAnimation } from "../component/sprite-animation";
import { Vector2 } from "../lib/vector2";

export class Player extends GameObject{
    constructor(position: Vector2){
        super('플레이어', position);
        this.addComponent(new Controller(300));
        this.addComponent(new SpriteAnimation(
            '/animation/reimu.json',
            '/images/reimu_sprite.png'
        ))
        this.addComponent(new Circle(10,'red'));
        
        console.log("player created!");
    }
}