import { Component } from "../lib/component";
import { GameObject } from "../lib/game-object";

export interface StateDefinition {
    name: string;
    onEnter?: (owner: GameObject, prevState: string | null) => void;
    onUpdate?: (owner: GameObject, delta: number, stateElapsed: number) => void;
    onExit?: (owner: GameObject, nextState: string | null) => void;
}

export interface StateMachineProfile {
    initialState: string;
    states: StateDefinition[];
}

export class StateMachineComponent extends Component {
    private states = new Map<string, StateDefinition>();
    private currentStateName: string | null = null;
    private pendingStateName: string | null = null;
    private stateElapsed = 0;

    registerState(state: StateDefinition, setAsInitial: boolean = false): void {
        this.states.set(state.name, state);
        if (setAsInitial || this.currentStateName == null) {
            this.pendingStateName = state.name;
            this.flushTransition();
        }
    }

    hasState(name: string): boolean {
        return this.states.has(name);
    }

    changeState(name: string): void {
        if (!this.states.has(name)) {
            throw new Error(`State not found: ${name}`);
        }
        this.pendingStateName = name;
    }

    getCurrentStateName(): string | null {
        return this.currentStateName;
    }

    applyProfile(profile: StateMachineProfile): void {
        this.states.clear();
        this.currentStateName = null;
        this.pendingStateName = null;
        this.stateElapsed = 0;

        for (const state of profile.states) {
            this.states.set(state.name, state);
        }

        this.changeState(profile.initialState);
        this.flushTransition();
    }

    update(delta: number): void {
        this.flushTransition();

        if (this.currentStateName == null) {
            return;
        }

        const state = this.states.get(this.currentStateName);
        if (state == null) {
            return;
        }

        this.stateElapsed += Math.max(0, delta);
        state.onUpdate?.(this.gameObject, delta, this.stateElapsed);

        this.flushTransition();
    }

    private flushTransition(): void {
        let guard = 0;
        while (this.pendingStateName != null && guard < 8) {
            guard++;
            const nextStateName = this.pendingStateName;
            this.pendingStateName = null;

            if (nextStateName === this.currentStateName) {
                continue;
            }

            const nextState = this.states.get(nextStateName);
            if (nextState == null) {
                throw new Error(`State not found: ${nextStateName}`);
            }

            const prevStateName = this.currentStateName;
            if (prevStateName != null) {
                const prevState = this.states.get(prevStateName);
                prevState?.onExit?.(this.gameObject, nextStateName);
            }

            this.currentStateName = nextStateName;
            this.stateElapsed = 0;
            nextState.onEnter?.(this.gameObject, prevStateName);
        }
    }
}
