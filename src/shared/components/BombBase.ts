import { BOMB } from '../../constants';

export default class BombBase extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;
  skin: number;
  id: string;
  scale = BOMB.SCALE;
  constructor(scene: Phaser.Scene, id: string, x: number, y: number, skin: number) {
    super(scene, x, y, skin !== null ? skin.toString() : '');

    this.skin = skin;
    scene.add.existing(this);
    // scene.physics.add.existing(this);
    this.setSize(14, 14);
    this.scene = scene;
    this.id = id.toString();
    // this.setBounce(1, 1).setCollideWorldBounds(true).setVelocity(Phaser.Math.Between(-150, 150), -20);
    this.setScale(this.scale);
  }
}
