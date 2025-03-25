import { Component } from "./component"
import { Transform } from "../component/transform"
import { SceneManager } from "../sceneManager";
import { Vector2 } from "./vector2";

export class GameObject{
    name: String = 'unkown';
    transform: Transform = new Transform()

    private components: Component[] = [];
    
    constructor(name: String, position: Vector2 = new Vector2(0,0)){
        name = name;
        this.transform.position = position;
    }

    addComponent(component: Component){
        component.gameObject = this;
        this.components.push(component);
    }

    getComponent<T extends Component>(ctor: new (...args: any[]) => T): T | null{
        let component = this.components.find(c=> c instanceof ctor ) as T | null;
        if(component == undefined){
            console.error(`cannot find component <${ctor.toString}> in object [${this.name}]`);
        }
        return this.components.find(c=> c instanceof ctor ) as T | null;
    } 

    async init(){
        this.components.forEach(async comp => {
            if(comp.init){
                await comp.init();
            }
        });
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
        const copy = new GameObject(this.name, this.transform.position);
        for (const comp of this.components) {
          const newComp = Object.assign(
            Object.create(Object.getPrototypeOf(comp)),
            comp
          );
          copy.addComponent(newComp);
        }
        return copy;
      }


      static instantiate(prefab: GameObject): GameObject {
        const clone = prefab.clone();
        SceneManager.addToCurrentScene(clone);

        return clone;
      }
}