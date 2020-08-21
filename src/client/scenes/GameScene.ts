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

    this.channel.on(EVENTS.UPDATE_OBJECTS, (object: PlayerFieldsToBeSync | BaseFieldsToBeSync) => {
      if (this.objects[object.id]) {
        const sprite = this.objects[object.id];
        if (object.hidden !== null) sprite.setVisible(!object.hidden);
        if (object.x !== null) sprite.x = object.x;
        if (object.y !== null) sprite.y = object.y;
        if (object.skin === SKINS.DUDE) {
          if ((<PlayerFieldsToBeSync>object).animation !== null) {
            setPlayerAnimation(sprite, (<PlayerFieldsToBeSync>object).animation);
          }
        }
        if (object.hidden !== null) sprite.setVisible(!object.hidden);
      } else {
        const sprite = this.add.sprite(object.x, object.y, object.skin.toString()).setOrigin(0.5);
        this.objects[object.id] = sprite;
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
