import { Type } from "class-transformer";
import { AssetManager } from "../manager/asset-manager";
import { Component } from "../lib/component";
import { AnimationLoopPoint } from "../lib/animation-loop-point";

export class drawInfo{
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;
}

export class Animation {
    name: string;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    frame: number;
    waitFrame: number;

    @Type(() => AnimationLoopPoint)
    loopInfo?: AnimationLoopPoint | null;

    constructor(name: string, offsetX: number, offsetY: number, width: number, height: number, frame: number, waitFrame: number, loopInfo: AnimationLoopPoint | null) {
        this.name = name;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
        this.frame = frame;
        this.waitFrame = waitFrame;
        this.loopInfo = loopInfo;
    }
}


export class SpriteAnimation extends Component{
    public spriteSheet: ImageBitmap | null = null;
    private sheetPath: string;

    public animationDrawInfo : drawInfo = new drawInfo();

    private animations: Animation[] = [];
    private animationPath: string;

    private currentSequenceCount: number = 0;
    private currentWaitFrameCount: number = 0;

    //루프 포인트를 위해서 현재의 시작프레임과 끝프레임을 저장하기 위함
    private currentStartFrame: number = 0;
    private currentEndFrame: number = 0;

    private currentAnimationIndex:number = 0;
    private loopedOnece = false;
    
    constructor(animationPath: string, sheetPath: string) {
        super();
        this.animationPath = animationPath;
        this.sheetPath = sheetPath;
    }

    async init(): Promise<void> {
        this.spriteSheet = await AssetManager.loadImage(this.sheetPath);
        this.animations = await AssetManager.loadAnimationData(this.animationPath);

        this.changeAnimation(this.animations[0].name);
        this.resetAnimationRunner();
    }

    update(delta: number) : void{
        let nowAnim = this.animations[this.currentAnimationIndex];
        if(nowAnim.waitFrame <= this.currentWaitFrameCount){
            if(this.currentSequenceCount >= this.currentEndFrame - 1){
                
                if(this.loopedOnece == false){
                    if(nowAnim.loopInfo != null){
                        this.currentStartFrame = nowAnim.loopInfo.start;
                        this.currentEndFrame = nowAnim.loopInfo.end;
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
        if(this.spriteSheet != null){
            context.drawImage(
                this.spriteSheet,
                this.animationDrawInfo.x ?? 0,
                this.animationDrawInfo.y ?? 0,
                this.animationDrawInfo.width ?? 0,
                this.animationDrawInfo.height ?? 0,
                this.gameObject.transform.position.x - (this.animationDrawInfo.width / 2),
                this.gameObject.transform.position.y - (this.animationDrawInfo.height / 2),
                this.animationDrawInfo.width,
                this.animationDrawInfo.height
            )
        }
    }
    private updateDarawInfo(){
        this.animationDrawInfo.width = this.animations[this.currentAnimationIndex].width;
        this.animationDrawInfo.height = this.animations[this.currentAnimationIndex].height;
        
        this.animationDrawInfo.x = 
            this.animations[this.currentAnimationIndex].offsetX +
            (
                this.animations[this.currentAnimationIndex].width * this.currentSequenceCount
            );

        this.animationDrawInfo.y = this.animations[this.currentAnimationIndex].offsetY
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