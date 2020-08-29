export class Button extends Phaser.GameObjects.Text {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
    callback: () => void,
  ) {
    super(scene, x, y, text, { fontSize: '32px', ...style });
    scene.add.existing(this);

    this.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.enterButtonHoverState())
      .on('pointerout', () => this.enterButtonRestState())
      .on('pointerdown', () => this.enterButtonActiveState())
      .on('pointerup', () => {
        this.enterButtonHoverState();
        callback();
      });
  }

  enterButtonHoverState(): void {
    this.setStyle({ fill: '#ff0' });
  }

  enterButtonRestState(): void {
    this.setStyle({ fill: '#000' });
  }

  enterButtonActiveState(): void {
    this.setStyle({ fill: '#0ff' });
  }
}
