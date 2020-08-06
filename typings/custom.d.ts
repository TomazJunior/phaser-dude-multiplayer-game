declare namespace Phaser {
  interface Game {
    server: import('http').Server;
  }
}

interface Window {
  game: Phaser.Game;
}
