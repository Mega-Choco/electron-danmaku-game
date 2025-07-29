import { Component } from "../lib/component";
import { FanShotPattern } from "./pattern/fan-shot-pattern";
import { RadialShotPattern } from "./pattern/radial-shot-pattern";

export class EmenyController extends Component{
    fireRate: number;
    bulletCount: number;
    private _fireDelayCounter: number = 0;
    private _isShootable: boolean = true;

    constructor(fireRate: number, bulletCount: number){
        super();
        this.fireRate = fireRate;
        this.bulletCount = bulletCount;
    }
    
    update(delta: number): void {
        if (this._fireDelayCounter > 0) {
            this._fireDelayCounter -= delta;
            this._isShootable = false;
        }
        else {
            this._fireDelayCounter = 0;
            this._isShootable = true;
        }

        if (this._isShootable) {
            this.fireWithPatterns();
            this._fireDelayCounter = this.fireRate;
        }
    }

    private fireWithPatterns() {
        const fanShotPattern = new FanShotPattern();
        const radialShotPattern = new RadialShotPattern();
        fanShotPattern.fire(this.gameObject);
        radialShotPattern.fire(this.gameObject);
    }
}