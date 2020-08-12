import { SKINS } from '../../../constants';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin = SKINS.DUDE;
  prevPosition: { x: number; y: number };
  dead: boolean;
  prevDead: boolean;
  playerId: string;
  move: CursorMoviment;
  prevNoMovement: boolean;
  shouldUpdate: boolean;
  velocity: number;
  constructor(scene: Phaser.Scene, playerId: string, x = 200, y = 200, dummy = false) {
    super(scene, 96, 224, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(32, 48);
    this.scene = scene;

    this.dead = false;
    this.prevPosition = {
      x: -1,
      y: -1,
    };
    this.prevDead = false;

    this.playerId = playerId;
    this.move = {
      left: false,
      right: false,
      up: false,
      none: false,
    };

    this.velocity = 160; // the velocity when moving our player

    this.setDummy(dummy);
    this.prevNoMovement = true;

    this.setCollideWorldBounds(true).setOrigin(0);
    scene.events.on('update', this.update, this);
  }

  setDummy(dummy: boolean) {
    if (dummy) {
      // this.body.setBounce(1);
      this.setBounce(1);
      this.scene.time.addEvent({
        delay: Phaser.Math.RND.integerInRange(45, 90) * 1000,
        callback: () => this.kill(),
      });
    } else {
      this.setBounce(0);
    }
  }

  kill() {
    this.dead = true;
    this.setActive(false);
  }

  revive(playerId: string, dummy: boolean) {
    this.playerId = playerId;
    this.dead = false;
    this.setActive(true);
    this.setDummy(dummy);
    this.setVelocity(0);
  }

  setMove(data: CursorMoviment) {
    this.move = data;
    this.shouldUpdate = true;
  }

  update() {
    if (!this.shouldUpdate) {
      return;
    }
    this.shouldUpdate = false;

    if (this.move.left) this.setVelocityX(-this.velocity);
    else if (this.move.right) this.setVelocityX(this.velocity);
    else this.setVelocityX(0);

    if (this.move.up && this.body.blocked.down) this.setVelocityY(-600);
  }

  postUpdate() {
    this.prevPosition = { ...this.body.position };
    this.prevDead = this.dead;
  }

  toModel(): PlayerModel {
    return {
      x: this.body.position.x + this.body.width / 2,
      y: this.body.position.y + this.body.height / 2,
      skin: this.skin,
      playerId: this.playerId,
    };
  }
}
