import { DUDE_ANIMATIONS, SKINS } from '../../../constants';
import PlayerBase from '../../../shared/components/PlayerBase';

export default class Player extends PlayerBase {
  prevPosition: { x: number; y: number };
  hidden: boolean;
  prevHidden: boolean;
  prevHit: boolean;
  prevNoMovement: boolean;
  hit = false;
  alpha = 1;
  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, x, y, null);
    this.skin = SKINS.DUDE;
    this.hidden = false;
    this.prevPosition = {
      x: -1,
      y: -1,
    };
    this.prevHidden = false;
    this.prevHit = false;

    this.id = id;
    this.move = {
      left: false,
      right: false,
      up: false,
      none: false,
    };

    this.prevNoMovement = true;

    this.setInvunerableState();
    scene.events.on('update', this.update, this);
  }

  postUpdate(): void {
    this.prevPosition = { x: this.x, y: this.y };
    this.prevHidden = this.hidden;
    this.prevHit = this.hit;
  }

  gotHit(): void {
    if (this.hit) return;
    this.life--;
    if (this.life === 0) {
      this.kill();
      return;
    }
    this.setInvunerableState();
  }

  setInvunerableState(delay = 3000): void {
    this.hit = true;
    this.alpha = 0.6;
    this.scene.time.addEvent({
      delay,
      callback: () => {
        this.hit = false;
        this.alpha = 1;
      },
    });
  }

  addScore(): void {
    this.score += 10;
  }

  kill(): void {
    this.hidden = true;
    this.animation = DUDE_ANIMATIONS.IDLE;
    this.setActive(false);
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

  getFieldsTobeSync(): PlayerFieldsToBeSync {
    return {
      x: this.x, // + this.body.width / 2,
      y: this.y, // + this.body.height / 2,
      skin: this.skin,
      id: this.id,
      animation: this.animation,
      hidden: this.hidden,
      hit: this.hit,
      alpha: this.alpha,
      life: this.life,
      score: this.score,
      scale: this.scale,
    };
  }
}
