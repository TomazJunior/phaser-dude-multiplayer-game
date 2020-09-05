import { GROUND } from '../../constants';

export default class GroundBase extends Phaser.Physics.Arcade.Sprite {
  skin: number;
  id: string;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, skin: number) {
    super(scene, x, y, skin !== null ? skin.toString() : '');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.id = id.toString();
    this.body.setSize(GROUND.SIZE, GROUND.SIZE);
    this.setOrigin(0.5);
    this.skin = skin;
  }
}
