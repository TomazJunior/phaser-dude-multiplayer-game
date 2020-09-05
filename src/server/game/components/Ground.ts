import GroundBase from '../../../shared/components/GroundBase';

export default class Ground extends GroundBase {
  skin: number;
  id: string;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, skin: number) {
    super(scene, id, x, y, null);
    this.skin = skin;
  }

  getFieldsTobeSync(): BaseFieldsToBeSync {
    return {
      id: this.id,
      x: this.x, // + this.body.width / 2,
      y: this.y, // + this.body.height / 2,
      skin: this.skin,
      hidden: null,
      scale: null,
    };
  }
}
