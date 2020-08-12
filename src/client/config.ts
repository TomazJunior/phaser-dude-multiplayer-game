import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  parent: 'phaser-game',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 1500 },
    },
  },
  scene: [BootScene, GameScene],
};

export default config;
