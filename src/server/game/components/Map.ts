export default class Map {
  margin: { x: number; y: number };
  tileSize = 32;
  levels = [
    [
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '1                                                ',
      'XXXX   XXX    XX    XXXXX                        ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                  5              ',
      'XXXXXXX            XXXX      XXXXXXX             ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                       4                         ',
      'XXX    XXXXXXXXXXX     XX                        ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '                                                 ',
      '2                                               3',
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

  getMaxWidth(): number {
    return this.levels[0][0].length * this.tileSize;
  }

  getMaxHeight(): integer {
    const paddingTop = 4 * this.tileSize;
    return this.levels[0].length * this.tileSize + paddingTop;
  }
}
