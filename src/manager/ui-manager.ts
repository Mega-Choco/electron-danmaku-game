import { Game } from "../game";

export default class UIManager{
    
    drawUI(ctx: CanvasRenderingContext2D){
        
        const drawGrazeText = `Graze: ${Game.getGraze().toString()}`;
        ctx.fillStyle = "black";
        ctx.font ="bold 24px serif";
        ctx.fillText(drawGrazeText, 10,40);
    }
}