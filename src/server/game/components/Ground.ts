import { SKINS, GROUND } from '../../../constants';

export default class Ground extends Phaser.Physics.Arcade.Sprite {
  skin: number;
  id: string;

  constructor(scene: Phaser.Scene, id: number, x: number, y: number, skin = SKINS.GROUND_MIDDLE) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.id = id.toString();
    this.body.setSize(GROUND.SIZE, GROUND.SIZE);
    this.setOrigin(0.5);
    this.skin = skin;
  }

  getFieldsTobeSync(): BaseFieldsToBeSync {
    return {
      id: this.id,
      x: this.body.position.x + this.body.width / 2,
      y: this.body.position.y + this.body.height / 2,
      skin: this.skin,
      hidden: null,
      scale: null,
    };
  }
}
