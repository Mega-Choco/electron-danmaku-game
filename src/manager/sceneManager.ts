import { GameObject } from "../lib/game-object";
import { Scene } from "../lib/scene";

export class SceneManager{
    private currentScene: Scene | null = null

    loadScene(scene: Scene) {
      this.currentScene = scene
    }
  
    update(delta: number) {
      this.currentScene?.update(delta)
    }
  
    draw(ctx: CanvasRenderingContext2D) {
      this.currentScene?.render(ctx)
    }

    async addToCurrentScene(obj: GameObject) {
        await obj.init();
        this.currentScene?.addObject(obj)
    }
}