import { Component } from "../lib/Component";

export class Rectangle extends Component{

    width: number = 0;
    height: number = 0;
    color: string = '';
    constructor(width: number, height: number, color: string){
        super();
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = 'red';
        context.fillRect(
            this.gameObject.transform.position.x,
            this.gameObject.transform.position.y,
            this.width,
            this.height
        );
    }
}