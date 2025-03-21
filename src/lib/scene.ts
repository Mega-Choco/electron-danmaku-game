import { GameObject } from "./gameObject";

export abstract class Scene{
    gameObjects: GameObject[] = []

    update(delta: number) {
    
      for (const obj of this.gameObjects) {
        obj.update?.(delta)
      }
    }
  
    render(ctx: CanvasRenderingContext2D) {
      for (const obj of this.gameObjects) {
        obj.draw?.(ctx)
      }
    }

    addObject(obj: GameObject) {
        this.gameObjects.push(obj)
      }
    
}