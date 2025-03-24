import { Vector2 } from "./vector2"

export class AnimationLoopPoint{
    startFrame: number = 0;
    endFrame: number = 0;
    constructor(startFrame: number, endFrame: number){
        this.startFrame = startFrame;
        this.endFrame = endFrame;
    }
}

export class Animation{
    name: string;
    offset: Vector2;
    width: number;
    height: number;
    frame: number;
    waitFrame: number;
    loopInfo?: AnimationLoopPoint | null;

    constructor(name: string, offsetX: number, offsetY: number, width: number, height: number, frame: number, waitFrame: number, loopInfo: AnimationLoopPoint | null) {
        this.name = name;
        this.offset = new Vector2(offsetX, offsetY);        
        this.width = width;
        this.height = height;
        this.frame = frame;
        this.waitFrame = waitFrame;
        this.loopInfo = loopInfo;
    }


}