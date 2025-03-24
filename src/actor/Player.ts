import { GameObject } from "../lib/game-object";
import { Controller } from "../component/controller";
import { Rectangle } from "../component/rectangle";

export class Player extends GameObject{
    constructor(){
        super('플레이어');
        this.addComponent(new Controller(150));
        this.addComponent(new Rectangle(50, 50,'red'));
        console.log("player created!");
    }
}