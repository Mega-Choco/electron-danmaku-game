import { Component } from "../lib/component";
import { InputKey, InputManager } from "../manager/input-manager";
import { Setting } from "../setting";
import { SpriteAnimation } from "./sprite-animation";

export class PlayerController extends Component{
    controllerable: boolean = true;
    speed: number = 0;
    throttleSpeed: number = 0;
    
    private _animation: SpriteAnimation | null = null;

    constructor(speed: number){
        super();
        this.speed = speed;      
        this.throttleSpeed = this.speed/2;  
    }

    async init(): Promise<void> {
        this._animation = this.gameObject.getComponent(SpriteAnimation);
        //this._circleComponent = this.gameObject.getComponent(Circle);
    }

    disableController(){
        this.controllerable = false;
    }

    enableController(){
        this.controllerable = true;
    }

    update(delta: number): void {
        
        if(!this.controllerable)
            return;

        let xDir = 0;
        let yDir = 0;
        let currentAnimTriggerName : string = 'middle';

        let isThrottle = false;

        if (InputManager.geyKey(InputKey.Left)) xDir = -1;
        if (InputManager.geyKey(InputKey.Right)) xDir = 1;
        if (InputManager.geyKey(InputKey.Up)) yDir = -1;
        if (InputManager.geyKey(InputKey.Down)) yDir = 1;
        if(InputManager.geyKey(InputKey.Slow)) isThrottle = true;

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

        const moveSpeed = (isThrottle ? this.throttleSpeed : this.speed) * delta;
        const pos = this.gameObject.transform.position;

        pos.x += xDir * moveSpeed;
        pos.y += yDir * moveSpeed;

        pos.x = Math.max(0, Math.min(Setting.screen.width, pos.x));
        pos.y = Math.max(0, Math.min(Setting.screen.height, pos.y));

        this._animation?.changeAnimation(currentAnimTriggerName);
    }   
}