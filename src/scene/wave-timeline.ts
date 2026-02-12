import { GameObject } from "../lib/game-object";
import { Health } from "../component/health";

export type WaveActionResult = void | GameObject | GameObject[];

export interface WaveClearContext {
    wave: WaveDefinition;
    elapsed: number;
    eventsDone: boolean;
    activeWaveEnemies: ReadonlySet<GameObject>;
}

export type WaveClearPolicy =
    | { type: "allExited" }
    | { type: "allDead" }
    | { type: "timer"; seconds: number }
    | { type: "custom"; evaluator: (context: WaveClearContext) => boolean };

export interface WaveEvent {
    at: number;
    action: () => WaveActionResult;
}

export interface WaveDefinition {
    name: string;
    startAt: number;
    events: WaveEvent[];
    clearPolicy?: WaveClearPolicy;
}

export class WaveTimeline {
    private waves: WaveDefinition[] = [];
    private currentWaveIndex = 0;
    private currentWaveElapsed = 0;
    private currentWaveEventCursor = 0;
    private waitBeforeWaveStart = 0;
    private activeWaveEnemies = new Set<GameObject>();
    private finished = true;

    constructor(waves: WaveDefinition[] = []) {
        this.setWaves(waves);
    }

    setWaves(waves: WaveDefinition[]): void {
        this.waves = waves.map((wave) => ({
            ...wave,
            startAt: Math.max(0, wave.startAt),
            events: [...wave.events].sort((a, b) => a.at - b.at),
            clearPolicy: wave.clearPolicy ?? { type: "allExited" },
        }));
        this.reset();
    }

    update(delta: number): void {
        if (this.finished || this.waves.length === 0) {
            return;
        }

        let timeLeft = Math.max(0, delta);

        if (this.waitBeforeWaveStart > 0) {
            this.waitBeforeWaveStart -= timeLeft;
            if (this.waitBeforeWaveStart > 0) {
                return;
            }
            timeLeft = Math.abs(this.waitBeforeWaveStart);
            this.waitBeforeWaveStart = 0;
        }

        const currentWave = this.waves[this.currentWaveIndex];
        this.currentWaveElapsed += timeLeft;

        while (this.currentWaveEventCursor < currentWave.events.length) {
            const waveEvent = currentWave.events[this.currentWaveEventCursor];
            if (waveEvent.at > this.currentWaveElapsed) {
                break;
            }
            const result = waveEvent.action();
            this.registerWaveActionResult(result);
            this.currentWaveEventCursor++;
        }

        if (this.isCurrentWaveCleared()) {
            this.advanceWave();
        }
    }

    reset(): void {
        this.currentWaveIndex = 0;
        this.currentWaveElapsed = 0;
        this.currentWaveEventCursor = 0;
        this.activeWaveEnemies.clear();
        this.finished = this.waves.length === 0;
        this.waitBeforeWaveStart = this.finished ? 0 : this.waves[0].startAt;
    }

    isFinished(): boolean {
        return this.finished;
    }

    getElapsed(): number {
        return this.currentWaveElapsed;
    }

    private registerWaveActionResult(result: WaveActionResult): void {
        if (result == null) {
            return;
        }
        if (Array.isArray(result)) {
            for (const gameObject of result) {
                this.activeWaveEnemies.add(gameObject);
            }
            return;
        }
        this.activeWaveEnemies.add(result);
    }

    private isCurrentWaveCleared(): boolean {
        const currentWave = this.waves[this.currentWaveIndex];
        const eventsDone = this.currentWaveEventCursor >= currentWave.events.length;
        if (!eventsDone) {
            return false;
        }

        const clearPolicy = currentWave.clearPolicy ?? { type: "allExited" };
        if (clearPolicy.type === "timer") {
            return this.currentWaveElapsed >= Math.max(0, clearPolicy.seconds);
        }

        if (clearPolicy.type === "custom") {
            return clearPolicy.evaluator({
                wave: currentWave,
                elapsed: this.currentWaveElapsed,
                eventsDone,
                activeWaveEnemies: this.activeWaveEnemies,
            });
        }

        if (clearPolicy.type === "allDead") {
            for (const enemy of this.activeWaveEnemies) {
                if (!this.isObjectDead(enemy)) {
                    return false;
                }
            }
            return true;
        }

        for (const enemy of this.activeWaveEnemies) {
            if (enemy.enabled) {
                return false;
            }
        }
        return true;
    }

    private isObjectDead(object: GameObject): boolean {
        const health = object.getComponent(Health);
        if (health != null) {
            return health.isDead();
        }
        return !object.enabled;
    }

    private advanceWave(): void {
        this.currentWaveIndex++;
        this.currentWaveElapsed = 0;
        this.currentWaveEventCursor = 0;
        this.activeWaveEnemies.clear();

        if (this.currentWaveIndex >= this.waves.length) {
            this.finished = true;
            this.waitBeforeWaveStart = 0;
            return;
        }

        this.waitBeforeWaveStart = this.waves[this.currentWaveIndex].startAt;
    }
}
