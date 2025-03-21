import { Component } from "../lib/component";

export class Image extends Component{
    image: ImageBitmap;

    constructor(image: ImageBitmap){
        super()
        this.image = image;
    }

    draw(context: CanvasRenderingContext2D): void {
        context.drawImage(
            this.image,
            this.gameObject.transform.position.x,
            this.gameObject.transform.position.y,
            this.image.width,
            this.image.height
        )    
    }
}