import { Component } from "../lib/component";
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
        this.registerKeyEvents();
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
        if(this._isUpPressed){
            yDir = -1;
        }
        if(this._isDownPressed){
            yDir = 1;
        }
        if(this._isLeftPressed){
            xDir = -1;
        }
        if(this._isRightPressed){
            xDir = 1;
        }

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

    private registerKeyEvents() {
        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                    {
                        this._isUpPressed = false;
                        break;
                    }
                case 'ArrowDown':
                    {
                        this._isDownPressed = false;
                        break;
                    }
                case 'ArrowLeft': {
                    this._isLeftPressed = false;
                    break;
                }
                case 'ArrowRight': {
                    this._isRightPressed = false;
                    break;
                }
                case 'ShiftLeft':{
                    this._isShiftPressed = false;
                    break;
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                    {
                        this._isUpPressed = true;
                        break;
                    }
                case 'ArrowDown':
                    {
                        this._isDownPressed = true;
                        break;
                    }
                case 'ArrowLeft': {
                    this._isLeftPressed = true;
                    break;
                }
                case 'ArrowRight': {
                    this._isRightPressed = true;
                    break;
                }
                case 'ShiftLeft':{
                    this._isShiftPressed = true;
                    break;
                }
            }
        });
    }

}