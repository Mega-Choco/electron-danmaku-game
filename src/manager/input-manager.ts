import { AssetManager } from "./asset-manager";

export enum InputKey {
    Up = 'Up',
    Down = 'Down',
    Left = 'Left',
    Right = 'Right',
    Slow = 'Slow',
    Shot = 'Shot',
    Pause = 'Pause',
}

const keyBindings: Record<string, InputKey> = {
    'ArrowUp': InputKey.Up,
    'ArrowDown': InputKey.Down,
    'ArrowLeft': InputKey.Left,
    'ArrowRight': InputKey.Right,
    'ShiftLeft': InputKey.Slow,
    'KeyZ': InputKey.Shot,
    'Escape': InputKey.Pause
};

export class InputManager {
    private static storedHoldKeys = new Set<InputKey>();
    private static storedDownKeys = new Set<InputKey>();
    private static storedUpKeys = new Set<InputKey>();

    private static currentHoldKeys = new Set<InputKey>();
    private static currentDownKeys = new Set<InputKey>();
    private static currentUpKeys = new Set<InputKey>();
    private static triedAudioResume = false;


    static initialize() {
        window.addEventListener('keydown', (e) => {
           const inputKey = keyBindings[e.code];
           if (inputKey) {
               if (!InputManager.triedAudioResume) {
                   InputManager.triedAudioResume = true;
                   void AssetManager.resumeAudioContext();
               }
               if (!InputManager.storedHoldKeys.has(inputKey)) {
                   InputManager.storedDownKeys.add(inputKey);
               }
               InputManager.storedHoldKeys.add(inputKey);
           }
       });

       window.addEventListener('keyup', (e) => {
           const inputKey = keyBindings[e.code];
           if (inputKey) {
               InputManager.storedHoldKeys.delete(inputKey);
               InputManager.storedUpKeys.add(inputKey);
           }
       });
    }
   
   static update() {
       InputManager.currentHoldKeys = new Set(InputManager.storedHoldKeys);
       InputManager.currentDownKeys = new Set(InputManager.storedDownKeys);
       InputManager.currentUpKeys = new Set(InputManager.currentUpKeys);
       
       InputManager.storedDownKeys.clear();
       InputManager.storedUpKeys.clear();
   }

   static geyKey(key: InputKey): boolean {
       return InputManager.currentHoldKeys.has(key);
   }

   static getKeyDown(key: InputKey): boolean {
       return InputManager.currentDownKeys.has(key);
   }

   
   static getKeyUp(key: InputKey): boolean {
       return InputManager.currentUpKeys.has(key);
   }
}
