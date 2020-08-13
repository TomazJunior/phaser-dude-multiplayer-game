import { SKINS } from '../../../constants';

export default class Star extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin = SKINS.STAR;
  id: string;
  hidden = false;
  constructor(scene: Phaser.Scene, id: number, x: number, y: number) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(24, 22);
    this.scene = scene;
    this.id = id.toString();
    this.setCollideWorldBounds(true).setOrigin(0);
  }

  getFieldsTobeSync(): FieldsToBeSync {
    return {
      x: this.body.position.x + this.body.width / 2,
      y: this.body.position.y + this.body.height / 2,
      skin: this.skin,
      id: this.id,
      hidden: this.hidden,
    };
  }

  hide(): void {
    this.setActive(false);
    this.hidden = true;
  }
}
