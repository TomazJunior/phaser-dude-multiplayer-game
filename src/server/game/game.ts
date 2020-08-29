import '@geckos.io/phaser-on-nodejs';
import config from './config';
import RoomManager from '../roomManager';
import GameManagerScene from './GameManagerScene';
export class PhaserGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

const Game = (roomManager: RoomManager, roomId: string): PhaserGame => {
  const cfg = { ...config };
  config.scene = [GameManagerScene];

  cfg.callbacks = {
    preBoot: (): { roomManager: RoomManager; roomId: string } => {
      return { roomManager, roomId };
    },
  };

  return new PhaserGame(cfg);
};

export default Game;
