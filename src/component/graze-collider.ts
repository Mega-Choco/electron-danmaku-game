import { Game } from "../game";
import { Collision } from "../lib/collision";
import { CircleCollider } from "./circle-colider";

export class GrazeColider extends CircleCollider{
    constructor(radius: number){
        super(radius);
        this.tag = "graze";
    }

    override doCollide(target: Collision): void {
        Game.incareseGraze();
    }
    
}