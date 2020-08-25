export default class Controls {
  controls: Control[] = [];

  none = true;
  prevNone = true;

  left = false;
  right = false;
  up = false;

  constructor(public scene: Phaser.Scene, private emit: (data: CursorMoviment) => void) {
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
    this.controls.push(left, right, up);
    this.resize();

    this.scene.events.on('update', this.update, this);
  }

  controlsDown() {
    return { left: this.left, right: this.right, up: this.up, none: this.none };
  }

  resize() {
    const SCALE = 1;
    const controlsRadius = (192 / 2) * SCALE;
    const w = this.scene.cameras.main.width - 10 - controlsRadius;
    const h = this.scene.cameras.main.height - 10 - controlsRadius;
    const positions = [
      {
        x: controlsRadius + 10,
        y: h,
      },
      { x: controlsRadius + 214, y: h },
      { x: w, y: h },
    ];
    this.controls.forEach((ctl, i) => {
      ctl.setPosition(positions[i].x, positions[i].y);
      ctl.setScale(SCALE);
    });
  }

  update() {
    this.none = this.left || this.right || this.up ? false : true;

    if (!this.none || this.none !== this.prevNone) {
      this.emit({ left: this.left, right: this.right, up: this.up, none: this.none });
    }

    this.prevNone = this.none;
  }
}

class Control extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, public btn: string) {
    super(scene, x, y, 'controls');
    scene.add.existing(this);

    this.setInteractive().setScrollFactor(0).setAlpha(0.5).setDepth(2);

    if (!scene.sys.game.device.input.touch) this.setAlpha(0);
  }
}
