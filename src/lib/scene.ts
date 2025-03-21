import { GameObject } from "./gameObject";

export abstract class Scene{
    // 무엇을 로드해서 Scene에 초기화해주어야하는지
    abstract load(): GameObject[];
}