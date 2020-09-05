import { DUDE_ANIMATIONS, PLAYER } from '../../constants';

export default class PlayerBase extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin: number;
  id: string;
  velocity: number;
  life = PLAYER.MAX_LIFE;
  score = 0;
  scale = PLAYER.SCALE;
  move: CursorMoviment;
  shouldUpdate: boolean;
  animation: string;
  main: boolean;
  constructor(scene: Phaser.Scene, id: string, x: number, y: number, skin: number) {
    super(scene, x, y, skin !== null ? skin.toString() : '');
    this.skin = skin;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.id = id.toString();
    this.body.setSize(32, 48);
    this.setOrigin(0.5);
    this.scene = scene;
    this.velocity = 200; // the velocity when moving our player
    this.setScale(this.scale);
    this.setCollideWorldBounds(true).setOrigin(0.5);
    this.shouldUpdate = false;
  }

  setMove(data: CursorMoviment): void {
    this.move = data;
    // this.shouldUpdate = true;
  }

  update(): void {
    // if (!this.shouldUpdate) {
    //   return;
    // }
    // this.shouldUpdate = false;

    if (this.move.left) this.setVelocityX(-this.velocity);
    else if (this.move.right) this.setVelocityX(this.velocity);
    else this.setVelocityX(0);

    if (this.move.up && this.body.blocked.down) this.setVelocityY(-1250);
    this.animation = DUDE_ANIMATIONS.IDLE;
    if (this.body.velocity.x >= 0.5) {
      this.animation = DUDE_ANIMATIONS.RIGHT;
    } else if (this.body.velocity.x <= -0.5) {
      this.animation = DUDE_ANIMATIONS.LEFT;
    }
  }
}
