import { GameObject } from "../../lib/game-object";

export abstract class Pattern {
    abstract fire(enemy: GameObject): void;
}

