import { BulletOwner } from "../../actor/bullet";
import { Game } from "../../game";
import { GameObject } from "../../lib/game-object";
import { Vector2 } from "../../lib/vector2";
import { PoolManager } from "../../manager/pool-manager";

export type EnemyPatternParams = Record<string, number | boolean | string | undefined>;
export type EnemyPatternHandler = (enemy: GameObject, params?: EnemyPatternParams) => void;

const enemyPatternRegistry: Record<string, EnemyPatternHandler> = {};
const emitterSpiralAngleMap = new WeakMap<GameObject, number>();
const emitterRotatingRadialAngleMap = new WeakMap<GameObject, number>();
const emitterRotatingSquareAngleMap = new WeakMap<GameObject, number>();
const emitterCurvedBloomPhaseMap = new WeakMap<GameObject, number>();
const emitterSpiralPhaseMap = new WeakMap<GameObject, Map<string, number>>();

export function registerEnemyPattern(name: string, handler: EnemyPatternHandler): void {
    enemyPatternRegistry[name] = handler;
}

export function fireEnemyPattern(enemy: GameObject, name: string, params?: EnemyPatternParams): void {
    const pattern = enemyPatternRegistry[name];
    if (pattern == null) {
        console.warn(`Enemy pattern not found: ${name}`);
        return;
    }
    pattern(enemy, params);
}

interface EnemyBulletMotionConfig {
    acceleration?: number;
    turnRateDegPerSec?: number;
}

function spawnEnemyBullet(
    enemy: GameObject,
    angleRad: number,
    speed: number,
    radius: number,
    motion: EnemyBulletMotionConfig = {}
): void {
    const myPos = enemy.transform.position;
    PoolManager.acquireBullet({
        position: new Vector2(myPos.x, myPos.y),
        speed,
        velocity: new Vector2(Math.cos(angleRad), Math.sin(angleRad)),
        radius,
        owner: BulletOwner.Enemy,
        emitter: enemy,
        acceleration: motion.acceleration ?? 0,
        turnRateDegPerSec: motion.turnRateDegPerSec ?? 0,
    });
}

function getAimedAngle(enemy: GameObject, fallbackDirectionDeg: number): number {
    const myPos = enemy.transform.position;
    if (Game.player == null) {
        return (fallbackDirectionDeg * Math.PI) / 180;
    }

    const playerPos = Game.player.transform.position;
    return Math.atan2(playerPos.y - myPos.y, playerPos.x - myPos.x);
}

function getEmitterStreamPhase(
    store: WeakMap<GameObject, Map<string, number>>,
    enemy: GameObject,
    streamKey: string,
    startDeg: number
): number {
    let streamMap = store.get(enemy);
    if (streamMap == null) {
        streamMap = new Map<string, number>();
        store.set(enemy, streamMap);
    }

    const current = streamMap.get(streamKey);
    if (current == null) {
        streamMap.set(streamKey, startDeg);
        return startDeg;
    }
    return current;
}

function setEmitterStreamPhase(
    store: WeakMap<GameObject, Map<string, number>>,
    enemy: GameObject,
    streamKey: string,
    phaseDeg: number
): void {
    let streamMap = store.get(enemy);
    if (streamMap == null) {
        streamMap = new Map<string, number>();
        store.set(enemy, streamMap);
    }
    streamMap.set(streamKey, phaseDeg);
}

