import { GameObject } from "./lib/gameObject";

export class Game{
  private objects: GameObject[] = [];

  instantiate(prefab: GameObject): GameObject {
    const obj = prefab.clone()
    this.objects.push(obj)
    return obj
  }

  update(dt: number) {
    for (const obj of this.objects) obj.update(dt)
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const obj of this.objects) obj.draw(ctx)
  }

  getAll(): GameObject[] {
    return this.objects
  }

  clear() {
    this.objects.length = 0
  }

  static instantiate(prefab: GameObject): GameObject {
    const clone = prefab.clone()
    return clone
  }
}