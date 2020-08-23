export default class Map {
  margin: { x: number; y: number };
  tileSize = 32;
  levels = [
    [
      '                         ',
      '                         ',
      '                         ',
      '                         ',
      'XXXX   XXX    XX    XXXXX',
      '                         ',
      '                         ',
      'XXXXXXX    X   XXXXXXX   ',
      '                         ',
      '                         ',
      'XXX    XXXXXXXXXXX     XX',
      '                         ',
      '                         ',
      'XXXXXXXXXXXXXXXXXXXXXXXXX',
    ],
  ];

  constructor(public scene: Phaser.Scene) {
    this.margin = {
      y: 3 * this.tileSize + 11 + 16, // 16 is the half of a box
      x: 16,
    };
  }

  countTotalLevels(): integer {
    return this.levels.length;
  }

  getLevel(): Array<string> {
    return this.levels[0];
  }
}
