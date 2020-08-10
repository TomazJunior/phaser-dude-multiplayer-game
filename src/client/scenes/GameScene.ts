import { ClientChannel } from '@geckos.io/client';
import { GameObjects, Scene } from 'phaser';

import Cursors from '../components/cursors';
import Player from '../components/Player';

interface ObjectInfo {
  sprite: GameObjects.GameObject;
}

export default class GameScene extends Scene {
  objects: Record<string, Player>;
  channel: ClientChannel;
  playerId: number;
  player: Player;
  cursors: Cursors;
  constructor() {
    super({ key: 'GameScene' });
    this.objects = {};
    this.playerId;
  }

  init({ channel }: { channel: ClientChannel }) {
    this.channel = channel;
  }

  create() {
    this.channel.on('currentPlayers', (players: Array<PlayerModel>) => {
      players
        .filter((player) => {
          return !this.objects[player.playerId];
        })
        .forEach((player) => {
          if (player.playerId === this.channel.id) {
            this.createPlayer(player, true);
            // this.addCollisions();
          } else {
            this.createPlayer(player, false);
          }
        });
    });

    this.channel.on('playerMoved', (player: PlayerModel) => {
      if (this.objects[player.playerId]) {
        this.objects[player.playerId].setPosition(player.x, player.y);
      }
    });

    this.channel.on('disconnect', (playerId: string) => {
      console.log('disconnect ', playerId);
      if (this.objects[playerId]) {
        this.objects[playerId].destroy(true);
        delete this.objects[playerId];
      }
    });

    this.channel.emit('newPlayer');

    this.createInput();
  }

  createPlayer(playerModel: PlayerModel, mainPlayer: boolean) {
    const player = new Player(this, playerModel.playerId, playerModel.x, playerModel.y);
    if (mainPlayer) {
      this.player = player;
    }
    this.objects = { ...this.objects, [playerModel.playerId]: player };
  }

  update() {
    if (this.player) this.player.update(this.cursors);
  }

  createInput() {
    this.cursors = new Cursors(this, (data: any) => {
      this.channel.emit('cursorUpdate', data);
    });
  }
}
