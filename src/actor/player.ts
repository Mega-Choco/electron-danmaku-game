import { GameObject } from "../lib/game-object";
import { Controller } from "../component/controller";
import { Circle } from "../component/circle";
import { SpriteAnimation } from "../component/sprite-animation";
import { Vector2 } from "../lib/vector2";
import { CircleCollider } from "../component/circle-colider";
import { Game } from "../game";

export class Player extends GameObject{
    constructor(position: Vector2){
        super('Player', position);
        this.addComponent(new Controller(300));
        this.addComponent(new SpriteAnimation(
            '/animation/reimu.json',
            '/images/reimu_sprite.png'
        ))
        //this.addComponent(new Circle(5,'blue'));
        this.addComponent(new CircleCollider(5));

        console.log('player created!');

        // register player on game.
        Game.setPlayer(this);
    }
}