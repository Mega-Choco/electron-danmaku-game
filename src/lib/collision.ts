import { Component } from "./component";
import { GameObject } from "./game-object";

export abstract class Collision extends Component{
    tag: string | null = null;

    constructor(tag: string | null = null){
        super();
        this.tag = tag;
    }
    abstract checkCollision(target: Collision): boolean
    abstract doCollide(target: Collision): void
}