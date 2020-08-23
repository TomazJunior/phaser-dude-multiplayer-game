import { Scene } from 'phaser';
import { ClientChannel } from '@geckos.io/client';
import MenuText from '../components/MenuText';
import { COLORS } from '../../constants';
import ScoreFinalText from '../components/ScoreFinalText';

export default class GameOverScene extends Scene {
  channel: ClientChannel;
  playersResult: PlayerResult[];
  texts: Phaser.GameObjects.Group;
  posX = 50;
  posY = 50;
  stepY = 50;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(props: { channel: ClientChannel; playersResult: PlayerResult[] }): void {
    const { channel, playersResult } = props;
    this.channel = channel;
    this.playersResult = playersResult;
  }

  create(): void {
    this.texts = this.add.group();
    this.texts.add(new MenuText(this, this.posX, this.posY, 'Score Ranking', COLORS.BLACK, 56));
    this.newLine(2);

    this.playersResult
      .sort((a, b) => b.score - a.score)
      .forEach((item, i) => {
        this.texts.add(new ScoreFinalText(this, this.posX, this.posY, item, i + 1, item.playerId === this.channel.id));
        this.newLine();
      });
    this.newLine(3);
  }

  newLine(lines: integer = 1): void {
    this.posY += this.stepY * lines;
  }
}
