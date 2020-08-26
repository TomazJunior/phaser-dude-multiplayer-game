export default class Map {
  margin: { x: number; y: number };
  tileSize = 32;
  levels = [
    [
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      'XXXX   XXX    XX    XXXXX                        ',
      '                                                 ',
      '                                                 ',
      'XXXXXXX    X   XXXXXXX                           ',
      '                                                 ',
      '                                                 ',
      'XXX    XXXXXXXXXXX     XX                        ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    ],
  ];

  constructor() {
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

  getMaxLength(): integer {
    let max = 0;
    this.levels[0].forEach((row) => {
      max = Math.max(row.length, max);
    });
    return max;
  }
}
