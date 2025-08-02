import { Component } from "./component";
import { GameObject } from "./game-object";

export abstract class Collider extends Component{
    tag: string | null = null;

    constructor(tag: string | null = null){
        super();
        this.tag = tag;
    }
    abstract checkCollision(target: Collider): boolean
    abstract doCollisionEnter(target: Collider): void
    abstract doCollisionStay(target: Collider): void
    abstract doCollisionExit(target: Collider): void


}