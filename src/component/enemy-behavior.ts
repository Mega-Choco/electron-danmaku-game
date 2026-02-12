import { Component } from "../lib/component";
import { AssetManager } from "../manager/asset-manager";
import { EnemyBehaviorCommand, EnemyBehaviorScript } from "./enemy-behavior-builder";
import { fireEnemyPattern } from "./pattern/pattern-registry";

type FrameCommandState =
    | { type: "wait"; remaining: number }
    | {
          type: "move";
          mode: "to" | "by";
          duration: number;
          elapsed: number;
          startX: number;
          startY: number;
          endX: number;
          endY: number;
      };

interface RuntimeFrame {
    commands: EnemyBehaviorCommand[];
    index: number;
    repeatLeft: number;
    state: FrameCommandState | null;
}

export class EnemyBehavior extends Component {
    private root: EnemyBehaviorScript;
    private stack: RuntimeFrame[] = [];

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

            if (command.kind === "fire") {
                fireEnemyPattern(this.gameObject, command.pattern, command.params);
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

            if (command.kind === "moveTo" || command.kind === "moveBy") {
                if (timeBudget <= 0) {
                    break;
                }

                const state = this.ensureMoveState(frame, command);
                if (state.duration <= 0) {
                    this.gameObject.transform.position.x = state.endX;
                    this.gameObject.transform.position.y = state.endY;
                    frame.state = null;
                    frame.index++;
                    continue;
                }

                const remain = Math.max(0, state.duration - state.elapsed);
                const consumed = Math.min(remain, timeBudget);
                state.elapsed += consumed;
                timeBudget -= consumed;

                const t = Math.min(1, state.elapsed / state.duration);
                this.gameObject.transform.position.x = state.startX + (state.endX - state.startX) * t;
                this.gameObject.transform.position.y = state.startY + (state.endY - state.startY) * t;

                if (state.elapsed >= state.duration) {
                    frame.state = null;
                    frame.index++;
                }
                if (timeBudget <= 0) {
                    break;
                }
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
        command: Extract<EnemyBehaviorCommand, { kind: "moveTo" } | { kind: "moveBy" }>
    ): Extract<FrameCommandState, { type: "move" }> {
        if (frame.state != null && frame.state.type === "move") {
            return frame.state;
        }

        const startX = this.gameObject.transform.position.x;
        const startY = this.gameObject.transform.position.y;
        const endX = command.kind === "moveTo" ? command.x : startX + command.dx;
        const endY = command.kind === "moveTo" ? command.y : startY + command.dy;

        const state: Extract<FrameCommandState, { type: "move" }> = {
            type: "move",
            mode: command.kind === "moveTo" ? "to" : "by",
            duration: Math.max(0, command.seconds),
            elapsed: 0,
            startX,
            startY,
            endX,
            endY,
        };
        frame.state = state;
        return state;
    }

    private resolveSePath(rawPath: string): string {
        if (rawPath.startsWith("/")) {
            return rawPath;
        }
        return `/assets/sounds/se/${rawPath}`;
    }

}
