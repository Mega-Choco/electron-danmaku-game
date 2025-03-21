import { Component } from "../lib/Component";

export class Controller extends Component{
    speed: number = 0;
    private _isUpPressed = false;
    private _isDownPressed = false;
    private _isLeftPressed = false;
    private _isRightPressed = false;

    constructor(speed: number){
        super();
        this.speed = speed;

        // should be move to init phase
        this.registerKeyEvents();
    }

    update(delta: number): void {
        let xDir = 0;
        let yDir = 0;

        // check direction
        if(this._isUpPressed){
            yDir = -1;
        }
        if(this._isDownPressed){
            yDir = 1;
        }
        if(this._isRightPressed){
            xDir = 1;
        }
        if(this._isLeftPressed){
            xDir = -1;
        }

        
        this.gameObject.transform.position.x += xDir * (this.speed * delta);
        this.gameObject.transform.position.y += yDir * (this.speed * delta);
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
            }
        });
    }

}