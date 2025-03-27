import { Component } from "../lib/component";

export class Circle extends Component{

    radius: number = 0;
    color: string = '';
    constructor(radius: number = 0, color: string){
        super();
        this.radius = radius;
        this.color = color;
    }

    draw(context: CanvasRenderingContext2D): void {
        
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(
            this.gameObject.transform.position.x,
            this.gameObject.transform.position.y,
            this.radius,
            0,
            2 * Math.PI
        );
        context.fill();
    }
}