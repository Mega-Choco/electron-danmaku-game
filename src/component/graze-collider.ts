import { Bullet, BulletOwner } from "../actor/bullet";
import { Game } from "../game";
import { Collider } from "../lib/collider";
import { AssetManager } from "../manager/asset-manager";

import { CircleCollider } from "./circle-colider";

const GRAZE_SE_PATH = "/assets/sounds/se/se_graze.wav";

export class GrazeCollider extends CircleCollider {  // 철자 수정
    constructor(radius: number, debug: boolean = false, debugStyle: string = 'blue') {
        super(radius, debug, debugStyle);
        this.tag = "graze";
        console.log(`collision enabled: ${this.enabled}`);
    }

    override doCollisionEnter(target: Collider): void {
        if(target.gameObject instanceof Bullet){
            if (target.gameObject.owner !== BulletOwner.Enemy) {
                return;
            }
            if(target.gameObject.isGrazed)
                return;

            Game.increaseGraze();
            target.gameObject.isGrazed = true;
            void AssetManager.playSound(GRAZE_SE_PATH, 0.5);
        }
    }
}
