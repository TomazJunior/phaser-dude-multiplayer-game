declare namespace Phaser {
  interface Game {
    server: import('http').Server;
  }
}

interface CurrentObjects {
  players: Array<PlayerFieldsToBeSync>;
  ground: Array<BaseFieldsToBeSync>;
  stars: Array<FieldsToBeSync>;
  bombs: Array<FieldsToBeSync>;
}

interface PlayerFieldsToBeSync extends FieldsToBeSync {
  animation: string;
}
interface FieldsToBeSync extends BaseFieldsToBeSync {
  hidden: boolean;
}

interface BaseFieldsToBeSync {
  x: number;
  y: number;
  skin: number;
  id: string;
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
