import { SKINS } from '../../constants';

export default class Player extends Phaser.GameObjects.Sprite {
  channelId: string;
  constructor(scene: Phaser.Scene, channelId: string, x: number, y: number) {
    super(scene, x, y, SKINS.DUDE.toString());
    scene.add.existing(this);
    this.channelId = channelId;
    this.setFrame(4);
  }
}
