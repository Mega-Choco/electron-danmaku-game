import { Player } from "../actor/player";
import { despawn, fire, moveBy, moveTo, playSe, repeat, script, wait } from "../component/enemy-behavior-builder";
import { GameObject } from "../lib/game-object";
import { Scene } from "../lib/scene";
import { Vector2 } from "../lib/vector2";
import { formationPath } from "./formation-path-builder";
import { spawnEnemyAt, spawnFormationAt, wave } from "./wave-builder";
import { WaveTimeline } from "./wave-timeline";

export class BasicScene extends Scene{
    
    constructor(){
        super();
        const playerSpawnPosition = new Vector2(300, 500);
        GameObject.instantiate(new Player(new Vector2(playerSpawnPosition.x, playerSpawnPosition.y)));
        const formationOrigin = new Vector2(220, -60);

        const zakoLeftBehavior = script(
            moveTo(220, 120, 1.0),
            repeat(
                4,
                fire("fanAimed", { count: 5, spreadDeg: 42, speed: 180, radius: 7, aimAtPlayer: true }),
                wait(0.35)
            ),
            moveBy(-70, -220, 1.1),
            despawn()
        );

        const zakoRightBehavior = script(
            moveTo(420, 140, 0.8),
            wait(0.2),
            repeat(
                4,
                fire("radial", { count: 10, speed: 140, radius: 6, startDeg: 12 }),
                wait(0.75),
                playSe("se_tan00.wav", 0.5),
                fire("fanAimed", { count: 3, spreadDeg: 24, speed: 230, radius: 7, aimAtPlayer: true }),
                wait(0.25)
            ),
            moveBy(70, -220, 1.0),
            despawn()
        );

        const wave1Path = formationPath()
            .lineBy(0, 300, 2, "easeIn");

        const formationStartDelay = 0.45;
        const formationBurstCount = 4;
        const formationBurstInterval = 0.35;
        const formationDuration = wave1Path.getDuration();
        const formationPhaseDuration = formationStartDelay + formationBurstCount * formationBurstInterval;
        const postFormationDelay = Math.max(0, formationDuration - formationPhaseDuration);

        const wave1 = wave(
            "wave-1",
            0.5,
            spawnFormationAt(0.0, {
                origin: formationOrigin,
                slotOffsets: [new Vector2(-96, 0), new Vector2(-32, 0), new Vector2(32, 0), new Vector2(96, 0)],
                enemyConfigs: (index) => {
                    const sideDirection = index < 2 ? -1 : 1;
                    const fanSpread = index % 2 === 0 ? 20 : 34;
                    const radialStartDeg = index * 18;

                    return {
                        maxHealth: 10 + index * 2,
                        hitboxRadius: 11,
                        color: index % 2 === 0 ? "#d84d4d" : "#3f7fd1",
                        behavior: script(
                            // Formation-active phase
                            wait(formationStartDelay),
                            repeat(
                                formationBurstCount,
                                fire("fanAimed", {
                                    count: 4,
                                    spreadDeg: 26,
                                    speed: 185,
                                    radius: 6,
                                    aimAtPlayer: true,
                                }),
                                wait(formationBurstInterval)
                            ),
                            // Wait until formation path control is released
                            wait(postFormationDelay),
                            // Autonomous phase (independent movement + independent pattern)
                            moveBy(sideDirection * 90, 55, 0.8),
                            repeat(
                                3,
                                fire("fanAimed", {
                                    count: 3,
                                    spreadDeg: fanSpread,
                                    speed: 230,
                                    radius: 6,
                                    aimAtPlayer: true,
                                }),
                                wait(0.25),
                                fire("radial", {
                                    count: 6,
                                    speed: 145,
                                    radius: 6,
                                    startDeg: radialStartDeg,
                                }),
                                wait(0.45)
                            ),
                            moveBy(sideDirection * 220, 500, 1.7)
                        ),
                    };
                },
                duration: wave1Path.getDuration(),
                anchorPath: wave1Path.build(),
            })
        );

        const wave2 = wave(
            "wave-2",
            0.9,
            spawnEnemyAt(0.5, new Vector2(300, -30), {
                maxHealth: 16,
                hitboxRadius: 12,
                color: "#d13e3e",
                behavior: zakoLeftBehavior,
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
