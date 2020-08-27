import GameManagerScene from './GameManagerScene';

import 'phaser';
import { GAME } from '../../constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  banner: false,
  audio: {
    noAudio: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 2500 },
    },
  },
  autoFocus: false,
  scene: [GameManagerScene],
};
export default config;
