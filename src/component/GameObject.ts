import { Vector2 } from "../lib/vector2"
import { Transform } from "./Transform"

export class GameObject{
    name: string = 'unkown'
    transform: Transform = new Transform()

    constructor(name: string, position: Vector2 = new Vector2()){
        this.name = name;
        this.transform.position = position
    }

}