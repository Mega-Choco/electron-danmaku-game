import './style.css';
import 'reflect-metadata';
import { Game } from './game';
import { InputManager } from './manager/input-manager';
import { Setting } from './setting';

let targetInterval: number = 0;
let deltaTime: number = 0;
let currentTime: number = 0;
let previousTime: number = 0;
let accumlatedTime: number = 0;
let canvas = document.getElementById('screen') as HTMLCanvasElement | null;
let isPaused = false;

if(canvas == null)
  throw new Error('Canvas not found!');

if(canvas.getContext("2d") == null)
  throw new Error('no context');

const context: CanvasRenderingContext2D = canvas.getContext("2d")!!;

function initialize(){
  canvas!.width = Setting.screen.width;
  canvas!.height = Setting.screen.height;
  start();
}
function start(){
  targetInterval = 1000 / Setting.system.fps;
  InputManager.initialize();
  
  Game.start();
  previousTime = performance.now();
  loop();
}

function loop(){
  currentTime = performance.now();
  let elapsedTime = currentTime - previousTime;
  previousTime = currentTime;
  accumlatedTime += elapsedTime;

  if(targetInterval <= accumlatedTime){
    while(accumlatedTime >= targetInterval){
      deltaTime = targetInterval/1000;
      update();      
      accumlatedTime -= targetInterval;
    }
    draw();  
  }
  requestAnimationFrame(loop);
  return;
}

function update(){
  Game.update(deltaTime);
}

function draw(){
  context.clearRect(0,0, canvas!!.width, canvas!!.height);
  Game.draw(context);
}

initialize();