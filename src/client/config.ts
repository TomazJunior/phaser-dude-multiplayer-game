import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import { GAME } from '../constants';
import GameOverScene from './scenes/GameOverScene';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  parent: 'phaser-game',
  scale: {
    mode: Phaser.Scale.NONE,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 1500 },
    },
  },
  scene: [BootScene, GameScene, GameOverScene],
};

export default config;
