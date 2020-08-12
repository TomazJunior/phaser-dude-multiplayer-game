import { SKINS } from '../../../constants';

export default class Ground extends Phaser.Physics.Arcade.Sprite {
  skin = SKINS.GROUND;
  id: string;

  constructor(scene: Phaser.Scene, id: number, x: number, y: number) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.id = id.toString();
    this.body.setSize(32, 32);
  }

  toModel() {
    return {
      id: this.id,
      x: this.body.position.x + this.body.width / 2,
      y: this.body.position.y + this.body.height / 2,
    };
  }
}
