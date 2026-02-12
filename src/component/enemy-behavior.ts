import { Component } from "../lib/component";
import { AssetManager } from "../manager/asset-manager";
import { SignalBus } from "../manager/signal-bus";
import { EnemyBehaviorCommand, EnemyBehaviorScript } from "./enemy-behavior-builder";
import { MotionController } from "./motion-controller";
import { fireEnemyPattern } from "./pattern/pattern-registry";

let enemyBehaviorRuntimeSeq = 0;

function nextEnemyBehaviorRuntimeId(): string {
    enemyBehaviorRuntimeSeq++;
    return `eb-${enemyBehaviorRuntimeSeq.toString(36)}`;
}

type FrameCommandState =
    | { type: "wait"; remaining: number }
    | { type: "move"; started: boolean };

interface RuntimeFrame {
    commands: EnemyBehaviorCommand[];
    index: number;
    repeatLeft: number;
    state: FrameCommandState | null;
}

type FireCommand = Extract<EnemyBehaviorCommand, { kind: "fire" }>;
type BulletRecallable = { recallOwnBullets: () => number };

export class EnemyBehavior extends Component {
    private root: EnemyBehaviorScript;
    private stack: RuntimeFrame[] = [];
    private runtimeId: string = nextEnemyBehaviorRuntimeId();
    private fireCommandSeq = 0;
    private fireStreamIds = new WeakMap<FireCommand, string>();

    constructor(root: EnemyBehaviorScript) {
        super();
        this.root = root;
    }

    async init(): Promise<void> {
        this.stack = [this.createFrame(this.root)];
    }

    update(delta: number): void {
        let timeBudget = Math.max(0, delta);
        let guard = 0;

        while (this.stack.length > 0 && guard < 128) {
            guard++;
            const frame = this.stack[this.stack.length - 1];

            if (frame.index >= frame.commands.length) {
                frame.repeatLeft--;
                if (frame.repeatLeft > 0) {
                    frame.index = 0;
                    frame.state = null;
                    continue;
                }
                this.stack.pop();
                continue;
            }

            const command = frame.commands[frame.index];

            if (command.kind === "emitSignal") {
                SignalBus.emit(command.signal);
                frame.index++;
                continue;
            }

            if (command.kind === "waitSignal") {
                if (SignalBus.isEmitted(command.signal)) {
                    frame.index++;
                    continue;
                }
                break;
            }

            if (command.kind === "fire") {
                fireEnemyPattern(this.gameObject, command.pattern, this.resolveFireParams(command));
                frame.index++;
                continue;
            }

            if (command.kind === "recallBullets") {
                this.recallOwnedBullets();
                frame.index++;
                continue;
            }

            if (command.kind === "playSe") {
                if (command.se.path.length > 0) {
                    const path = this.resolveSePath(command.se.path);
                    const volume = command.se.volume ?? 0.5;
                    void AssetManager.playSound(path, volume);
                }
                frame.index++;
                continue;
            }

            if (command.kind === "repeat") {
                frame.index++;
                const count = Math.max(0, Math.floor(command.count));
                if (count > 0 && command.commands.length > 0) {
                    this.stack.push(this.createFrame(command.commands, count));
                }
                continue;
            }

            if (command.kind === "despawn") {
                this.gameObject.disable();
                this.stack = [];
                return;
            }

            if (command.kind === "wait") {
                if (timeBudget <= 0) {
                    break;
                }
                const state = this.ensureWaitState(frame, command.seconds);
                const consumed = Math.min(state.remaining, timeBudget);
                state.remaining -= consumed;
                timeBudget -= consumed;
                if (state.remaining <= 0) {
                    frame.state = null;
                    frame.index++;
                    continue;
                }
                break;
            }

            if (command.kind === "moveTo" || command.kind === "moveBy" || command.kind === "moveRandom") {
                const state = this.ensureMoveState(frame, command);
                const motionController = this.gameObject.getComponent(MotionController);

                if (motionController == null) {
                    if (command.kind === "moveTo") {
                        this.gameObject.transform.position.x = command.x;
                        this.gameObject.transform.position.y = command.y;
                    } else if (command.kind === "moveBy") {
                        this.gameObject.transform.position.x += command.dx;
                        this.gameObject.transform.position.y += command.dy;
                    } else {
                        const next = this.pickRandomMovePoint(command);
                        this.gameObject.transform.position.x = next.x;
                        this.gameObject.transform.position.y = next.y;
                    }
                    frame.state = null;
                    frame.index++;
                    continue;
                }

                if (!state.started) {
                    if (command.kind === "moveTo") {
                        motionController.startMoveTo(command.x, command.y, command.seconds);
                    } else if (command.kind === "moveBy") {
                        motionController.startMoveBy(command.dx, command.dy, command.seconds);
                    } else {
                        const next = this.pickRandomMovePoint(command);
                        motionController.startMoveTo(next.x, next.y, command.seconds);
                    }
                    state.started = true;
                }

                if (!motionController.isMoving()) {
                    frame.state = null;
                    frame.index++;
                    continue;
                }

                break;
            }
        }
    }

