import { GROUND } from '../../../constants';

export default class Map {
  margin: { x: number; y: number };
  tileSize = GROUND.SIZE;
  levels = [
    [
      '            ',
      '            ',
      '            ',
      '   4        ',
      '  [X]       ',
      '         5  ',
      ' [XXX]  [X] ',
      '      3     ',
      '    [XXX]   ',
      '1          2',
      '[XXXXXXXXXX]',
    ],
  ];

  constructor() {
    const halfSize = this.tileSize / 2;
    this.margin = {
      y: 3 * this.tileSize + halfSize, // 16 is the half of a box
      x: halfSize,
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
    const paddingTop = 3 * this.tileSize;
    return this.levels[0].length * this.tileSize + paddingTop;
  }
}
