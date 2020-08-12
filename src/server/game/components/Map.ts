export default class Map {
  margin: { x: number; y: number };
  tileSize = 32;
  levels = [
    [
      '                         ',
      '                         ',
      'S                        ',
      'XXX       XXXXXXXX       ',
      '                         ',
      '                         ',
      'XXXXXXXXXX          XXXXX',
      '                         ',
      '                         ',
      'XXXXXXXXXXXXXXXXXXXXXXXXX',
    ],
  ];

  constructor(public scene: Phaser.Scene, public world: any, public level: number) {
    this.margin = {
      y: 3 * this.tileSize + 11 + 16, // 16 is the half of a box
      x: world.x + 16,
    };
  }

  private collideRect(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
  ) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  getTileByCoordinates(coordinates: { x: number; y: number }) {
    const { x: x1, y: y1 } = coordinates;

    let tile = { tile: '', x: -1, y: -1 };

    this.getLevel().forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        let x2 = x * this.tileSize + this.margin.x;
        let y2 = y * this.tileSize + this.margin.y;
        x2 -= 16; // minus the half of a the box
        y2 -= 16; // minus the half of a the box
        if (
          this.collideRect(
            { x: x1, y: y1, width: 1, height: 1 },
            { x: x2, y: y2, width: this.tileSize, height: this.tileSize },
          )
        ) {
          tile = { tile: row[x], x: x2, y: y2 };
          break;
        }
      }
    });

    return tile;
  }
  countTotalLevels() {
    return this.levels.length;
  }

  getLevel() {
    return this.levels[0];
  }
}
