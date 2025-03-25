import { Component } from "../lib/component";
import { Vector2 } from "../lib/vector2";

export class Image extends Component{
    image: ImageBitmap | null = null;
    offset: Vector2 = new Vector2();
    width: number | null = null;
    height: number | null = null;

    path: string;

    constructor(path: string, width: number | null = null, height: number | null = null
    ){
        super()
        
        this.path = path;
        this.width = width;
        this.height = height;
    }
    async init(): Promise<void> {
        const img = await this.loadImageBitmap(this.path);
        this.image = img;
    }

    draw(context: CanvasRenderingContext2D): void {
        if(this.image != null){   
            const offsetX = this.image.width / 2;
            const offsetY = this.image.height / 2;

            context.drawImage(
                this.image,
                this.gameObject.transform.position.x - offsetX,
                this.gameObject.transform.position.y - offsetY,
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