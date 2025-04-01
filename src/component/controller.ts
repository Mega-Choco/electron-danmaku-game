import { Component } from "../lib/component";
import { InputKey, InputManager } from "../manager/input-manager";
import { Circle } from "./circle";
import { SpriteAnimation } from "./sprite-animation";

export class Controller extends Component{
    controllerable: boolean = true;
    speed: number = 0;
    throttleSpeed: number = 0;
    
    private _animation: SpriteAnimation | null = null;

    private _isUpPressed = false;
    private _isDownPressed = false;
    private _isLeftPressed = false;
    private _isRightPressed = false;
    private _isShiftPressed = false;

    private _circleComponent: Circle | null = null;

    constructor(speed: number){
        super();
        this.speed = speed;      
        this.throttleSpeed = this.speed/2;  
    }

    async init(): Promise<void> {
        this._animation = this.gameObject.getComponent(SpriteAnimation);
        this._circleComponent = this.gameObject.getComponent(Circle);
    }

    disableController(){
        this.controllerable = false;
    }

    enableController(){
        this.controllerable = true;
    }

    update(delta: number): void {
        
        // 조작 활성확인
        if(!this.controllerable)
            return;

        let xDir = 0;
        let yDir = 0;
        let currentAnimTriggerName : string = 'middle';

        // check direction
        if (InputManager.isPressed(InputKey.Left)) xDir = -1;
        if (InputManager.isPressed(InputKey.Right)) xDir = 1;
        if (InputManager.isPressed(InputKey.Up)) yDir = -1;
        if (InputManager.isPressed(InputKey.Down)) yDir = 1;

        switch(xDir){
            case -1: {
                currentAnimTriggerName = 'left';
                break;
            }
            case 1: {
                currentAnimTriggerName = 'right';
                break;
            }
            default:{
                currentAnimTriggerName = 'middle';
                break;
            }
        }

        this.gameObject.transform.position.x += xDir * 
            ((this._isShiftPressed ? this.throttleSpeed : this.speed) * delta);
            
        this.gameObject.transform.position.y += yDir * 
            ((this._isShiftPressed ? this.throttleSpeed : this.speed) * delta);

        this._animation?.changeAnimation(currentAnimTriggerName);
    }   
}