import { GameObject } from "./lib/gameObject";
import { Scene } from "./lib/scene";

export class SceneManager{
    static currentScene: Scene | null = null

    static loadScene(scene: Scene) {
      this.currentScene = scene
    }
  
    static update(delta: number) {
      this.currentScene?.update(delta)
    }
  
    static draw(ctx: CanvasRenderingContext2D) {
      this.currentScene?.render(ctx)
    }

    static addToCurrentScene(obj: GameObject) {
        this.currentScene?.addObject(obj)
    }
}