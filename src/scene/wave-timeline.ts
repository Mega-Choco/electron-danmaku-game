import { GameObject } from "../lib/game-object";

export type WaveActionResult = void | GameObject | GameObject[];

export interface WaveEvent {
    at: number;
    action: () => WaveActionResult;
}

export interface WaveDefinition {
    name: string;
    startAt: number;
    events: WaveEvent[];
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
        if (this.currentWaveEventCursor < currentWave.events.length) {
            return false;
        }

        for (const enemy of this.activeWaveEnemies) {
            if (enemy.enabled) {
                return false;
            }
        }
        return true;
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
