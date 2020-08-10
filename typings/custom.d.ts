declare namespace Phaser {
  interface Game {
    server: import('http').Server;
  }
}

interface PlayerModel {
  x: number;
  y: number;
  skin: number;
  playerId: string;
}

interface CursorMoviment {
  left: boolean;
  right: boolean;
  up: boolean;
  none: boolean;
}

interface Window {
  game: Phaser.Game;
}
