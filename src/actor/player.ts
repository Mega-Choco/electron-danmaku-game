import { GameObject } from "../lib/game-object";
import { Controller } from "../component/controller";
import { Image } from "../component/image";
import { Circle } from "../component/circle";

export class Player extends GameObject{
    constructor(){
        super('플레이어');
        this.addComponent(new Controller(300));
        this.addComponent(new Image("/images/minimi-xion.png"));
        this.addComponent(new Circle(10,'red'));
        
        console.log("player created!");
    }
}