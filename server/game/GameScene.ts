import { ClientChannel } from '@geckos.io/client';
import geckos, { iceServers, GeckosServer } from '@geckos.io/server';
import { Scene } from 'phaser';

export default class GameScene extends Scene {
  io: GeckosServer;
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    });
    this.io.addServer(this.game.server);
  }

  create() {
    this.io.onConnection((channel: ClientChannel) => {
      console.log('Connect user ' + channel.id);
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id);
      });

      channel.emit('ready');
    });
  }
}
