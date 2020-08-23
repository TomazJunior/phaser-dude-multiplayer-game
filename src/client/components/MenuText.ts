import { COLORS } from '../../constants';

export default class MenuText extends Phaser.GameObjects.BitmapText {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, color = COLORS.BLACK, size = 28) {
    super(scene, x, y, 'pixelFont', text, size);
    scene.add.existing(this);
    this.setTint(color);
  }
}
