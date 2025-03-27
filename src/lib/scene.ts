import { GameObject } from "./game-object";

export abstract class Scene{
    gameObjects: GameObject[] = []

    update(delta: number) {
      // update logic
      for (const obj of this.gameObjects) {
        obj.update?.(delta)
      }

      // check collision
      
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