function registerDefaultEnemyPatterns(): void {
    registerEnemyPattern("fanAimed", (enemy, params) => {
        const count = Math.max(1, Math.floor((params?.count as number) ?? 5));
        const speed = Math.max(0, (params?.speed as number) ?? 180);
        const spreadDeg = (params?.spreadDeg as number) ?? 40;
        const radius = Math.max(1, (params?.radius as number) ?? 8);
        const aimAtPlayer = (params?.aimAtPlayer as boolean) ?? true;
        const directionDeg = (params?.directionDeg as number) ?? 90;

        let baseAngle = (directionDeg * Math.PI) / 180;

        if (aimAtPlayer) {
            baseAngle = getAimedAngle(enemy, directionDeg);
        }

        const spreadRad = (spreadDeg * Math.PI) / 180;
        const startOffset = -spreadRad / 2;
        const divider = Math.max(1, count - 1);

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + startOffset + (spreadRad / divider) * i;
            spawnEnemyBullet(enemy, angle, speed, radius);
        }
    });

    registerEnemyPattern("radial", (enemy, params) => {
        const count = Math.max(1, Math.floor((params?.count as number) ?? 8));
        const speed = Math.max(0, (params?.speed as number) ?? 150);
        const radius = Math.max(1, (params?.radius as number) ?? 8);
        const startDeg = (params?.startDeg as number) ?? 0;
        for (let i = 0; i < count; i++) {
            const angle = ((startDeg + (360 / count) * i) * Math.PI) / 180;
            spawnEnemyBullet(enemy, angle, speed, radius);
        }
    });

    registerEnemyPattern("nwayFixed", (enemy, params) => {
        const count = Math.max(1, Math.floor((params?.count as number) ?? 7));
        const speed = Math.max(0, (params?.speed as number) ?? 180);
        const spreadDeg = (params?.spreadDeg as number) ?? 55;
        const directionDeg = (params?.directionDeg as number) ?? 90;
        const radius = Math.max(1, (params?.radius as number) ?? 7);

        const baseAngle = (directionDeg * Math.PI) / 180;
        const spreadRad = (spreadDeg * Math.PI) / 180;
        const startOffset = -spreadRad / 2;
        const divider = Math.max(1, count - 1);

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + startOffset + (spreadRad / divider) * i;
            spawnEnemyBullet(enemy, angle, speed, radius);
        }
    });

    registerEnemyPattern("burstAimed", (enemy, params) => {
        const lanes = Math.max(1, Math.floor((params?.lanes as number) ?? 3));
        const layers = Math.max(1, Math.floor((params?.layers as number) ?? 3));
        const spreadDeg = (params?.spreadDeg as number) ?? 18;
        const speed = Math.max(0, (params?.speed as number) ?? 185);
        const speedStep = Math.max(0, (params?.speedStep as number) ?? 30);
        const radius = Math.max(1, (params?.radius as number) ?? 7);
        const fallbackDirectionDeg = (params?.directionDeg as number) ?? 90;

        const aimedAngle = getAimedAngle(enemy, fallbackDirectionDeg);
        const spreadRad = (spreadDeg * Math.PI) / 180;
        const startOffset = -spreadRad / 2;
        const divider = Math.max(1, lanes - 1);

        for (let layer = 0; layer < layers; layer++) {
            const layerSpeed = speed + speedStep * layer;
            for (let lane = 0; lane < lanes; lane++) {
                const angle = aimedAngle + startOffset + (spreadRad / divider) * lane;
                spawnEnemyBullet(enemy, angle, layerSpeed, radius);
            }
        }
    });

    registerEnemyPattern("spiralLegacy", (enemy, params) => {
        const bulletsPerStep = Math.max(1, Math.floor((params?.bulletsPerStep as number) ?? 2));
        const speed = Math.max(0, (params?.speed as number) ?? 170);
        const speedStep = Math.max(0, (params?.speedStep as number) ?? 0);
        const angleStepDeg = (params?.angleStepDeg as number) ?? 19;
        const laneSpreadDeg = (params?.laneSpreadDeg as number) ?? 20;
        const radius = Math.max(1, (params?.radius as number) ?? 6);
        const directionDeg = (params?.directionDeg as number) ?? 90;

        let baseDeg = emitterSpiralAngleMap.get(enemy);
        if (baseDeg == null) {
            baseDeg = directionDeg;
        }

        const laneSpreadRad = (laneSpreadDeg * Math.PI) / 180;
        const laneStart = -laneSpreadRad / 2;
        const laneDivider = Math.max(1, bulletsPerStep - 1);

        for (let i = 0; i < bulletsPerStep; i++) {
            const laneOffset = laneStart + (laneSpreadRad / laneDivider) * i;
            const angle = ((baseDeg * Math.PI) / 180) + laneOffset;
            const laneSpeed = speed + speedStep * i;
            spawnEnemyBullet(enemy, angle, laneSpeed, radius);
        }

        emitterSpiralAngleMap.set(enemy, baseDeg + angleStepDeg);
    });

    registerEnemyPattern("rotatingRadial", (enemy, params) => {
        const count = Math.max(1, Math.floor((params?.count as number) ?? 14));
        const speed = Math.max(0, (params?.speed as number) ?? 150);
        const radius = Math.max(1, (params?.radius as number) ?? 7);
        const stepDeg = (params?.stepDeg as number) ?? 11;
        const startDeg = (params?.startDeg as number) ?? 0;
        const reverse = (params?.reverse as boolean) ?? false;

        let baseDeg = emitterRotatingRadialAngleMap.get(enemy);
        if (baseDeg == null) {
            baseDeg = startDeg;
        }

        for (let i = 0; i < count; i++) {
            const angle = ((baseDeg + (360 / count) * i) * Math.PI) / 180;
            spawnEnemyBullet(enemy, angle, speed, radius);
        }

        const signedStep = reverse ? -Math.abs(stepDeg) : Math.abs(stepDeg);
        emitterRotatingRadialAngleMap.set(enemy, baseDeg + signedStep);
    });

    registerEnemyPattern("rotatingSquare", (enemy, params) => {
        const pointsPerEdge = Math.max(1, Math.floor((params?.pointsPerEdge as number) ?? 3));
        const speed = Math.max(0, (params?.speed as number) ?? 156);
        const radius = Math.max(1, (params?.radius as number) ?? 7);
        const stepDeg = (params?.stepDeg as number) ?? 9;
        const startDeg = (params?.startDeg as number) ?? 0;
        const scale = Math.max(0.25, (params?.scale as number) ?? 1);

        let baseDeg = emitterRotatingSquareAngleMap.get(enemy);
        if (baseDeg == null) {
            baseDeg = startDeg;
        }

        const rot = (baseDeg * Math.PI) / 180;
        const cosRot = Math.cos(rot);
        const sinRot = Math.sin(rot);

        for (let edge = 0; edge < 4; edge++) {
            for (let i = 0; i < pointsPerEdge; i++) {
                const t = pointsPerEdge <= 1 ? 0.5 : i / (pointsPerEdge - 1);

                let px = 0;
                let py = 0;
                if (edge === 0) {
                    px = -1 + 2 * t;
                    py = -1;
                } else if (edge === 1) {
                    px = 1;
                    py = -1 + 2 * t;
                } else if (edge === 2) {
                    px = 1 - 2 * t;
                    py = 1;
                } else {
                    px = -1;
                    py = 1 - 2 * t;
                }

                px *= scale;
                py *= scale;

                const rx = px * cosRot - py * sinRot;
                const ry = px * sinRot + py * cosRot;
                const angle = Math.atan2(ry, rx);
                spawnEnemyBullet(enemy, angle, speed, radius);
            }
        }

        emitterRotatingSquareAngleMap.set(enemy, baseDeg + stepDeg);
    });

    registerEnemyPattern("curvedBloom", (enemy, params) => {
        const count = Math.max(3, Math.floor((params?.count as number) ?? 28));
        const speed = Math.max(0, (params?.speed as number) ?? 165);
        const radius = Math.max(1, (params?.radius as number) ?? 6);
        const startDeg = (params?.startDeg as number) ?? 0;
        const phaseStepDeg = (params?.phaseStepDeg as number) ?? 15;
        const turnRateDeg = Math.max(0, (params?.turnRateDeg as number) ?? 95);
        const petalCount = Math.max(1, Math.floor((params?.petalCount as number) ?? 6));
        const acceleration = (params?.acceleration as number) ?? 0;

        let phaseDeg = emitterCurvedBloomPhaseMap.get(enemy);
        if (phaseDeg == null) {
            phaseDeg = startDeg;
        }

        const phaseRad = (phaseDeg * Math.PI) / 180;
        for (let i = 0; i < count; i++) {
            const normalized = i / count;
            const angle = ((phaseDeg + normalized * 360) * Math.PI) / 180;
            const curveWave = Math.sin(normalized * petalCount * Math.PI * 2 + phaseRad);
            const turnRateDegPerSec = curveWave * turnRateDeg;
            spawnEnemyBullet(enemy, angle, speed, radius, {
                acceleration,
                turnRateDegPerSec,
            });
        }

        emitterCurvedBloomPhaseMap.set(enemy, phaseDeg + phaseStepDeg);
    });

    registerEnemyPattern("spiral", (enemy, params) => {
        const count = Math.max(3, Math.floor((params?.count as number) ?? 12));
        const speed = Math.max(0, (params?.speed as number) ?? 170);
        const speedStep = (params?.speedStep as number) ?? 1.5;
        const radius = Math.max(1, (params?.radius as number) ?? 6);
        const startDeg = (params?.startDeg as number) ?? 0;
        const phaseStepDeg = Math.abs((params?.phaseStepDeg as number) ?? 9);
        const turnRateDeg = Math.max(0, (params?.turnRateDeg as number) ?? 30);
        const reverse = (params?.reverse as boolean) ?? false;
        const acceleration = (params?.acceleration as number) ?? 0;
        const streamIdParam = (params?.streamId as string | undefined) ?? "";
        const streamKey =
            streamIdParam.length > 0
                ? streamIdParam
                : `${count}:${speed}:${speedStep}:${radius}:${startDeg}:${phaseStepDeg}:${turnRateDeg}:${reverse ? "r" : "f"}`;
        const phaseDeg = getEmitterStreamPhase(emitterSpiralPhaseMap, enemy, streamKey, startDeg);

        const signedTurn = reverse ? -turnRateDeg : turnRateDeg;
        for (let i = 0; i < count; i++) {
            const angle = ((phaseDeg + (i * 360) / count) * Math.PI) / 180;
            const laneSpeed = Math.max(0, speed + speedStep * i);
            spawnEnemyBullet(enemy, angle, laneSpeed, radius, {
                acceleration,
                turnRateDegPerSec: signedTurn,
            });
        }

        const signedPhaseStep = reverse ? -phaseStepDeg : phaseStepDeg;
        setEmitterStreamPhase(emitterSpiralPhaseMap, enemy, streamKey, phaseDeg + signedPhaseStep);
    });

    registerEnemyPattern("curvedFanAimed", (enemy, params) => {
        const count = Math.max(1, Math.floor((params?.count as number) ?? 5));
        const speed = Math.max(0, (params?.speed as number) ?? 182);
        const spreadDeg = (params?.spreadDeg as number) ?? 36;
        const radius = Math.max(1, (params?.radius as number) ?? 7);
        const maxTurnRateDeg = Math.max(0, (params?.turnRateDeg as number) ?? 58);
        const aimAtPlayer = (params?.aimAtPlayer as boolean) ?? true;
        const directionDeg = (params?.directionDeg as number) ?? 90;
        const acceleration = (params?.acceleration as number) ?? 0;

        let baseAngle = (directionDeg * Math.PI) / 180;
        if (aimAtPlayer) {
            baseAngle = getAimedAngle(enemy, directionDeg);
        }

        const spreadRad = (spreadDeg * Math.PI) / 180;
        const startOffset = -spreadRad / 2;
        const divider = count > 1 ? count - 1 : 1;

        for (let i = 0; i < count; i++) {
            const lane01 = count === 1 ? 0.5 : i / divider;
            const turnRateDegPerSec = -maxTurnRateDeg + lane01 * (maxTurnRateDeg * 2);
            const angle = count === 1 ? baseAngle : baseAngle + startOffset + (spreadRad / divider) * i;

            spawnEnemyBullet(enemy, angle, speed, radius, {
                acceleration,
                turnRateDegPerSec,
            });
        }
    });
}

registerDefaultEnemyPatterns();
