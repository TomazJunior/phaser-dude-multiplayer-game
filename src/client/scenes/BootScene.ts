import geckos, { ClientChannel } from '@geckos.io/client';
import { Scene } from 'phaser';

import { SKINS, EVENTS } from '../../constants';

export default class BootScene extends Scene {
  channel: ClientChannel = geckos({ port: 3000 });
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.setBaseURL('assets');
    this.load.image('sky', 'sky.png');
    this.load.image('background', 'background.png');
    this.load.image(SKINS.PLATFORM.toString(), 'platform.png');
    this.load.image(SKINS.GROUND_MIDDLE.toString(), 'ground.png');
    this.load.image(SKINS.GROUND_LEFT.toString(), 'ground_left.png');
    this.load.image(SKINS.GROUND_RIGHT.toString(), 'ground_right.png');
    this.load.image(SKINS.STAR.toString(), 'star.png');
    this.load.image(SKINS.BOMB.toString(), 'bomb.png');
    this.load.image(SKINS.HEART.toString(), 'heart.png');
    this.load.image(SKINS.HEART_EMPTY.toString(), 'heart_empty.png');

    this.load.image('controls', 'controls.png');

    this.load.spritesheet(SKINS.DUDE.toString(), 'dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.bitmapFont('pixelFont', 'font/font.png', 'font/font.xml');
  }

  create(): void {
    this.channel.onConnect((error) => {
      if (error) console.error(error.message);
    });
    this.channel.on(EVENTS.READY, () => {
      this.scene.start('MainMenuScene', { channel: this.channel });
    });
  }
}
