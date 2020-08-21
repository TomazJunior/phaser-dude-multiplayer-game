import { DUDE_ANIMATIONS, SKINS } from '../../../constants';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin = SKINS.DUDE;
  prevPosition: { x: number; y: number };
  hidden: boolean;
  prevHidden: boolean;
  playerId: string;
  move: CursorMoviment;
  prevNoMovement: boolean;
  shouldUpdate: boolean;
  velocity: number;
  animation: string;
  constructor(scene: Phaser.Scene, playerId: string, x = 200, y = 200) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(32, 48);
    this.scene = scene;
    this.hidden = false;
    this.prevPosition = {
      x: -1,
      y: -1,
    };
    this.prevHidden = false;

    this.playerId = playerId;
    this.move = {
      left: false,
      right: false,
      up: false,
      none: false,
    };

    this.velocity = 160; // the velocity when moving our player

    this.prevNoMovement = true;

    this.setCollideWorldBounds(true).setOrigin(0);
    scene.events.on('update', this.update, this);
  }

  kill(): void {
    this.hidden = true;
    this.animation = DUDE_ANIMATIONS.IDLE;
  }

  revive(): void {
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.setPosition(Phaser.Math.RND.integerInRange(0, 800), Phaser.Math.RND.integerInRange(100, 300));
        this.hidden = false;
        this.setActive(true);
        this.setVelocity(0);
      },
    });
  }

  setMove(data: CursorMoviment): void {
    this.move = data;
    this.shouldUpdate = true;
  }

  update(): void {
    if (!this.shouldUpdate) {
      return;
    }
    this.shouldUpdate = false;

    if (this.move.left) this.setVelocityX(-this.velocity);
    else if (this.move.right) this.setVelocityX(this.velocity);
    else this.setVelocityX(0);

    if (this.move.up && this.body.blocked.down) this.setVelocityY(-600);
    this.animation = DUDE_ANIMATIONS.IDLE;
    if (this.body.velocity.x >= 0.5) {
      this.animation = DUDE_ANIMATIONS.RIGHT;
    } else if (this.body.velocity.x <= -0.5) {
      this.animation = DUDE_ANIMATIONS.LEFT;
    }
  }

  postUpdate(): void {
    this.prevPosition = { ...this.body.position };
    this.prevHidden = this.hidden;
  }

  getFieldsTobeSync(): PlayerFieldsToBeSync {
    return {
      x: this.body.position.x + this.body.width / 2,
      y: this.body.position.y + this.body.height / 2,
      skin: this.skin,
      id: this.playerId,
      animation: this.animation,
      hidden: this.hidden,
    };
  }
}
