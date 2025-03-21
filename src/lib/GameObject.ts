import { Component } from "../lib/Component"
import { Transform } from "../component/Transform"

export class GameObject{
    name: String = 'unkown';
    transform: Transform = new Transform()

    private components: Component[] = [];
    
    constructor(name: String){
        name = name;
    }

    addComponent(component: Component){
        component.gameObject = this;
        this.components.push(component);
    }

    getComponent<T extends Component>(ctor: new (...args: any[]) => T): T | undefined{
        let component = this.components.find(c=> c instanceof ctor ) as T | undefined;
        if(component == undefined){
            console.error(`cannot find component <${ctor.toString}> in object [${this.name}]`);
        }
        return this.components.find(c=> c instanceof ctor ) as T | undefined;
    } 

    update(delta: number){
        this.components.forEach((comp)=>{
            if(comp.update){
                comp.update(delta);
            }
        });
    }

    draw(context: CanvasRenderingContext2D){
        this.components.forEach((comp)=>{
            if(comp.draw){
                comp.draw(context);
            }
        });
    }

    clone(): GameObject {
        const copy = new GameObject(this.name);
        for (const comp of this.components) {
          const newComp = Object.assign(
            Object.create(Object.getPrototypeOf(comp)),
            comp
          );
          copy.addComponent(newComp);
        }
        return copy;
      }
}