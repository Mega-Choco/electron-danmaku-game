import { Game } from "../game";
import { PoolManager } from "./pool-manager";
import { Setting } from "../setting";

export default class UIManager{
    
    drawUI(ctx: CanvasRenderingContext2D){
        
        const drawGrazeText = `Graze: ${Game.getGraze().toString()}`;
        const drawHitText = `Hit: ${Game.getHitCount().toString()}`;
        const drawFpsText = `FPS: ${Game.getCurrentFps().toFixed(2)}`;
        const bulletPool = PoolManager.getBulletPoolStats();
        const drawBulletPoolText = `BulletPool: ${bulletPool.active}/${bulletPool.total}`;

        ctx.fillStyle = "black";
        ctx.font ="bold 24px serif";
        ctx.fillText(drawGrazeText, 10,40);
        ctx.fillText(drawHitText, 10,70);
        if (Setting.system.drawBulletPoolDebugInfo) {
            ctx.font = "bold 20px serif";
            ctx.fillText(drawBulletPoolText, 10, 98);
        }

        ctx.font = "bold 18px serif";
        const textWidth = ctx.measureText(drawFpsText).width;
        const x = ctx.canvas.width - textWidth - 10;
        const y = ctx.canvas.height - 10;
        ctx.fillText(drawFpsText, x, y);
    }
}
