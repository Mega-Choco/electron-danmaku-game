import { Circle } from "../component/circle";
import { EmenyController } from "../component/enemy-controller";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

export class Enemy extends GameObject{
    constructor(position: Vector2){
        super("enemy", position);
        this.addComponent(new Circle(15,"red"));
        this.addComponent(new EmenyController(.2,50));
    }
}