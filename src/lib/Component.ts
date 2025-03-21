import { GameObject } from "./GameObject"

export abstract class Component{
    gameObject!: GameObject
    update?(delta: number): void
    draw?(context: CanvasRenderingContext2D): void
}