import { Player } from "../actor/player";
import { GameObject } from "../lib/gameObject";
import { Scene } from "../lib/scene";

export class BasicScene extends Scene{
    
    constructor(){
        super();
        const player = new Player();

        this.addObject(player);
    }
}