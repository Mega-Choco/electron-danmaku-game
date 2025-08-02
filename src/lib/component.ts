import { GameObject } from "./game-object"

export abstract class Component{
    private static lastComponentId = 0;
    private componentId: number;
    constructor(){
        this.componentId = Component.lastComponentId++;
    }
    enabled: boolean = true;
    gameObject!: GameObject
    async init?(): Promise<void>
    update?(delta: number): void
    draw?(context: CanvasRenderingContext2D): void
    getComponentId(): number{
        return this.componentId;
    }
}