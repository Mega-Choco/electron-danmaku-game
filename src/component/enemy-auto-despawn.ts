import { Component } from "../lib/component";
import { Setting } from "../setting";

export class EnemyAutoDespawn extends Component {
    private hasEnteredActiveArea = false;

    update(): void {
        const deadZoneOffset = Math.max(0, Setting.system.enemyDeadZoneOffset);
        const x = this.gameObject.transform.position.x;
        const y = this.gameObject.transform.position.y;

        const inActiveArea =
            x >= -deadZoneOffset &&
            x <= Setting.screen.width + deadZoneOffset &&
            y >= -deadZoneOffset &&
            y <= Setting.screen.height + deadZoneOffset;

        if (inActiveArea) {
            this.hasEnteredActiveArea = true;
            return;
        }

        if (this.hasEnteredActiveArea) {
            this.gameObject.disable();
        }
    }
}
