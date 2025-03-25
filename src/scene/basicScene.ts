import { Player } from "../actor/player";
import { GameObject } from "../lib/game-object";
import { Scene } from "../lib/scene";
import { Vector2 } from "../lib/vector2";

export class BasicScene extends Scene{
    
    constructor(){
        super();
        GameObject.instantiate(new Player(new Vector2(100, 100)));
    }
}