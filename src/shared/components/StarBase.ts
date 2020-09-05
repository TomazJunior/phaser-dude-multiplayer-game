export default class StarBase extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin: number;
  id: string;
  constructor(scene: Phaser.Scene, id: string, x: number, y: number, skin: number) {
    super(scene, x, y, skin !== null ? skin.toString() : '');

    this.skin = skin;
    scene.add.existing(this);
    // scene.physics.add.existing(this);
    this.setSize(128, 128);
    this.scene = scene;
    this.id = id;
    // this.setCollideWorldBounds(true).setOrigin(0.5);
    // this.setGravityY(STAR.GRAVITY_Y);
  }
}
