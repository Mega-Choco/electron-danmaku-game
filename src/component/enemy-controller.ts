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
            //this.fire();
            //this.radialShot();
            this.fanShot();
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

    private radialShot(){

        console.log("radial shot!")
        const cnt = 30;
        const speed = 10;
    
        
        for(let i = 0; i < cnt; i++){
            const angle = (2*Math.PI / cnt) * i;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            let bullet = new Bullet(speed, new Vector2(vx, vy), 10);
            bullet.transform.position = new Vector2(this.gameObject.transform.position.x, this.gameObject.transform.position.y);
            GameObject.instantiate(bullet);
        }
    }


    private fanShot() {
        const bulletCount = 10;
        const speed = 15;
        const angleRange = Math.PI / 2; // 90도
        const startAngle = -Math.PI / 4; // 기준 각도 (-45도)
      
        for (let i = 0; i < bulletCount; i++) {
          const angle = startAngle + (angleRange / (bulletCount - 1)) * i;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
      
          const bullet = new Bullet(speed, new Vector2(vx, vy), 10);
          bullet.transform.position = 
          new Vector2(this.gameObject.transform.position.x, this.gameObject.transform.position.y);
          GameObject.instantiate(bullet);
        }
    }
}