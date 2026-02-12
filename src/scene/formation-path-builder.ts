import { Vector2 } from "../lib/vector2";

export type FormationAnchorPath = (elapsed: number, origin: Vector2) => Vector2;
export type FormationPathEasing = "linear" | "easeIn" | "easeOut" | "easeInOut";

interface FormationPathSegment {
    duration: number;
    startOffset: Vector2;
    endOffset: Vector2;
    sample: (localElapsed: number, startOffset: Vector2) => Vector2;
}

export class FormationPathBuilder {
    private segments: FormationPathSegment[] = [];
    private currentOffset = new Vector2(0, 0);
    private totalDuration = 0;

    /**
     * 현재 위치를 유지하는 대기 구간을 추가합니다.
     * @param seconds 대기 시간(초)
     */
    wait(seconds: number): this {
        const duration = Math.max(0, seconds);
        const start = this.cloneVector(this.currentOffset);
        const end = this.cloneVector(start);

        this.pushSegment({
            duration,
            startOffset: start,
            endOffset: end,
            sample: (_localElapsed, startOffset) => this.cloneVector(startOffset),
        });
        return this;
    }

    /**
     * 현재 오프셋 기준 직선 이동 구간을 추가합니다.
     * @param dx 시작점 기준 x 이동량
     * @param dy 시작점 기준 y 이동량
     * @param seconds 구간 진행 시간(초)
     * @param easing 시간 보간 이징
     */
    lineBy(dx: number, dy: number, seconds: number, easing: FormationPathEasing = "linear"): this {
        const duration = Math.max(0, seconds);
        const start = this.cloneVector(this.currentOffset);
        const end = new Vector2(start.x + dx, start.y + dy);

        this.pushSegment({
            duration,
            startOffset: start,
            endOffset: end,
            sample: (localElapsed, startOffset) => {
                if (duration <= 0) {
                    return new Vector2(end.x, end.y);
                }
                const ratio = Math.min(1, Math.max(0, localElapsed / duration));
                const t = this.applyEasing(easing, ratio);
                return new Vector2(startOffset.x + dx * t, startOffset.y + dy * t);
            },
        });
        return this;
    }

    /**
     * 현재 오프셋에서 목표 오프셋까지 포물선(2차 베지어) 구간을 추가합니다.
     * @param dx 시작점 기준 x 이동량
     * @param dy 시작점 기준 y 이동량
     * @param arcHeight 진행 방향에 수직인 방향으로 휘는 높이(양수/음수로 휘는 방향 제어)
     * @param seconds 구간 진행 시간(초)
     * @param easing 시간 보간 이징
     */
    arcBy(dx: number, dy: number, arcHeight: number, seconds: number, easing: FormationPathEasing = "linear"): this {
        const duration = Math.max(0, seconds);
        const start = this.cloneVector(this.currentOffset);
        const end = new Vector2(start.x + dx, start.y + dy);
        const { x: normalX, y: normalY } = this.getPerpendicularUnit(dx, dy);
        const control = new Vector2(
            start.x + dx * 0.5 + normalX * arcHeight,
            start.y + dy * 0.5 + normalY * arcHeight
        );

        this.pushSegment({
            duration,
            startOffset: start,
            endOffset: end,
            sample: (localElapsed) => {
                if (duration <= 0) {
                    return new Vector2(end.x, end.y);
                }
                const ratio = Math.min(1, Math.max(0, localElapsed / duration));
                const t = this.applyEasing(easing, ratio);
                return this.sampleQuadraticBezier(start, control, end, t);
            },
        });
        return this;
    }

    /**
     * 현재 오프셋 기준 사인 진동 이동 구간을 추가합니다.
     * @param dx 시작점 기준 x 이동량
     * @param dy 시작점 기준 y 이동량
     * @param seconds 구간 진행 시간(초)
     * @param amplitude 진폭(픽셀)
     * @param waves 구간 내 사인 파동 반복 횟수
     * @param easing 시간 보간 이징
     */
    sinBy(
        dx: number,
        dy: number,
        seconds: number,
        amplitude: number,
        waves: number = 1,
        easing: FormationPathEasing = "linear"
    ): this {
        const duration = Math.max(0, seconds);
        const start = this.cloneVector(this.currentOffset);
        const end = new Vector2(start.x + dx, start.y + dy);
        const safeWaves = Math.max(0, waves);
        const twoPi = Math.PI * 2;
        const { x: normalX, y: normalY } = this.getPerpendicularUnit(dx, dy);

        this.pushSegment({
            duration,
            startOffset: start,
            endOffset: end,
            sample: (localElapsed) => {
                if (duration <= 0) {
                    return new Vector2(end.x, end.y);
                }
                const ratio = Math.min(1, Math.max(0, localElapsed / duration));
                const t = this.applyEasing(easing, ratio);
                const baseX = start.x + dx * t;
                const baseY = start.y + dy * t;
                const envelope = Math.sin(ratio * Math.PI);
                const wave = Math.sin(ratio * safeWaves * twoPi) * amplitude * envelope;
                return new Vector2(baseX + normalX * wave, baseY + normalY * wave);
            },
        });
        return this;
    }

