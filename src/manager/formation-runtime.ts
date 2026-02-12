import { GameObject } from "../lib/game-object";
import { Vector2 } from "../lib/vector2";

export interface FormationGroupConfig {
    members: GameObject[];
    origin: Vector2;
    slotOffsets: Vector2[];
    anchorPath?: (elapsed: number, origin: Vector2) => Vector2;
    duration?: number;
}

export interface FormationPathDebugOptions {
    previewSeconds?: number;
    sampleCount?: number;
    drawSlots?: boolean;
}

class FormationGroup {
    private members: GameObject[];
    private origin: Vector2;
    private slotOffsets: Vector2[];
    private anchorPath: (elapsed: number, origin: Vector2) => Vector2;
    private duration: number | null;
    private elapsed = 0;

    constructor(config: FormationGroupConfig) {
        this.members = config.members;
        this.origin = new Vector2(config.origin.x, config.origin.y);
        this.slotOffsets = config.slotOffsets.map((offset) => new Vector2(offset.x, offset.y));
        this.anchorPath = config.anchorPath ?? ((_, origin) => new Vector2(origin.x, origin.y));
        this.duration = typeof config.duration === "number" ? Math.max(0, config.duration) : null;
    }

    update(delta: number): boolean {
        this.elapsed += Math.max(0, delta);

        if (this.duration != null && this.elapsed >= this.duration) {
            return false;
        }

        const anchor = this.anchorPath(this.elapsed, this.origin);
        let activeMembers = 0;

        for (let i = 0; i < this.members.length; i++) {
            const member = this.members[i];
            if (!member.enabled) {
                continue;
            }
            activeMembers++;

            const slotOffset = this.slotOffsets[i] ?? new Vector2();
            member.transform.position.x = anchor.x + slotOffset.x;
            member.transform.position.y = anchor.y + slotOffset.y;
        }

        return activeMembers > 0;
    }

    drawDebug(context: CanvasRenderingContext2D, options: FormationPathDebugOptions): void {
        const sampleCount = Math.max(8, Math.floor(options.sampleCount ?? 48));
        const drawSlots = options.drawSlots ?? true;
        const previewSeconds = Math.max(0.1, options.previewSeconds ?? 3);

        const endTime = this.duration != null ? this.duration : this.elapsed + previewSeconds;

        this.drawPathLine(context, sampleCount, endTime, new Vector2(0, 0), "rgba(40, 180, 255, 0.95)", 2);

        if (drawSlots) {
            for (const slotOffset of this.slotOffsets) {
                this.drawPathLine(context, sampleCount, endTime, slotOffset, "rgba(40, 180, 255, 0.3)", 1);
            }
        }

        const currentAnchor = this.anchorPath(this.elapsed, this.origin);
        this.drawCurrentMarker(context, currentAnchor);
    }

    private drawPathLine(
        context: CanvasRenderingContext2D,
        sampleCount: number,
        endTime: number,
        offset: Vector2,
        strokeStyle: string,
        lineWidth: number
    ): void {
        if (endTime <= 0) {
            return;
        }

        const steps = Math.max(1, sampleCount - 1);
        context.beginPath();

        for (let i = 0; i <= steps; i++) {
            const t = (endTime * i) / steps;
            const anchor = this.anchorPath(t, this.origin);
            const x = anchor.x + offset.x;
            const y = anchor.y + offset.y;

            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }

        context.strokeStyle = strokeStyle;
        context.lineWidth = lineWidth;
        context.stroke();
    }

    private drawCurrentMarker(context: CanvasRenderingContext2D, anchor: Vector2): void {
        context.beginPath();
        context.arc(anchor.x, anchor.y, 4, 0, Math.PI * 2);
        context.fillStyle = "rgba(20, 130, 255, 0.95)";
        context.fill();
    }
}

export class FormationRuntime {
    private static groups: FormationGroup[] = [];

    static addGroup(config: FormationGroupConfig): void {
        if (config.members.length === 0) {
            return;
        }
        this.groups.push(new FormationGroup(config));
    }

    static update(delta: number): void {
        if (this.groups.length === 0) {
            return;
        }
        this.groups = this.groups.filter((group) => group.update(delta));
    }

    static clear(): void {
        this.groups = [];
    }

    static drawDebug(context: CanvasRenderingContext2D, options: FormationPathDebugOptions = {}): void {
        if (this.groups.length === 0) {
            return;
        }

        context.save();
        for (const group of this.groups) {
            group.drawDebug(context, options);
        }
        context.restore();
    }
}
