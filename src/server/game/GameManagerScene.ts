import { ClientChannel } from '@geckos.io/client';
import geckos, { GeckosServer, iceServers } from '@geckos.io/server';
import { Scene } from 'phaser';

import Player from './components/Player';

export default class GameManagerScene extends Scene {
  io: GeckosServer;
  players: Phaser.GameObjects.Group;
  constructor() {
    super({ key: 'GameManagerScene' });
  }

  init() {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    });
    this.io.addServer(this.game.server);
  }

  create() {
    this.players = this.add.group();
    this.setupEventListeners();
  }

  update() {}

  setupEventListeners() {
    this.io.onConnection((channel: ClientChannel) => {
      console.log('Connect user ' + channel.id);
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id);
        const currentPlayer = this.getPlayer(channel.id);
        if (currentPlayer) {
          this.players.remove(currentPlayer);
          this.io.room().emit('disconnect', channel.id);
        }
      });
      channel.emit('ready');
      channel.on('newPlayer', () => {
        this.players.add(new Player(this, channel.id, Phaser.Math.RND.integerInRange(100, 700)));
        this.io.room().emit(
          'currentPlayers',
          this.players.children.entries.map((player: Player) => player.toModel()),
        );
      });

      channel.on('cursorUpdate', (data: CursorMoviment) => {
        const currentPlayer: Player = this.getPlayer(channel.id);
        if (currentPlayer) {
          currentPlayer.setMove(data);
          this.io.emit('playerMoved', currentPlayer.toModel());
        }
      });
    });
  }

  getPlayer(playerId: string): Player {
    return <Player>this.players.getChildren().find((p: Player) => {
      return p.playerId === playerId;
    });
  }
}
