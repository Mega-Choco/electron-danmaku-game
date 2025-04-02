import { plainToInstance } from "class-transformer";
import { Animation } from "../component/sprite-animation";

export class AssetManager{

    static imageMap: Map<string, ImageBitmap> = new Map();
    static animationDataMap: Map<string,Animation[]> = new Map();
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
}