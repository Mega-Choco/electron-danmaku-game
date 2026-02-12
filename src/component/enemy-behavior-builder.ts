import { EnemyPatternParams } from "./pattern/pattern-registry";

export interface PlaySeConfig {
    path: string;
    volume?: number;
}

export type EnemyBehaviorCommand =
    | { kind: "wait"; seconds: number }
    | { kind: "waitSignal"; signal: string }
    | { kind: "emitSignal"; signal: string }
    | { kind: "fire"; pattern: string; params?: EnemyPatternParams }
    | { kind: "recallBullets" }
    | { kind: "playSe"; se: PlaySeConfig }
    | { kind: "moveTo"; x: number; y: number; seconds: number }
    | { kind: "moveBy"; dx: number; dy: number; seconds: number }
    | {
          kind: "moveRandom";
          minX: number;
          maxX: number;
          minY: number;
          maxY: number;
          seconds: number;
          minDistanceFromCurrent?: number;
          maxAttempts?: number;
      }
    | { kind: "despawn" }
    | { kind: "repeat"; count: number; commands: EnemyBehaviorCommand[] };

export type EnemyBehaviorScript = EnemyBehaviorCommand[];

export function script(...commands: EnemyBehaviorCommand[]): EnemyBehaviorScript {
    return commands;
}

export function wait(seconds: number): EnemyBehaviorCommand {
    return { kind: "wait", seconds };
}

export function waitSignal(signal: string): EnemyBehaviorCommand {
    return { kind: "waitSignal", signal };
}

export function emitSignal(signal: string): EnemyBehaviorCommand {
    return { kind: "emitSignal", signal };
}

export function fire(pattern: string, params?: EnemyPatternParams): EnemyBehaviorCommand {
    return { kind: "fire", pattern, params };
}

export function recallBullets(): EnemyBehaviorCommand {
    return { kind: "recallBullets" };
}

export function playSe(path: string, volume?: number): EnemyBehaviorCommand {
    return {
        kind: "playSe",
        se: { path, volume },
    };
}

export function moveTo(x: number, y: number, seconds: number): EnemyBehaviorCommand {
    return { kind: "moveTo", x, y, seconds };
}

export function moveBy(dx: number, dy: number, seconds: number): EnemyBehaviorCommand {
    return { kind: "moveBy", dx, dy, seconds };
}

export function moveRandom(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    seconds: number,
    minDistanceFromCurrent?: number,
    maxAttempts?: number
): EnemyBehaviorCommand {
    return { kind: "moveRandom", minX, maxX, minY, maxY, seconds, minDistanceFromCurrent, maxAttempts };
}

export function despawn(): EnemyBehaviorCommand {
    return { kind: "despawn" };
}

export function repeat(count: number, ...commands: EnemyBehaviorCommand[]): EnemyBehaviorCommand {
    return { kind: "repeat", count, commands };
}
