import { Player } from "./actor/player";
import { CircleCollider } from "./component/circle-colider";
import { GameObject } from "./lib/game-object";
import { CollisionManager } from "./manager/collision-manager";
import { SceneManager } from "./manager/sceneManager";
import { BasicScene } from "./scene/basicScene";

export class Game{
  private static sceneManager = new SceneManager();
  private static collisionManager = new CollisionManager(100);
  public static player:Player | null = null;
  public static environment: Environment;

  static start(){
    this.sceneManager.loadScene(new BasicScene());
  }

  static update(delta: number){
    this.sceneManager.update(delta);
    this.collisionManager.update();
  }

  static draw(context: CanvasRenderingContext2D){
    this.sceneManager.draw(context);
    this.collisionManager.drawDebugLine(context);
  }

  static async registerObject(object: GameObject){
    await this.sceneManager.addToCurrentScene(object);
    const collider = object.getComponent(CircleCollider);

    if(collider!=null){
      this.collisionManager.colliders.push(collider);
    }
  }

  static setPlayer(player: Player){
    this.player = player;
  }
}

class Environment{
  screenWidth: number = 0;
  screenHeight: number = 0;

  bulletDeadzone: number = 0;
}