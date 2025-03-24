import { GameObject } from "./game-object"

export abstract class Component{
    gameObject!: GameObject
    update?(delta: number): void
    draw?(context: CanvasRenderingContext2D): void
}