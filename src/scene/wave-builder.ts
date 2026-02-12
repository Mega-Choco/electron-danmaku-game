import { Enemy, EnemyConfig } from "../actor/enemy";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";
import { FormationGroupConfig, FormationRuntime } from "../manager/formation-runtime";
import { WaveActionResult, WaveClearPolicy, WaveDefinition, WaveEvent } from "./wave-timeline";

export interface WaveBuildOptions {
    clearPolicy?: WaveClearPolicy;
}

function isWaveEvent(item: WaveEvent | WaveBuildOptions): item is WaveEvent {
    return typeof (item as WaveEvent).at === "number" && typeof (item as WaveEvent).action === "function";
}

export function wave(name: string, startAt: number, ...items: Array<WaveEvent | WaveBuildOptions>): WaveDefinition {
    const options: WaveBuildOptions = {};
    const events: WaveEvent[] = [];

    for (const item of items) {
        if (isWaveEvent(item)) {
            events.push(item);
            continue;
        }
        Object.assign(options, item);
    }

    return {
        name,
        startAt: Math.max(0, startAt),
        events,
        clearPolicy: options.clearPolicy ?? { type: "allExited" },
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

export interface FormationSpawnConfig {
    origin: Vector2;
    slotOffsets: Vector2[];
    enemyConfigs?: EnemyConfig[] | ((index: number) => EnemyConfig);
    anchorPath?: FormationGroupConfig["anchorPath"];
    duration?: number;
    endSignal?: string;
}

export function spawnFormation(config: FormationSpawnConfig): () => GameObject[] {
    const origin = new Vector2(config.origin.x, config.origin.y);
    const slotOffsets = config.slotOffsets.map((slot) => new Vector2(slot.x, slot.y));
    const enemyConfigs = config.enemyConfigs;

    return () => {
        const members: GameObject[] = [];

        for (let i = 0; i < slotOffsets.length; i++) {
            const slot = slotOffsets[i];
            const enemyConfig =
                typeof enemyConfigs === "function"
                    ? enemyConfigs(i)
                    : enemyConfigs != null
                    ? (enemyConfigs[i] ?? {})
                    : {};

            const spawnPosition = new Vector2(origin.x + slot.x, origin.y + slot.y);
            const enemy = new Enemy(spawnPosition, enemyConfig);
            members.push(GameObject.instantiate(enemy));
        }

        FormationRuntime.addGroup({
            members,
            origin,
            slotOffsets,
            anchorPath: config.anchorPath,
            duration: config.duration,
            endSignal: config.endSignal,
        });

        return members;
    };
}

export function spawnFormationAt(seconds: number, config: FormationSpawnConfig): WaveEvent {
    return at(seconds, spawnFormation(config));
}
