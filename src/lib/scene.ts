import { GameObject } from "./game-object";
import { WaveTimeline } from "../scene/wave-timeline";

export abstract class Scene{
    gameObjects: GameObject[] = []
    private waveTimeline: WaveTimeline | null = null;

    update(delta: number) {
      this.waveTimeline?.update(delta);

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

    setWaveTimeline(timeline: WaveTimeline) {
      this.waveTimeline = timeline;
    }
    
}
