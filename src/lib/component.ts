import { GameObject } from "./game-object"

export abstract class Component{
    enabled: boolean = true;
    gameObject!: GameObject
    async init?(): Promise<void>
    update?(delta: number): void
    draw?(context: CanvasRenderingContext2D): void
}