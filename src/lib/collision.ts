import { Component } from "./component";
import { GameObject } from "./game-object";

export abstract class Collision extends Component{
    abstract checkCollision(target: Collision): boolean
    abstract doCollide(target: Collision): void
}