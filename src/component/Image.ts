import { Component } from "../lib/component";

export class Image extends Component{
    image: ImageBitmap | null = null;
    path: string;
    constructor(path: string){
        super()
        
        this.path = path;
    }
    async init(): Promise<void> {
        const img = await this.loadImageBitmap(this.path);
        this.image = img;
    }

    draw(context: CanvasRenderingContext2D): void {
        if(this.image != null){   
            context.drawImage(
                this.image,
                this.gameObject.transform.position.x,
                this.gameObject.transform.position.y,
                this.image.width,
                this.image.height
            )    
        }
    }

    async loadImageBitmap(path: string): Promise<ImageBitmap> {
        console.log("이미지 로드 시도");
        const res = await fetch(`${path}`, { cache: 'no-store' }); // 캐시 무시
        console.log(res);
        if (!res.ok) throw new Error(`이미지 불러오기 실패: ${res.status}`);
      
        const blob = await res.blob();
        if (blob.size === 0) throw new Error('빈 파일입니다');
      
        return await createImageBitmap(blob); // 여기서 깨지는 경우 많음
      }
}