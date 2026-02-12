export class SignalBus {
    private static emittedSignals = new Set<string>();

    static emit(signal: string): void {
        if (signal.length === 0) {
            return;
        }
        this.emittedSignals.add(signal);
    }

    static isEmitted(signal: string): boolean {
        if (signal.length === 0) {
            return false;
        }
        return this.emittedSignals.has(signal);
    }

    static clearSignal(signal: string): void {
        if (signal.length === 0) {
            return;
        }
        this.emittedSignals.delete(signal);
    }

    static clear(): void {
        this.emittedSignals.clear();
    }
}
