import { Player } from "../actor/player";
import { fire, moveTo, playSe, repeat, script, wait } from "../component/enemy-behavior-builder";
import { GameObject } from "../lib/game-object";
import { Scene } from "../lib/scene";
import { Vector2 } from "../lib/vector2";
import { spawnEnemyAt, wave } from "./wave-builder";
import { WaveTimeline } from "./wave-timeline";

export class BasicScene extends Scene{
    
    constructor(){
        super();
        GameObject.instantiate(new Player(new Vector2(300, 500)));

        const zakoLeftBehavior = script(
            moveTo(220, 120, 1.0),
            repeat(
                9999,
                fire("fanAimed", { count: 5, spreadDeg: 42, speed: 180, radius: 7, aimAtPlayer: true }),
                wait(0.35)
            )
        );

        const zakoRightBehavior = script(
            moveTo(420, 140, 0.8),
            wait(0.2),
            repeat(
                9999,
                fire("radial", { count: 10, speed: 140, radius: 6, startDeg: 12 }),
                wait(0.75),
                playSe("se_tan00.wav", 0.5),
                fire("fanAimed", { count: 3, spreadDeg: 24, speed: 230, radius: 7, aimAtPlayer: true }),
                wait(0.25)
            )
        );

        const wave1 = wave(
            "wave-1",
            0.5,
            spawnEnemyAt(0.0, new Vector2(220, -40), {
                maxHealth: 18,
                hitboxRadius: 13,
                color: "#cf3e3e",
                behavior: zakoLeftBehavior,
            }),
            spawnEnemyAt(0.8, new Vector2(420, -40), {
                maxHealth: 14,
                hitboxRadius: 12,
                color: "#8f2ad3",
                behavior: zakoRightBehavior,
            })
        );

        const wave2 = wave(
            "wave-2",
            1.0,
            spawnEnemyAt(0.5, new Vector2(300, -30), {
                maxHealth: 16,
                hitboxRadius: 12,
                color: "#d13e3e",
                behavior: zakoRightBehavior,
            }),
            spawnEnemyAt(1.0, new Vector2(460, -30), {
                maxHealth: 12,
                hitboxRadius: 11,
                color: "#2f7bd1",
                behavior: zakoRightBehavior,
            })
        );

        this.setWaveTimeline(new WaveTimeline([wave1, wave2]));
    }
}
