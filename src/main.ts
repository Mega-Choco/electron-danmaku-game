import './style.css';
import 'reflect-metadata';
import { Game } from './game';
import { InputManager } from './manager/input-manager';
import { Setting } from './setting';

let previousTime: number = 0;
let accumulatedTime: number = 0;
let fixedDelta: number = 1 / Setting.system.fps;
let configuredFps: number = Setting.system.fps;
let smoothedFps: number = Setting.system.fps;
const canvas = document.getElementById('screen') as HTMLCanvasElement | null;

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
  InputManager.initialize();
  Game.start();
  previousTime = performance.now();
  Game.setCurrentFps(Setting.system.fps);
  requestAnimationFrame(loop);
}

function updateLoopSettings(){
  const nextFps = Math.max(1, Setting.system.fps);
  if (nextFps !== configuredFps) {
    configuredFps = nextFps;
    fixedDelta = 1 / configuredFps;
    accumulatedTime = Math.min(accumulatedTime, fixedDelta);
  }
}

function loop(now: number){
  updateLoopSettings();

  let frameTime = (now - previousTime) / 1000;
  previousTime = now;

  const maxFrameTime = Math.max(fixedDelta, Setting.system.maxFrameTime);
  frameTime = Math.min(frameTime, maxFrameTime);
  if (frameTime > 0) {
    const instantFps = 1 / frameTime;
    const smoothing = Math.min(1, Math.max(0, Setting.system.fpsSmoothingFactor));
    smoothedFps += (instantFps - smoothedFps) * smoothing;
    Game.setCurrentFps(smoothedFps);
  }

  accumulatedTime += frameTime;

  InputManager.update();

  const maxSteps = Math.max(1, Math.floor(Setting.system.maxUpdateStepsPerFrame));
  let stepCount = 0;
  while (accumulatedTime >= fixedDelta && stepCount < maxSteps) {
    update(fixedDelta);
    accumulatedTime -= fixedDelta;
    stepCount++;
  }

  if (stepCount === maxSteps && accumulatedTime >= fixedDelta) {
    accumulatedTime = 0;
  }

  draw();
  requestAnimationFrame(loop);
}

function update(delta: number){
  Game.update(delta);
}

function draw(){
  context.clearRect(0,0, canvas!!.width, canvas!!.height);
  Game.draw(context);
}

initialize();
