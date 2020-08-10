import '@geckos.io/phaser-on-nodejs';
import config from './config';
import { Server } from 'http';

export default class PhaserGame extends Phaser.Game {
  server: Server;
  constructor(server: Server) {
    super(config);
    this.server = server;
  }
}
