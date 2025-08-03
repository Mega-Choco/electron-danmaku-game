import { Bullet } from "../actor/bullet";
import { Game } from "../game";
import { Collider } from "../lib/collider";

import { CircleCollider } from "./circle-colider";
export class GrazeCollider extends CircleCollider {  // 철자 수정
    constructor(radius: number, debug: boolean = false, debugStyle: string = 'blue') {
        super(radius, debug, debugStyle);
        this.tag = "graze";
        console.log(`collision enabled: ${this.enabled}`);
    }

    override doCollisionEnter(target: Collider): void {
        if(target.gameObject instanceof Bullet){
            if(target.gameObject.isGrazed)
                return;

            Game.increaseGraze();
            target.gameObject.isGrazed = true;
        }
    }
}