import GameManagerScene from './GameManagerScene';

import 'phaser';

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
      gravity: { y: 1500 },
    },
  },
  autoFocus: false,
  scene: [GameManagerScene],
};
export default config;
