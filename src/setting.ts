export class Setting{
    static screen = {
        width: 800,
        height: 600,
      };

    static system = {
        fps: 60,
        bulletDeadZoneOffset: 80,
        enemyDeadZoneOffset: 120,
        maxFrameTime: 0.25,
        maxUpdateStepsPerFrame: 5,
        fpsSmoothingFactor: 0.1,
        drawCollisionDebugGrid: true,
        drawBulletPoolDebugInfo: true,
        drawFormationPathDebug: true,
        formationPathPreviewSeconds: 3.5,
        formationPathSampleCount: 56,
        bulletPoolPrewarmCount: 96,
        playerShotInterval: 0.05,
        playerShotSpeed: 700,
        playerShotRadius: 6,
        playerShotSpawnOffsetY: 18,
    };
}
