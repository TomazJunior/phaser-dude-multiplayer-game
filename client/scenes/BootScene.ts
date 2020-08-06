import { Scene } from 'phaser';
import geckos, { ClientChannel } from '@geckos.io/client';
import { SKINS } from '../../constants';

export default class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' });

    const channel: ClientChannel = geckos({ port: 3000 });

    channel.onConnect((error) => {
      if (error) console.error(error.message);
      channel.on('ready', () => {
        this.scene.start('GameScene', { channel });
      });
    });
  }

  preload() {
    this.load.setBaseURL('assets');
    this.load.image('sky', 'sky.png');
    this.load.image(SKINS.PLATFORM.toString(), 'platform.png');
    this.load.image(SKINS.STAR.toString(), 'star.png');
    this.load.image(SKINS.BOMB.toString(), 'bomb.png');
    this.load.image('controls', 'controls.png');

    this.load.spritesheet(SKINS.DUDE.toString(), 'dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.bitmapFont('pixelFont', 'font/font.png', 'font/font.xml');
  }
}
