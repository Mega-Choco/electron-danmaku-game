import { Enemy } from "../actor/enemy";
import { Player } from "../actor/player";
import { GameObject } from "../lib/game-object";
import { Scene } from "../lib/scene";
import { Vector2 } from "../lib/vector2";

export class BasicScene extends Scene{
    
    constructor(){
        super();
        GameObject.instantiate(new Player(new Vector2(300, 500)));
        GameObject.instantiate(new Enemy(new Vector2(300, 100)))
    }
}