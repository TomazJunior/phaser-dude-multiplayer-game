import { COLORS } from '../../constants';

export default class Controls {
  controls: Control[] = [];

  none = true;
  prevNone = true;

  left = false;
  right = false;
  up = false;

  buttons: { [key: string]: Control } = {};

  constructor(public scene: Phaser.Scene, private emit: (total: number) => void) {
    // add a second pointer
    scene.input.addPointer();

    const detectPointer = (gameObject: Control, down: boolean) => {
      if (gameObject.btn) {
        switch (gameObject.btn) {
          case 'left':
            this.left = down;
            break;
          case 'right':
            this.right = down;
            break;
          case 'up':
            this.up = down;
            break;
        }
      }
    };
    scene.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Control) =>
      detectPointer(gameObject, true),
    );
    scene.input.on('gameobjectup', (pointer: Phaser.Input.Pointer, gameObject: Control) =>
      detectPointer(gameObject, false),
    );

    const left = new Control(scene, 0, 0, 'left').setRotation(-0.5 * Math.PI);
    const right = new Control(scene, 0, 0, 'right').setRotation(0.5 * Math.PI);
    const up = new Control(scene, 0, 0, 'up');
    this.buttons['left'] = left;
    this.buttons['right'] = right;
    this.buttons['up'] = up;

    this.controls.push(left, right, up);
    this.resize();

    this.scene.events.on('update', this.update, this);
  }

  controlsDown() {
    return { left: this.left, right: this.right, up: this.up, none: this.none };
  }

  resize(): void {
    const offset = 130;
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.buttons.left.x = offset;
    this.buttons.left.y = height - offset;
    this.buttons.right.x = offset * 3;
    this.buttons.right.y = height - offset;
    this.buttons.up.x = width - offset;
    this.buttons.up.y = height - offset;
  }

  update(): void {
    this.none = this.left || this.right || this.up ? false : true;

    if (!this.none || this.none !== this.prevNone) {
      let total = 0;
      if (this.left) total += 1;
      if (this.right) total += 2;
      if (this.up) total += 4;
      if (this.none) total += 8;
      this.emit(total);
    }

    this.prevNone = this.none;
  }
}

class Control extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, public btn: string) {
    super(scene, x, y, 'controls');
    scene.add.existing(this);

    this.setTint(COLORS.BLACK);
    this.setInteractive().setScrollFactor(0).setAlpha(0.5).setDepth(2);

    if (!scene.sys.game.device.input.touch) this.setAlpha(0);
  }
}
