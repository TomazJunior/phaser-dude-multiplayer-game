import { ClientChannel } from '@geckos.io/client';
import { Scene } from 'phaser';

import Cursors from '../components/cursors';
import Player from '../components/Player';
import { SKINS } from '../../constants';

export default class GameScene extends Scene {
  objects: Record<string, Phaser.GameObjects.GameObject>;
  channel: ClientChannel;
  playerId: number;
  player: Phaser.GameObjects.Sprite;
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
    this.listenToChannel();
  }

  listenToChannel() {
    this.channel.on('currentPlayers', (players: Array<PlayerModel>) => {
      players
        .filter((player) => {
          return !this.objects[player.playerId];
        })
        .forEach((player) => {
          if (player.playerId === this.channel.id) {
            this.createPlayer(player, true);
          } else {
            this.createPlayer(player, false);
          }
        });
    });

    this.channel.on('currentGround', (groundPos: Array<{ id: number; x: number; y: number }>) => {
      console.log('groundPos', groundPos);
      groundPos.forEach((ground) => {
        const sprite = this.add.sprite(ground.x, ground.y, SKINS.GROUND.toString()).setOrigin(0.5);
        this.objects[ground.id] = sprite;
      });
    });

    this.channel.on('playerMoved', (player: PlayerModel) => {
      if (this.objects[player.playerId]) {
        (<Player>this.objects[player.playerId]).setPosition(player.x, player.y);
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
    if (!this.objects[playerModel.playerId]) {
      const player = this.add.sprite(playerModel.x, playerModel.y, SKINS.DUDE.toString()).setOrigin(0.5);
      if (mainPlayer) {
        this.player = player;
        this.player.setFrame(4);
      }
      this.objects[playerModel.playerId] = player;
    }
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
