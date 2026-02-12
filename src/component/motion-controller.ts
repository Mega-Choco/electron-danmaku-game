import { Component } from "../lib/component";

interface MotionTask {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    elapsed: number;
}

export class MotionController extends Component {
    private currentTask: MotionTask | null = null;

    startMoveTo(x: number, y: number, seconds: number): void {
        const duration = Math.max(0, seconds);
        const startX = this.gameObject.transform.position.x;
        const startY = this.gameObject.transform.position.y;
        this.currentTask = {
            startX,
            startY,
            endX: x,
            endY: y,
            duration,
            elapsed: 0,
        };
        this.applyCurrentTask();
    }

    startMoveBy(dx: number, dy: number, seconds: number): void {
        const duration = Math.max(0, seconds);
        const startX = this.gameObject.transform.position.x;
        const startY = this.gameObject.transform.position.y;
        this.currentTask = {
            startX,
            startY,
            endX: startX + dx,
            endY: startY + dy,
            duration,
            elapsed: 0,
        };
        this.applyCurrentTask();
    }

    stop(): void {
        this.currentTask = null;
    }

    isMoving(): boolean {
        return this.currentTask != null;
    }

    update(delta: number): void {
        if (this.currentTask == null) {
            return;
        }

        if (this.currentTask.duration <= 0) {
            this.gameObject.transform.position.x = this.currentTask.endX;
            this.gameObject.transform.position.y = this.currentTask.endY;
            this.currentTask = null;
            return;
        }

        this.currentTask.elapsed = Math.min(this.currentTask.duration, this.currentTask.elapsed + Math.max(0, delta));
        this.applyCurrentTask();

        if (this.currentTask.elapsed >= this.currentTask.duration) {
            this.currentTask = null;
        }
    }

    private applyCurrentTask(): void {
        if (this.currentTask == null) {
            return;
        }

        const ratio = this.currentTask.duration <= 0 ? 1 : Math.min(1, this.currentTask.elapsed / this.currentTask.duration);
        this.gameObject.transform.position.x = this.currentTask.startX + (this.currentTask.endX - this.currentTask.startX) * ratio;
        this.gameObject.transform.position.y = this.currentTask.startY + (this.currentTask.endY - this.currentTask.startY) * ratio;
    }
}
