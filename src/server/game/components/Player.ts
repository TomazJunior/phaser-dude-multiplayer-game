import { SKINS } from '../../../constants';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin = SKINS.DUDE;
  prevX: number;
  prevY: number;
  dead: boolean;
  prevDead: boolean;
  playerId: string;
  move: CursorMoviment;
  prevNoMovement: boolean;
  shouldUpdate: boolean;
  constructor(scene: Phaser.Scene, playerId: string, x = 200, y = 200, dummy = false) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;

    this.prevX = -1;
    this.prevY = -1;

    this.dead = false;
    this.prevDead = false;

    this.playerId = playerId;
    this.move = {
      left: false,
      right: false,
      up: false,
      none: false,
    };

    this.setDummy(dummy);

    this.body.setSize(32, 48);

    this.prevNoMovement = true;

    this.setCollideWorldBounds(true);

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
    if (!this.shouldUpdate) return;
    this.shouldUpdate = false;

    if (this.move.left) this.setVelocityX(-160);
    else if (this.move.right) this.setVelocityX(160);
    else this.setVelocityX(0);

    if (this.move.up && this.body.onFloor()) this.setVelocityY(-550);
  }

  postUpdate() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.prevDead = this.dead;
  }

  toModel(): PlayerModel {
    return {
      x: this.x,
      y: this.y,
      skin: this.skin,
      playerId: this.playerId,
    };
  }
}
