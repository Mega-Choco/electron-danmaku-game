import { StateMachineProfile } from "../component/state-machine";

export function createPlayerDefaultProfile(): StateMachineProfile {
    return {
        initialState: "active",
        states: [{ name: "active" }, { name: "dead" }],
    };
}

export function createEnemyDefaultProfile(): StateMachineProfile {
    return {
        initialState: "active",
        states: [{ name: "active" }, { name: "retreat" }, { name: "dead" }],
    };
}

export function createBossDefaultProfile(): StateMachineProfile {
    return {
        initialState: "phase1",
        states: [{ name: "phase1" }, { name: "phase2" }, { name: "spell" }, { name: "dead" }],
    };
}
