import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import { GAME } from '../constants';
import GameOverScene from './scenes/GameOverScene';
import MainMenuScene from './scenes/MainMenuScene';

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
      gravity: { y: 2500 },
    },
  },
  scene: [BootScene, MainMenuScene, GameScene, GameOverScene],
};

export default config;
