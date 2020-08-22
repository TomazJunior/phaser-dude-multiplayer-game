import { SKINS } from '../../../constants';

export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin = SKINS.BOMB;
  id: string;
  hidden = false;
  prevHidden = false;
  prevPosition: { x: number; y: number };
  constructor(scene: Phaser.Scene, id: number, x: number, y: number) {
    super(scene, x, y, '');
    this.prevPosition = {
      x: -1,
      y: -1,
    };
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(14, 14);
    this.scene = scene;
    this.id = id.toString();
    this.setBounce(1, 1).setCollideWorldBounds(true).setVelocity(Phaser.Math.Between(-200, 200), -20);
    scene.events.on('update', this.update, this);
  }

  getFieldsTobeSync(): BaseFieldsToBeSync {
    return {
      x: this.body.position.x + this.body.width / 2,
      y: this.body.position.y + this.body.height / 2,
      skin: this.skin,
      id: this.id,
      hidden: this.hidden,
    };
  }

  postUpdate(): void {
    this.prevPosition = { ...this.body.position };
    this.prevHidden = this.hidden;
  }

  hide(): void {
    this.setActive(false);
    this.hidden = true;
  }

  unhide(): void {
    this.setActive(true);
    this.hidden = false;
  }
}
