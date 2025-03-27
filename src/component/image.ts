import { AssetManager } from "../manager/asset-manager";
import { Component } from "../lib/component";
import { Vector2 } from "../lib/vector2";

export class Image extends Component{
    image: ImageBitmap | null = null;
    offset: Vector2 = new Vector2();
    width: number | null = null;
    height: number | null = null;

    path: string;

    constructor(path: string, width: number | null = null, height: number | null = null
    ){
        super()
        
        this.path = path;
        this.width = width;
        this.height = height;
    }
    async init(): Promise<void> {
        const img = await AssetManager.loadImage(this.path);
        this.image = img;
    }

    draw(context: CanvasRenderingContext2D): void {
        if(this.image != null){   
            const offsetX = this.image.width / 2;
            const offsetY = this.image.height / 2;

            context.drawImage(
                this.image,
                this.gameObject.transform.position.x - offsetX,
                this.gameObject.transform.position.y - offsetY,
                this.image.width,
                this.image.height
            )    
        }
    }
}