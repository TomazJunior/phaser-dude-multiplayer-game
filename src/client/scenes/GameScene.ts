import { ClientChannel } from '@geckos.io/client';
import { Scene } from 'phaser';

import Cursors from '../components/cursors';
import Player from '../components/Player';
import { SKINS } from '../../constants';
import { setPlayerAnimation } from '../components/animations';

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
    this.channel.on('currentPlayers', (players: Array<PlayerFieldsToBeSync>) => {
      players
        .filter((player) => {
          return !this.objects[player.id];
        })
        .forEach((player) => {
          if (player.id === this.channel.id) {
            this.createPlayer(player, true);
          } else {
            this.createPlayer(player, false);
          }
        });
    });

    this.channel.on('currentGround', (groundPos: Array<{ id: number; x: number; y: number }>) => {
      groundPos.forEach((ground) => {
        const sprite = this.add.sprite(ground.x, ground.y, SKINS.GROUND.toString()).setOrigin(0.5);
        this.objects[ground.id] = sprite;
      });
    });

    this.channel.on('playerMoved', (playerFields: PlayerFieldsToBeSync) => {
      if (this.objects[playerFields.id]) {
        const player = <Player>this.objects[playerFields.id];
        player.setPosition(playerFields.x, playerFields.y);
        if (playerFields.animation) {
          setPlayerAnimation(player, playerFields.animation);
        }
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

  createPlayer(playerFields: PlayerFieldsToBeSync, mainPlayer: boolean) {
    if (!this.objects[playerFields.id]) {
      const player = this.add.sprite(playerFields.x, playerFields.y, SKINS.DUDE.toString()).setOrigin(0.5);
      if (mainPlayer) {
        this.player = player;
        setPlayerAnimation(player, playerFields.animation);
      }
      this.objects[playerFields.id] = player;
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
