import './style.css';
import 'reflect-metadata';
import { Game } from './game';
import { InputManager } from './manager/input-manager';

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

function start(){
  previousTime = performance.now();
  targetInterval = 1000 / TARGET_FPS;
  InputManager.initialize();
    
  Game.start();
  
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
    update();
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

start();