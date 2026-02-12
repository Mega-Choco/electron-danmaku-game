import { Enemy, EnemyConfig } from "../actor/enemy";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";
import { WaveActionResult, WaveDefinition, WaveEvent } from "./wave-timeline";

export function wave(name: string, startAt: number, ...events: WaveEvent[]): WaveDefinition {
    return {
        name,
        startAt: Math.max(0, startAt),
        events,
    };
}

export function at(seconds: number, action: () => WaveActionResult): WaveEvent {
    return {
        at: Math.max(0, seconds),
        action,
    };
}

export function spawnEnemy(position: Vector2, config: EnemyConfig = {}): () => GameObject {
    const spawnPos = new Vector2(position.x, position.y);
    return () => {
        return GameObject.instantiate(new Enemy(new Vector2(spawnPos.x, spawnPos.y), config));
    };
}

export function spawnEnemyAt(seconds: number, position: Vector2, config: EnemyConfig = {}): WaveEvent {
    return at(seconds, spawnEnemy(position, config));
}
