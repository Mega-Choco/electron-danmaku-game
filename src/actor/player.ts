import { GameObject } from "../lib/game-object";
import { PlayerController } from "../component/player-controller";
import { SpriteAnimation } from "../component/sprite-animation";
import { Vector2 } from "../lib/vector2";
import { Game } from "../game";
import { GrazeCollider } from "../component/graze-collider";
import { PlayerHitboxColider } from "../component/player-hit-colider";
import { PlayerShooter } from "../component/player-shooter";
import { Setting } from "../setting";

export class Player extends GameObject{
    constructor(position: Vector2){
        super('Player', position);
        this.addComponent(new PlayerController(300));
        this.addComponent(new PlayerShooter(
            Setting.system.playerShotInterval,
            Setting.system.playerShotSpeed,
            Setting.system.playerShotRadius,
            Setting.system.playerShotSpawnOffsetY
        ));
        this.addComponent(new SpriteAnimation(
            '/assets/animation/reimu.json',
            '/assets/images/reimu_sprite.png'
        ))
    
        this.addComponent(new PlayerHitboxColider(10, true, 'rgba(255,0,0,0.5)'));
        this.addComponent(new GrazeCollider(30, true, 'rgba(0,0,255,0.5)'));

        console.log('player created!');

        // register player on game.
        Game.setPlayer(this);
    }
}
