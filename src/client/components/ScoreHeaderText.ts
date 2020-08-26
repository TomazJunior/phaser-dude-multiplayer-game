import { COLORS } from '../../constants';

export default class ScoreHeaderText extends Phaser.GameObjects.BitmapText {
  private score: integer = 0;
  private prefix: string;

  constructor(scene: Phaser.Scene, x: number, y: number, prefix = '') {
    super(scene, x, y, 'pixelFont', '', 28);
    scene.add.existing(this);
    this.setTint(COLORS.BLACK);
    this.prefix = prefix;
    this.setScore(0);
    this.setScrollFactor(0);
  }

  public setScore(v: integer): void {
    if (v === 0 || v !== this.score) {
      this.score = v;
      this.setScoreFormated();
    }
  }

  public getScore(): integer {
    return this.score;
  }

  private setScoreFormated() {
    this.text = this.prefix + this.score.toString().padStart(6, '0');
  }
}
