import { Component } from "./component"
import { Transform } from "../component/transform"
import { Vector2 } from "./vector2";
import { Game } from "../game";

export class GameObject{
    name: String = 'unkown';
    transform: Transform = new Transform();
    enabled: boolean = true;

    private components: Component[] = [];
    
    constructor(name: String, position: Vector2 = new Vector2(0,0)){
        this.name = name;
        this.transform.position = position;
    }

    addComponent(component: Component){
        component.gameObject = this;
        this.components.push(component);
    }

    getComponent<T extends Component>(ctor: new (...args: any[]) => T): T | null{
        let component = this.components.find(c=> c instanceof ctor ) as T | null;
        if(component == undefined)
            return null;
        
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
            if(comp.enabled && comp.update){
                comp.update(delta);
            }
        });
    }

    draw(context: CanvasRenderingContext2D){
        this.components.forEach((comp)=>{
            if(comp.enabled && comp.draw){
                comp.draw(context);
            }
        });
    }

    disable(){
        this.components.forEach((comp)=>{
            comp.enabled = false;
        });
        this.enabled = false;    
    }

    enable(){
        this.components.forEach((comp)=>{
            comp.enabled = true;
        });
        
        this.enabled = true;
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
        Game.registerObject(prefab);

        return prefab;
      }
}