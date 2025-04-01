export enum InputKey {
    Up = 'Up',
    Down = 'Down',
    Left = 'Left',
    Right = 'Right',
    Slow = 'Slow',
    Shot = 'Shot'
}

const keyBindings: Record<string, InputKey> = {
    'ArrowUp': InputKey.Up,
    'ArrowDown': InputKey.Down,
    'ArrowLeft': InputKey.Left,
    'ArrowRight': InputKey.Right,
    'ShiftLeft': InputKey.Slow,
    'KeyZ': InputKey.Shot,
};

export class InputManager {
    private static keys = new Set<InputKey>();

    static initialize() {
        window.addEventListener('keydown', (e) => {
            if (!e.repeat && keyBindings[e.code]) {
                InputManager.keys.add(keyBindings[e.code]);
            }
        });

        window.addEventListener('keyup', (e) => {
            const inputKey = keyBindings[e.code];
            if (inputKey) {
                InputManager.keys.delete(inputKey);
            }
        });
    }

    static isPressed(key: InputKey): boolean {
        return InputManager.keys.has(key);
    }
}