import { MotionController } from "../component/motion-controller";
import { StateDefinition, StateMachineComponent, StateMachineProfile } from "../component/state-machine";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

export abstract class Actor extends GameObject {
    private readonly stateMachine: StateMachineComponent;
    private readonly motionController: MotionController;

    constructor(name: string, position: Vector2 = new Vector2()) {
        super(name, position);
        this.stateMachine = new StateMachineComponent();
        this.motionController = new MotionController();
        this.addComponent(this.stateMachine);
        this.addComponent(this.motionController);
    }

    protected registerState(state: StateDefinition, setAsInitial: boolean = false): void {
        this.stateMachine.registerState(state, setAsInitial);
    }

    protected changeState(name: string): void {
        this.stateMachine.changeState(name);
    }

    protected applyStateProfile(profile: StateMachineProfile): void {
        this.stateMachine.applyProfile(profile);
    }

    getMotionController(): MotionController {
        return this.motionController;
    }

    getCurrentStateName(): string | null {
        return this.stateMachine.getCurrentStateName();
    }
}
