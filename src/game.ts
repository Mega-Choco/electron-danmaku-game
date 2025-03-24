import { GameObject } from "./lib/GameObject";

export class Game{
  private objects: GameObject[] = [];

  update(dt: number) {
    for (const obj of this.objects) obj.update(dt)
  }

  draw(ctx: CanvasRenderingContext2D) {
    console.log(`objects: ${this.objects.length}`)
    for (const obj of this.objects) obj.draw(ctx)
  }

  getAll(): GameObject[] {
    return this.objects
  }

  clear() {
    this.objects.length = 0
  }

}