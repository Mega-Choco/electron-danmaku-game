// src/main.ts

import './style.css';
import {Vector2} from './lib/vector2';


const TARGET_FPS: number = 60;

let targetInterval: number = 0;

let deltaTime: number = 0;

let currentTime: number = 0;
let previousTime: number = 0;
let accumlatedTime: number = 0;


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
    update(deltaTime);
  }
  requestAnimationFrame(loop);
  return;
}

function update(deltaTime: number){
  //console.log(`current delta: ${deltaTime}`);
}

start();