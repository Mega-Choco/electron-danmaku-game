import { Player } from "../actor/player";
import { fire, moveTo, playSe, repeat, script, wait } from "../component/enemy-behavior-builder";
import { GameObject } from "../lib/game-object";
import { Scene } from "../lib/scene";
import { Vector2 } from "../lib/vector2";
import { spawnEnemyAt, wave } from "./wave-builder";
import { WaveTimeline } from "./wave-timeline";

export class BasicScene extends Scene {
    constructor() {
        super();
        GameObject.instantiate(new Player(new Vector2(300, 500)));

        const debugWave1 = wave(
            "debug-wave-typhoon",
            0.2,
            { clearPolicy: { type: "allDead" } },
            spawnEnemyAt(0, new Vector2(300, -60), {
                maxHealth: 420,
                hitboxRadius: 16,
                color: "#bf4b4b",
                autoDespawnOutOfBounds: false,
                behavior: script(
                    moveTo(300, 135, 0.9),
                    wait(0.25),
                    repeat(
                        9999,
                        
                        repeat(
                            25,
                            playSe("se_tan00.wav", 0.1),
                            fire("spiral", {
                                count: 12,
                                speed: 150,
                                speedStep: 0,
                                radius: 8,
                                turnRateDeg: 6,
                                phaseStepDeg: 12,
                                reverse: false,
                            }),
                            wait(0.15)
                        ),
                        wait(0.1),
                        repeat(
                            3,
                            playSe("se_tan00.wav",0.1),
                            fire("radial", {
                            count: 30,
                            speed: 120,
                            radius: 15,
                            startDeg: 0,
                        }),
                        wait(0.3),
                        ),
                        wait(0.1)
                        
                    )
                ),
            })
        );

        this.setWaveTimeline(new WaveTimeline([debugWave1]));
    }
}
