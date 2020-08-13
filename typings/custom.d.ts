declare namespace Phaser {
  interface Game {
    server: import('http').Server;
  }
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
