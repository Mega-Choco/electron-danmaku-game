import { GameObject } from "../lib/game-object";
import { Controller } from "../component/controller";
import { Rectangle } from "../component/rectangle";
import { Image } from "../component/image";

export class Player extends GameObject{
    constructor(){
        super('플레이어');
        this.addComponent(new Controller(300));
        this.addComponent(new Rectangle(50, 50,'red'));
        this.addComponent(new Image("/images/minimi-xion.png"));
        
        console.log("player created!");
    }
}