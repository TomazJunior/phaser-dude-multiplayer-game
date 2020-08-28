import { SKINS, STAR } from '../../../constants';

export default class Star extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin = SKINS.STAR;
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
    this.body.setSize(128, 128);
    this.scene = scene;
    this.id = id.toString();
    this.setCollideWorldBounds(true).setOrigin(0.5);
    this.setGravityY(STAR.GRAVITY_Y);
  }

  getFieldsTobeSync(): BaseFieldsToBeSync {
    return {
      x: this.body.position.x + this.body.width / 2,
      y: this.body.position.y + this.body.height / 2,
      skin: this.skin,
      id: this.id,
      hidden: this.hidden,
      scale: null,
    };
  }

  unhide(): void {
    this.body.allowGravity = true;
    this.setActive(true);
    this.hidden = false;
  }

  hide(maxWidthToShowUp: integer): void {
    this.setActive(false);
    this.hidden = true;
    // set position when start will be shown in the next level
    this.setPosition(Phaser.Math.RND.integerInRange(0, maxWidthToShowUp), 0);

    // disable gravity to keep star in the initial position
    this.body.allowGravity = false;
  }

  postUpdate(): void {
    this.prevPosition = { ...this.body.position };
    this.prevHidden = this.hidden;
  }
}
