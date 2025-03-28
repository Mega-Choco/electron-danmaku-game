import { Bullet } from "../actor/bullet";
import { Component } from "../lib/component";
import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

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
            this.fire();
            this._fireDelayCounter = this.fireRate;
        }
    }

    private fire(){
        for(var index =0; index < this.bulletCount; index++){
            let dir: Vector2 = new Vector2(Math.cos(Math.PI * 2 * index/this.bulletCount),
            Math.sin(Math.PI * 2 * index / this.bulletCount)); 
            let bullet = new Bullet(100, dir, 10);
            // 현재 위치에서 생성
            bullet.transform.position = new Vector2(this.gameObject.transform.position.x, this.gameObject.transform.position.y)
            this.gameObject.transform.position;
            
            GameObject.instantiate(bullet);
        }  
    }
}