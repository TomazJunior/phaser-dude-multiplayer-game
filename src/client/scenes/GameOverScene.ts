import { Scene } from 'phaser';
import { ClientChannel } from '@geckos.io/client';
import MenuText from '../components/MenuText';
import { COLORS } from '../../constants';
import ScoreFinalText from '../components/ScoreFinalText';
import Background from '../components/background';
import { Button } from '../components/Button';

export default class GameOverScene extends Scene {
  background: Background;
  channel: ClientChannel;
  playersResult: PlayerResult[];
  texts: Phaser.GameObjects.Group;
  posX = 50;
  posY = 50;
  stepY = 50;
  goToMainMenuButton: Button;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(props: { channel: ClientChannel; playersResult: PlayerResult[] }): void {
    const { channel, playersResult } = props;
    this.channel = channel;
    this.playersResult = playersResult;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ade6ff');
    this.cameras.main.stopFollow();
    this.cameras.main.setPosition(0, 0);

    this.background = new Background(this);
    this.scale.on('resize', (gameSize: any) => {
      if (!gameSize || !this.cameras.main) return;
      this.cameras.main.width = gameSize.width;
      this.cameras.main.height = gameSize.height;
      this.background.adjustPosition();
    });
    this.background.adjustPosition();

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

    this.goToMainMenuButton = new Button(this, this.posX, this.posY, 'MAIN MENU', { color: '#000' }, () =>
      this.mainMenuGame(),
    );
  }

  newLine(lines: integer = 1): void {
    this.posY += this.stepY * lines;
  }

  mainMenuGame(): void {
    this.scene.stop();
    this.scene.start('MainMenuScene', { channel: this.channel });
  }
}
