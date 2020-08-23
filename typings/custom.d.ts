declare namespace Phaser {
  interface Game {
    server: import('http').Server;
  }
}

interface CurrentObjects {
  players: Array<PlayerFieldsToBeSync>;
  ground: Array<BaseFieldsToBeSync>;
  stars: Array<BaseFieldsToBeSync>;
  bombs: Array<BaseFieldsToBeSync>;
}

interface PlayerFieldsToBeSync extends BaseFieldsToBeSync {
  animation: string;
  hit: boolean;
  alpha: number;
  life: number;
  score: number;
}

interface BaseFieldsToBeSync {
  x: number;
  y: number;
  skin: number;
  id: string;
  hidden: boolean;
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

interface PlayerResult {
  playerId: string;
  score: integer;
}
