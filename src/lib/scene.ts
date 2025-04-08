import { GameObject } from "./game-object";

export abstract class Scene{
    gameObjects: GameObject[] = []

    update(delta: number) {
      // update logic
      const enabledCount = this.gameObjects.filter((o)=> o.enabled == true).length;
      //console.log(`업데이트 대상 오브젝트 수: [${enabledCount}]`);
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