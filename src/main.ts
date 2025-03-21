import './style.css';
import { GameObject } from './lib/GameObject';
import { Player } from './actor/Player';

const TARGET_FPS: number = 60;
let targetInterval: number = 0;
let deltaTime: number = 0;

let currentTime: number = 0;
let previousTime: number = 0;
let accumlatedTime: number = 0;

let canvas = document.getElementById('screen') as HTMLCanvasElement | null;

if(canvas == null)
  throw new Error('Canvas not found!');

if(canvas.getContext("2d") == null)
  throw new Error('no context');

const context: CanvasRenderingContext2D = canvas.getContext("2d")!!;

let gameObjects: GameObject[] = [];

function start(){
  previousTime = performance.now();
  targetInterval = 1000 / TARGET_FPS;
  gameObjects.push(new Player());
  loop();
}

function loop(){
  currentTime = performance.now();
  let elapsedTime = currentTime - previousTime;
  previousTime = currentTime;
  
  accumlatedTime += elapsedTime;
  if(targetInterval <= accumlatedTime){
    deltaTime = accumlatedTime/1000;
    accumlatedTime = 0;
    update(deltaTime);
    draw();
  }
  requestAnimationFrame(loop);
  return;
}

function update(deltaTime: number){
  gameObjects.forEach((obj)=>{
    obj.update(deltaTime)
  });
}

function draw(){
  context?.clearRect(0,0,canvas!!.width, canvas!!.height);
  gameObjects.forEach((obj)=>{
    obj.draw(context);
  });
}

start();