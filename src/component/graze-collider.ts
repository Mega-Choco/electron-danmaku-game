import { Game } from "../game";
import { Collision } from "../lib/collision";
import { CircleCollider } from "./circle-colider";

export class GrazeColider extends CircleCollider{
    constructor(radius: number, debug: boolean = false, debugStyle: string = 'blue'){
        super(radius, debug, debugStyle);
        this.tag = "graze";
    }

    override doCollide(target: Collision): void {
        Game.incareseGraze();
    }
}