import { GameObject } from "../lib/game-object";
import { Controller } from "../component/controller";
import { SpriteAnimation } from "../component/sprite-animation";
import { Vector2 } from "../lib/vector2";
import { CircleCollider } from "../component/circle-colider";
import { Game } from "../game";
import { GrazeColider } from "../component/graze-collider";

export class Player extends GameObject{
    constructor(position: Vector2){
        super('Player', position);
        this.addComponent(new Controller(300));
        this.addComponent(new SpriteAnimation(
            '/animation/reimu.json',
            '/images/reimu_sprite.png'
        ))
    
        this.addComponent(new CircleCollider(5));
        this.addComponent(new GrazeColider(30, true, 'rgba(0,0,255,0.5)'));

        console.log('player created!');

        // register player on game.
        Game.setPlayer(this);
    }
}