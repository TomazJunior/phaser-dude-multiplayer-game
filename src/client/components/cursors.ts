export default class Cursors {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  none = true;
  prevNone = true;

  left = false;
  right = false;
  up = false;

  constructor(public scene: Phaser.Scene, private emit: (data: CursorMoviment) => void) {
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.scene.events.on('update', this.update, this);
  }

  cursorsDown(): CursorMoviment {
    return { left: this.left, right: this.right, up: this.up, none: this.none };
  }

  update() {
    if (!this.cursors.left || !this.cursors.right || !this.cursors.up) return;

    this.none = this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown ? false : true;

    if (!this.none || this.none !== this.prevNone) {
      this.left = false;
      this.right = false;
      this.up = false;

      if (this.cursors.left.isDown) {
        this.left = true;
      } else if (this.cursors.right.isDown) {
        this.right = true;
      }

      if (this.cursors.up.isDown) {
        this.up = true;
      }

      console.log('call emit');
      this.emit({ left: this.left, right: this.right, up: this.up, none: this.none });
    }

    this.prevNone = this.none;
  }
}
