import { Player } from "./actor/player";
import { CircleCollider } from "./component/circle-colider";
import { GameObject } from "./lib/game-object";
import { AssetManager } from "./manager/asset-manager";
import { CollisionManager } from "./manager/collision-manager";
import { PoolManager } from "./manager/pool-manager";
import { SceneManager } from "./manager/sceneManager";
import UIManager from "./manager/ui-manager";
import { BasicScene } from "./scene/basicScene";
import { Setting } from "./setting";

export class Game{
  private static sceneManager = new SceneManager();
  private static collisionManager = new CollisionManager(100);
  private static uiManager = new UIManager();
  public static player:Player | null = null;
  
  private static graze: number = 0;
  private static hitCount: number = 0;
  private static currentFps: number = 0;
  private static poolsInitialized: boolean = false;

  static start(){
    this.resetGraze();
    this.resetHitCount();
    this.sceneManager.loadScene(new BasicScene());

    if (!this.poolsInitialized) {
      PoolManager.prewarmBulletPool(Setting.system.bulletPoolPrewarmCount);
      void AssetManager.preloadAudio([
        "/assets/sounds/se/se_graze.wav",
        "/assets/sounds/se/se_plst00.wav",
      ]);
      this.poolsInitialized = true;
    }
  }

  static update(delta: number){
    this.sceneManager.update(delta);
    this.collisionManager.update();
  }

  static draw(context: CanvasRenderingContext2D){
    this.sceneManager.draw(context);
    if (Setting.system.drawCollisionDebugGrid) {
      this.collisionManager.drawDebugLine(context);
    }
    this.uiManager.drawUI(context);
  }

  static async registerObject(object: GameObject){
    await this.sceneManager.addToCurrentScene(object);
    this.registerCollidersForObject(object);
  }

  static registerCollidersForObject(object: GameObject){
    const colliderComponents = object.getComponents(CircleCollider);
    for (const collider of colliderComponents) {
      this.collisionManager.addCollider(collider);
    }
  }

  static setPlayer(player: Player){
    this.player = player;
  }

  static increaseGraze(){
    this.graze++;
    console.log(`그레이즈>: ${this.graze}`);
  }
  static getGraze(){
    return this.graze;
  }
  static resetGraze(){
    this.graze = 0;
  }

  static increaseHitCount(){
    this.hitCount++;
  }
  static getHitCount(){
    return this.hitCount;
  }
  static resetHitCount(){
    this.hitCount = 0;
  }

  static setCurrentFps(fps: number){
    this.currentFps = fps;
  }

  static getCurrentFps(){
    return this.currentFps;
  }
}
