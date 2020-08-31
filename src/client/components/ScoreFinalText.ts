import { COLORS } from '../../constants';

export default class ScoreFinalText extends Phaser.GameObjects.BitmapText {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerResult: PlayerResult,
    pos: integer,
    mainPlayer: boolean,
  ) {
    super(scene, x, y, 'pixelFont', '', 48);
    scene.add.existing(this);
    this.setTint(mainPlayer ? COLORS.BLUE : COLORS.BLACK);
    this.text = this.getPosFormated(pos) + this.getSpaces(8) + this.getScoreFormated(playerResult.score);
    this.setScrollFactor(0);
  }

  private getPosFormated(pos: integer): string {
    if (pos === 1) return '1st  ';
    if (pos === 2) return '2rd';
    return `${pos}rd`;
  }

  private getScoreFormated(score: integer): string {
    return score.toString().padStart(6, '0');
  }

  private getPlayerFormated(name: string): string {
    return name.toString().padStart(20, ' ');
  }

  private getSpaces(value: integer) {
    return ' '.padStart(value, ' ');
  }
}