    /**
     * x축 사인 흔들림과 드리프트를 동시에 적용하는 구간을 추가합니다.
     * @param amplitude x축 흔들림 진폭(픽셀)
     * @param frequency 초당 파동 수(Hz)
     * @param seconds 구간 진행 시간(초)
     * @param driftY 구간 동안 누적되는 y 드리프트 이동량
     * @param driftX 구간 동안 누적되는 x 드리프트 이동량
     */
    waveX(amplitude: number, frequency: number, seconds: number, driftY: number = 0, driftX: number = 0): this {
        const duration = Math.max(0, seconds);
        const safeFrequency = Math.max(0, frequency);
        const start = this.cloneVector(this.currentOffset);
        const twoPi = Math.PI * 2;

        const calcOffset = (time: number): Vector2 => {
            if (duration <= 0) {
                return new Vector2(start.x, start.y);
            }
            const ratio = Math.min(1, Math.max(0, time / duration));
            const sway = Math.sin(time * safeFrequency * twoPi) * amplitude;
            return new Vector2(start.x + sway + driftX * ratio, start.y + driftY * ratio);
        };

        const end = calcOffset(duration);
        this.pushSegment({
            duration,
            startOffset: start,
            endOffset: end,
            sample: (localElapsed) => calcOffset(localElapsed),
        });
        return this;
    }

    getDuration(): number {
        return this.totalDuration;
    }

    build(): FormationAnchorPath {
        const copiedSegments = this.segments.map((segment) => ({
            duration: segment.duration,
            startOffset: this.cloneVector(segment.startOffset),
            endOffset: this.cloneVector(segment.endOffset),
            sample: segment.sample,
        }));

        return (elapsed: number, origin: Vector2): Vector2 => {
            const time = Math.max(0, elapsed);
            if (copiedSegments.length === 0) {
                return new Vector2(origin.x, origin.y);
            }

            let remain = time;

            for (const segment of copiedSegments) {
                if (segment.duration <= 0) {
                    continue;
                }
                if (remain <= segment.duration) {
                    const offset = segment.sample(remain, segment.startOffset);
                    return new Vector2(origin.x + offset.x, origin.y + offset.y);
                }
                remain -= segment.duration;
            }

            const tail = copiedSegments[copiedSegments.length - 1].endOffset;
            return new Vector2(origin.x + tail.x, origin.y + tail.y);
        };
    }

    /**
     * 내부 세그먼트를 경로에 추가합니다.
     * @param segment 추가할 경로 세그먼트
     */
    private pushSegment(segment: FormationPathSegment): void {
        this.segments.push(segment);
        this.currentOffset = this.cloneVector(segment.endOffset);
        this.totalDuration += Math.max(0, segment.duration);
    }

    /**
     * 이징 타입에 따른 보간 비율을 계산합니다.
     * @param easing 보간 방식
     * @param t 0~1 정규화 시간
     */
    private applyEasing(easing: FormationPathEasing, t: number): number {
        switch (easing) {
            case "easeIn":
                return t * t;
            case "easeOut":
                return 1 - (1 - t) * (1 - t);
            case "easeInOut":
                return t < 0.5 ? 2 * t * t : 1 - (Math.pow(-2 * t + 2, 2) / 2);
            case "linear":
            default:
                return t;
        }
    }

    /**
     * 2차 베지어 곡선의 샘플 좌표를 계산합니다.
     * @param start 시작점
     * @param control 제어점
     * @param end 끝점
     * @param t 0~1 정규화 위치
     */
    private sampleQuadraticBezier(start: Vector2, control: Vector2, end: Vector2, t: number): Vector2 {
        const inv = 1 - t;
        const x = inv * inv * start.x + 2 * inv * t * control.x + t * t * end.x;
        const y = inv * inv * start.y + 2 * inv * t * control.y + t * t * end.y;
        return new Vector2(x, y);
    }

    /**
     * 입력 벡터에 수직인 단위 벡터를 계산합니다.
     * @param dx 기준 벡터 x
     * @param dy 기준 벡터 y
     */
    private getPerpendicularUnit(dx: number, dy: number): Vector2 {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length <= 0.0001) {
            return new Vector2(0, -1);
        }
        return new Vector2(-dy / length, dx / length);
    }

    /**
     * 벡터를 복사합니다.
     * @param v 복사할 벡터
     */
    private cloneVector(v: Vector2): Vector2 {
        return new Vector2(v.x, v.y);
    }
}

export function formationPath(): FormationPathBuilder {
    return new FormationPathBuilder();
}
