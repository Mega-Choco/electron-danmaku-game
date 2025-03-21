import './style.css';
import { Game } from './game';

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

const game: Game = new Game();

function start(){
  previousTime = performance.now();
  targetInterval = 1000 / TARGET_FPS;
  
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

    game.update(deltaTime);
    game.draw(context);
  }
  requestAnimationFrame(loop);
  return;
}


start();