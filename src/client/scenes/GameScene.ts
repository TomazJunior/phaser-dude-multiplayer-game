import { ClientChannel } from '@geckos.io/client';
import { Scene } from 'phaser';

import { SKINS, EVENTS } from '../../constants';
import { setPlayerAnimation } from '../components/animations';
import Cursors from '../components/cursors';

export default class GameScene extends Scene {
  objects: Record<string, Phaser.GameObjects.Sprite>;
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
    this.channel.on(EVENTS.CURRENT_OBJECTS, (objects: CurrentObjects) => {
      objects.bombs.forEach((bomb) => {
        const sprite = this.add.sprite(bomb.x, bomb.y, bomb.skin.toString()).setOrigin(0.5);
        this.objects[bomb.id] = sprite;
      });

      objects.ground.forEach((ground) => {
        const sprite = this.add.sprite(ground.x, ground.y, ground.skin.toString()).setOrigin(0.5);
        this.objects[ground.id] = sprite;
      });

      objects.players
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

      objects.stars.forEach((star) => {
        const sprite = this.add.sprite(star.x, star.y, star.skin.toString()).setOrigin(0.5);
        this.objects[star.id] = sprite;
      });
    });

    this.channel.on(EVENTS.SPAWN_PLAYER, (player: PlayerFieldsToBeSync) => {
      this.createPlayer(player, false);
    });

    this.channel.on('playerMoved', (playerFields: PlayerFieldsToBeSync) => {
      if (this.objects[playerFields.id]) {
        const player = this.objects[playerFields.id];
        player.setPosition(playerFields.x, playerFields.y);
        if (playerFields.animation) {
          setPlayerAnimation(player, playerFields.animation);
        }
        if (playerFields.hidden !== null) player.setVisible(!playerFields.hidden);
      }
    });

    this.channel.on('bombMoved', (bombFields: PlayerFieldsToBeSync) => {
      if (this.objects[bombFields.id]) {
        const bomb = this.objects[bombFields.id];
        if (bombFields.hidden !== null) bomb.setVisible(!bombFields.hidden);
        if (bombFields.x !== null) bomb.x = bombFields.x;
        if (bombFields.y !== null) bomb.y = bombFields.y;
      } else {
        const sprite = this.add.sprite(bombFields.x, bombFields.y, bombFields.skin.toString()).setOrigin(0.5);
        this.objects[bombFields.id] = sprite;
      }
    });

    this.channel.on('starUpdated', (starFields: FieldsToBeSync) => {
      if (this.objects[starFields.id]) {
        const star = this.objects[starFields.id];
        if (starFields.hidden !== null) star.setVisible(!starFields.hidden);
        if (starFields.x !== null) star.x = starFields.x;
        if (starFields.y !== null) star.y = starFields.y;
      }
    });

    this.channel.on(EVENTS.DISCONNECT, (playerId: string) => {
      console.log('disconnect ', playerId);
      if (this.objects[playerId]) {
        this.objects[playerId].destroy(true);
        delete this.objects[playerId];
      }
    });

    this.channel.emit(EVENTS.NEW_PLAYER);
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
      this.channel.emit(EVENTS.CURSOR_UPDATE, data);
    });
  }
}
