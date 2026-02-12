import { Component } from "../lib/component";

export class Health extends Component {
    private maxHealth: number;
    private currentHealth: number;
    private dead: boolean = false;
    private onDeathHandler: ((health: Health) => void) | null = null;

    constructor(maxHealth: number) {
        super();
        this.maxHealth = Math.max(1, Math.floor(maxHealth));
        this.currentHealth = this.maxHealth;
    }

    setOnDeath(handler: (health: Health) => void): void {
        this.onDeathHandler = handler;
    }

    takeDamage(amount: number): void {
        if (this.dead || amount <= 0) {
            return;
        }

        this.currentHealth = Math.max(0, this.currentHealth - amount);
        if (this.currentHealth === 0) {
            this.dead = true;
            this.gameObject.disable();
            this.onDeathHandler?.(this);
        }
    }

    heal(amount: number): void {
        if (this.dead || amount <= 0) {
            return;
        }
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }

    reset(): void {
        this.dead = false;
        this.currentHealth = this.maxHealth;
    }

    getCurrentHealth(): number {
        return this.currentHealth;
    }

    getMaxHealth(): number {
        return this.maxHealth;
    }

    isDead(): boolean {
        return this.dead;
    }
}