    private createFrame(commands: EnemyBehaviorCommand[], repeatLeft: number = 1): RuntimeFrame {
        return {
            commands,
            index: 0,
            repeatLeft: Math.max(1, repeatLeft),
            state: null,
        };
    }

    private ensureWaitState(frame: RuntimeFrame, seconds: number): { type: "wait"; remaining: number } {
        if (frame.state != null && frame.state.type === "wait") {
            return frame.state;
        }
        const state: { type: "wait"; remaining: number } = {
            type: "wait",
            remaining: Math.max(0, seconds),
        };
        frame.state = state;
        return state;
    }

    private ensureMoveState(
        frame: RuntimeFrame,
        command: Extract<EnemyBehaviorCommand, { kind: "moveTo" } | { kind: "moveBy" } | { kind: "moveRandom" }>
    ): Extract<FrameCommandState, { type: "move" }> {
        if (frame.state != null && frame.state.type === "move") {
            return frame.state;
        }

        const state: Extract<FrameCommandState, { type: "move" }> = {
            type: "move",
            started: false,
        };
        frame.state = state;
        return state;
    }

    private resolveFireParams(command: FireCommand): FireCommand["params"] {
        if (command.pattern !== "spiral") {
            return command.params;
        }

        const streamId = command.params?.streamId;
        if (typeof streamId === "string" && streamId.length > 0) {
            return command.params;
        }

        let autoStreamId = this.fireStreamIds.get(command);
        if (autoStreamId == null) {
            this.fireCommandSeq++;
            autoStreamId = `${this.runtimeId}-fire-${this.fireCommandSeq.toString(36)}`;
            this.fireStreamIds.set(command, autoStreamId);
        }

        return {
            ...(command.params ?? {}),
            streamId: autoStreamId,
        };
    }

    private recallOwnedBullets(): void {
        const recallable = this.gameObject as unknown as Partial<BulletRecallable>;
        if (typeof recallable.recallOwnBullets === "function") {
            recallable.recallOwnBullets();
        }
    }

    private resolveSePath(rawPath: string): string {
        if (rawPath.startsWith("/")) {
            return rawPath;
        }
        return `/assets/sounds/se/${rawPath}`;
    }

    private randomRange(a: number, b: number): number {
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        if (min === max) {
            return min;
        }
        return min + Math.random() * (max - min);
    }

    private pickRandomMovePoint(command: Extract<EnemyBehaviorCommand, { kind: "moveRandom" }>): { x: number; y: number } {
        const minX = Math.min(command.minX, command.maxX);
        const maxX = Math.max(command.minX, command.maxX);
        const minY = Math.min(command.minY, command.maxY);
        const maxY = Math.max(command.minY, command.maxY);

        const currentX = this.gameObject.transform.position.x;
        const currentY = this.gameObject.transform.position.y;
        const minDistance = Math.max(0, command.minDistanceFromCurrent ?? 0);
        const maxAttempts = Math.max(1, Math.floor(command.maxAttempts ?? 12));

        let bestX = currentX;
        let bestY = currentY;
        let bestDistance = -1;

        for (let i = 0; i < maxAttempts; i++) {
            const x = this.randomRange(minX, maxX);
            const y = this.randomRange(minY, maxY);
            const dist = Math.hypot(x - currentX, y - currentY);

            if (dist >= minDistance) {
                return { x, y };
            }

            if (dist > bestDistance) {
                bestDistance = dist;
                bestX = x;
                bestY = y;
            }
        }

        if (minDistance <= 0) {
            return { x: bestX, y: bestY };
        }

        const corners = [
            { x: minX, y: minY },
            { x: minX, y: maxY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
        ];

        let farCorner = corners[0];
        let farDist = Math.hypot(farCorner.x - currentX, farCorner.y - currentY);
        for (let i = 1; i < corners.length; i++) {
            const c = corners[i];
            const d = Math.hypot(c.x - currentX, c.y - currentY);
            if (d > farDist) {
                farDist = d;
                farCorner = c;
            }
        }

        return farDist > bestDistance ? farCorner : { x: bestX, y: bestY };
    }

}
