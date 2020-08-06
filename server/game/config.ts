import 'phaser';
import GameScene from './GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: 800,
  height: 600,
  banner: false,
  audio: {
    noAudio: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  autoFocus: false,
  scene: [GameScene],
};
export default config;
