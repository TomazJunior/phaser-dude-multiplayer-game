import { ClientChannel } from '@geckos.io/client';
import { Scene } from 'phaser';

import { SKINS, EVENTS, PLAYER } from '../../constants';
import { setPlayerAnimation } from '../components/animations';
import Cursors from '../components/cursors';
import Heart from '../components/Heart';

export default class GameScene extends Scene {
  objects: Record<string, Phaser.GameObjects.Sprite>;
  channel: ClientChannel;
  player: Phaser.GameObjects.Sprite;
  hearts: Phaser.GameObjects.Group;
  cursors: Cursors;
  constructor() {
    super({ key: 'GameScene' });
    this.objects = {};
  }

  init({ channel }: { channel: ClientChannel }) {
    this.channel = channel;
  }

  create() {
    this.hearts = this.add.group();
    this.listenToChannel();
  }

  listenToChannel() {
    this.channel.on(EVENTS.CURRENT_OBJECTS, (objects: CurrentObjects) => {
      [...objects.bombs, ...objects.stars, ...objects.ground].forEach((object) => {
        if (!this.objects[object.id]) {
          const sprite = this.add.sprite(object.x, object.y, object.skin.toString()).setOrigin(0.5);
          this.objects[object.id] = sprite;
          if (object.hidden !== null) sprite.setVisible(!object.hidden);
        }
      });

      objects.players
        .filter((player) => {
          return !this.objects[player.id];
        })
        .forEach((player) => {
          this.createPlayer(player, player.id === this.channel.id);
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
          this.updateDudeObjects(<PlayerFieldsToBeSync>object, sprite, object.id === this.channel.id);
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

  private updateDudeObjects(player: PlayerFieldsToBeSync, sprite: Phaser.GameObjects.Sprite, mainPlayer: boolean) {
    if (player.animation !== null) {
      setPlayerAnimation(sprite, player.animation);
    }
    if (player.alpha !== null) {
      sprite.setAlpha(player.alpha);
    }
    if (mainPlayer && this.hearts && player.life !== null) {
      if (this.hearts.countActive() !== player.life) {
        const heart = <Heart>this.hearts.children
          .getArray()
          .reverse()
          .find((heart) => heart.active);
        if (heart) {
          heart.hide();
        }
      }
    }
  }

  createPlayer(playerFields: PlayerFieldsToBeSync, mainPlayer: boolean) {
    if (!this.objects[playerFields.id]) {
      const sprite = this.add.sprite(playerFields.x, playerFields.y, SKINS.DUDE.toString()).setOrigin(0.5);
      if (mainPlayer) {
        this.player = sprite;
        this.createHearts();
        setPlayerAnimation(this.player, playerFields.animation);
      }

      this.objects[playerFields.id] = sprite;
      if (playerFields.hidden !== null) sprite.setVisible(!playerFields.hidden);
    }
  }

  private createHearts() {
    const heartStepX = 50;
    for (let i = 0; i < PLAYER.MAX_LIFE; i++) {
      this.hearts.add(new Heart(this, i, 48 / 2 + i * heartStepX, 48 / 2));
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
