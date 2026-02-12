import { EnemyPatternParams } from "./pattern/pattern-registry";

export interface PlaySeConfig {
    path: string;
    volume?: number;
}

export type EnemyBehaviorCommand =
    | { kind: "wait"; seconds: number }
    | { kind: "fire"; pattern: string; params?: EnemyPatternParams }
    | { kind: "playSe"; se: PlaySeConfig }
    | { kind: "moveTo"; x: number; y: number; seconds: number }
    | { kind: "moveBy"; dx: number; dy: number; seconds: number }
    | { kind: "repeat"; count: number; commands: EnemyBehaviorCommand[] };

export type EnemyBehaviorScript = EnemyBehaviorCommand[];

export function script(...commands: EnemyBehaviorCommand[]): EnemyBehaviorScript {
    return commands;
}

export function wait(seconds: number): EnemyBehaviorCommand {
    return { kind: "wait", seconds };
}

export function fire(pattern: string, params?: EnemyPatternParams): EnemyBehaviorCommand {
    return { kind: "fire", pattern, params };
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

export function repeat(count: number, ...commands: EnemyBehaviorCommand[]): EnemyBehaviorCommand {
    return { kind: "repeat", count, commands };
}
