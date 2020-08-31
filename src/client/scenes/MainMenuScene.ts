import { Scene } from 'phaser';
import Background from '../components/background';
import { ClientChannel } from '@geckos.io/client';
import { Button } from '../components/Button';

export default class MainMenuScene extends Scene {
  background: Background;
  channel: ClientChannel;
  startGameButton: Button;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  init({ channel }: { channel: ClientChannel }): void {
    this.channel = channel;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ade6ff');
    this.cameras.main.fadeIn();
    this.background = new Background(this);
    this.scale.on('resize', (gameSize: any) => {
      if (!gameSize || !this.cameras.main) return;
      this.cameras.main.width = gameSize.width;
      this.cameras.main.height = gameSize.height;
      this.background.adjustPosition();
    });
    this.background.adjustPosition();

    this.startGameButton = new Button(this, 100, 100, 'START GAME', { color: '#000' }, () => this.startGame());
  }

  startGame(): void {
    console.log('start game!!');
    this.scene.stop();
    this.scene.start('GameScene', { channel: this.channel });
  }
}
