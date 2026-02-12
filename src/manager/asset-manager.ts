import { plainToInstance } from "class-transformer";
import { Animation } from "../component/sprite-animation";

export class AssetManager{

    static imageMap: Map<string, ImageBitmap> = new Map();
    static animationDataMap: Map<string,Animation[]> = new Map();
    static audioBufferMap: Map<string, AudioBuffer> = new Map();
    static loadingAudioMap: Map<string, Promise<AudioBuffer>> = new Map();
    private static audioContext: AudioContext | null = null;

    private static getAudioContext(): AudioContext {
        if (this.audioContext != null) {
            return this.audioContext;
        }

        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextCtor == null) {
            throw new Error("AudioContext not supported");
        }

        this.audioContext = new AudioContextCtor();
        return this.audioContext;
    }

    static async loadImage(path: string): Promise<ImageBitmap>{

        // return preloaded image on memory
        if(this.imageMap.has(path)){
            return this.imageMap.get(path)!!;
        }

        const res = await fetch(`${path}`, { cache: 'no-store' });
        console.log(res);
        if (!res.ok) throw new Error(`이미지 불러오기 실패: ${res.status}`);
      
        const blob = await res.blob();
        if (blob.size === 0) throw new Error('빈 파일입니다');
        
        let bitmap = await createImageBitmap(blob);
        
        this.imageMap.set(path, bitmap);
        
        return bitmap;
    }

    static async loadAnimationData(path: string): Promise<Animation[]>{

        if(this.animationDataMap.has(path)){
            return this.animationDataMap.get(path)!!;
        }

        const res = await fetch(`${path}`, {cache: 'no-store'});
        if (!res.ok) throw new Error(`애니메이션 데이터 불러오기 실패: ${res.status}`);
        
        const blob = await res.blob();
        const str = await blob.text();
        const json = await JSON.parse(str)

        const animations = plainToInstance(Animation, json);
        animations.forEach(a=>{
            console.log(a.name, a.loopInfo?.start);
        });
        if (blob.size === 0) throw new Error('빈 파일입니다');

        this.animationDataMap.set(path, animations);

        return animations;
    }

    static async loadAudio(path: string): Promise<AudioBuffer> {
        if (this.audioBufferMap.has(path)) {
            return this.audioBufferMap.get(path)!!;
        }

        const loading = this.loadingAudioMap.get(path);
        if (loading != null) {
            return await loading;
        }

        const promise = (async () => {
            try {
                const res = await fetch(`${path}`, { cache: "no-store" });
                if (!res.ok) throw new Error(`사운드 불러오기 실패: ${res.status}`);

                const arrayBuffer = await res.arrayBuffer();
                if (arrayBuffer.byteLength === 0) throw new Error("빈 오디오 파일입니다");

                const ctx = this.getAudioContext();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
                this.audioBufferMap.set(path, audioBuffer);
                return audioBuffer;
            } finally {
                this.loadingAudioMap.delete(path);
            }
        })();

        this.loadingAudioMap.set(path, promise);

        return await promise;
    }

    static async preloadAudio(paths: string[]): Promise<void> {
        await Promise.all(paths.map((path) => this.loadAudio(path)));
    }

    static async resumeAudioContext(): Promise<void> {
        const ctx = this.getAudioContext();
        if (ctx.state === "suspended") {
            await ctx.resume();
        }
    }

    static async playSound(path: string, volume: number = 1): Promise<void> {
        try {
            const safeVolume = Math.max(0, volume);
            const ctx = this.getAudioContext();

            if (ctx.state === "suspended") {
                await ctx.resume();
            }

            const audioBuffer = await this.loadAudio(path);
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();

            source.buffer = audioBuffer;
            gainNode.gain.value = safeVolume;

            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(0);
        } catch (err) {
            console.warn("사운드 재생 실패", err);
        }
    }
}
