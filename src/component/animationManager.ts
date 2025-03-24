import { Animation } from "../lib/animation";
import { Component } from "../lib/component";


class drawInfo{
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;
}

export class AnimationManager extends Component{
    public spriteSheet: HTMLImageElement;
    public animationDrawInfo : drawInfo = new drawInfo();

    private animations: Animation[];

    private currentSequenceCount: number = 0;
    private currentWaitFrameCount: number = 0;

    //루프 포인트를 위해서 현재의 시작프레임과 끝프레임을 저장하기 위함
    private currentStartFrame: number = 0;
    private currentEndFrame: number = 0;

    private currentAnimationIndex:number = 0;
    private loopedOnece = false;

    constructor(animations: Animation[], sheet: HTMLImageElement) {
        super();
        this.animations = animations;
        this.spriteSheet = sheet;
    }
    update(delta: number): void {
        let nowAnim = this.animations[this.currentAnimationIndex];
        if(nowAnim.waitFrame <= this.currentWaitFrameCount){
            if(this.currentSequenceCount >= this.currentEndFrame - 1){
                
                if(this.loopedOnece == false){
                    if(nowAnim.loopInfo != null){
                        this.currentStartFrame = nowAnim.loopInfo.startFrame;
                        this.currentEndFrame = nowAnim.loopInfo.endFrame;
                    }
                    this.loopedOnece = true;
                }
                this.currentSequenceCount = this.currentStartFrame;
            }
            else{
                this.currentSequenceCount ++;
            }
            this.updateDarawInfo();
            this.currentWaitFrameCount = 0;

        }else{
            this.currentWaitFrameCount++;
        }
    }

    
    draw(context: CanvasRenderingContext2D): void {
        context.drawImage(
            this.spriteSheet,
            this.animationDrawInfo.x ?? 0,
            this.animationDrawInfo.y ?? 0,
            this.animationDrawInfo.width ?? 0,
            this.animationDrawInfo.height ?? 0,
            this.gameObject.transform.position.x,
            this.gameObject.transform.position.y,
             32,48);
     }
    

    private updateDarawInfo(){
        this.animationDrawInfo.width =this.animations[this.currentAnimationIndex].width;
        this.animationDrawInfo.height = this.animations[this.currentAnimationIndex].height;
        
        this.animationDrawInfo.x = 
            this.animations[this.currentAnimationIndex].offset.x +
            (
                this.animations[this.currentAnimationIndex].width * this.currentSequenceCount
            );

        this.animationDrawInfo.y = this.animations[this.currentAnimationIndex].offset.y
    }
    


    public changeAnimation(name: string) {
        let index = this.animations.findIndex(ani => ani.name === name);
    
        if(name === this.animations[this.currentAnimationIndex].name){
            return;
        }

        if (index === -1) {
            return;
        }
        
        this.currentAnimationIndex = index;
        this.resetAnimationRunner();
        this.updateDarawInfo();
    }
    private resetAnimationRunner(){
        this.currentWaitFrameCount = 0;
        this.currentSequenceCount = 0;
        this.currentStartFrame = 0;
        this.currentEndFrame = this.animations[this.currentAnimationIndex].frame;
        this.loopedOnece = false;
    }
}