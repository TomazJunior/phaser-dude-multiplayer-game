import { SKINS } from '../../constants';

export default class Heart extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin = SKINS.HEART;
  id: string;
  hidden = false;
  constructor(scene: Phaser.Scene, id: number, x: number, y: number) {
    super(scene, x, y, SKINS.HEART.toString());
    scene.add.existing(this);
    this.scene = scene;
    this.id = id.toString();
  }

  hide(): void {
    this.setActive(false);
    this.hidden = true;
    this.setTexture(SKINS.HEART_EMPTY.toString());
  }

  unhide(): void {
    this.setActive(true);
    this.hidden = false;
    this.setTexture(SKINS.HEART.toString());
  }
}
