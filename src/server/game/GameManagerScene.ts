import { ClientChannel } from '@geckos.io/client';
import geckos, { GeckosServer, iceServers } from '@geckos.io/server';
import { Scene } from 'phaser';

import { STAR, EVENTS } from '../../constants';
import Bomb from './components/Bomb';
import Ground from './components/Ground';
import Map from './components/Map';
import Player from './components/Player';
import Star from './components/Star';

export default class GameManagerScene extends Scene {
  io: GeckosServer;
  bombs: Phaser.GameObjects.Group;
  ground: Phaser.GameObjects.Group;
  // hearts: Phaser.GameObjects.Group;
  players: Phaser.GameObjects.Group;
  stars: Phaser.GameObjects.Group;

  map: Map;
  level = 0;
  id = 0;
  tick: number;

  constructor() {
    super({ key: 'GameManagerScene' });
  }

  init() {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    });
    this.io.addServer(this.game.server);
  }

  create() {
    this.players = this.add.group();
    this.ground = this.add.group();
    this.stars = this.add.group();
    this.bombs = this.add.group();
    this.map = new Map(this, { x: 0 }, this.level);
    this.generateTheLevel();
    this.setupEventListeners();
    this.addCollisions();
  }

  update() {
    this.tick++;
    if (this.tick > 1000000) this.tick = 0;
    this.updateGroup(this.players);
    this.updateGroup(this.stars);
    this.updateGroup(this.bombs);
  }

  private updateGroup(group: Phaser.GameObjects.Group) {
    group.children.iterate((child: Player | Star | Bomb) => {
      child.update();
      const x = child.prevPosition.x.toFixed(0) !== child.body.position.x.toFixed(0);
      const y = child.prevPosition.y.toFixed(0) !== child.body.position.y.toFixed(0);
      const hidden = child.prevHidden !== child.hidden;
      if (x || y || hidden) {
        this.io.emit(EVENTS.UPDATE_OBJECTS, child.getFieldsTobeSync());
      }
      child.postUpdate();
    });
  }

  generateTheLevel() {
    console.log('generateTheLevel called!');
    const level = this.map.getLevel();
    // generate the level
    level.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const xx = x * this.map.tileSize + this.map.margin.x;
        const yy = y * this.map.tileSize + this.map.margin.y;
        if (row[x] === 'X') this.ground.add(new Ground(this, this.newId(), xx, yy));
        // if (row[x] === 'G') this.star = new Star(this, this.newId(), xx, yy);
        // if (row[x] === 'M') this.mummyGroup.add(new Mummy(this, this.newId(), xx, yy));
      }
    });

    const startStepX = 70;
    for (let i = 0; i < STAR.NUMBER_OF_STARS; i++) {
      this.stars.add(new Star(this, this.newId(), 12 + i * startStepX, 0));
    }
  }

  setupEventListeners() {
    this.io.onConnection((channel: ClientChannel) => {
      console.log('Connect user ' + channel.id);
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id);
        const currentPlayer = this.getPlayer(channel.id);
        if (currentPlayer) {
          this.players.remove(currentPlayer);
          this.io.room().emit(EVENTS.DISCONNECT, channel.id);
        }
      });
      channel.emit(EVENTS.READY);
      channel.on(EVENTS.NEW_PLAYER, () => {
        const newPlayer = new Player(this, channel.id, Phaser.Math.RND.integerInRange(100, 700));
        this.players.add(newPlayer);
        channel.emit(EVENTS.CURRENT_OBJECTS, {
          players: this.players.children.entries.map((player: Player) => player.getFieldsTobeSync()),
          ground: this.ground.children.entries.map((ground: Ground) => ground.getFieldsTobeSync()),
          stars: this.stars.children.entries.map((star: Star) => star.getFieldsTobeSync()),
          bombs: this.bombs.children.entries.map((bomb: Bomb) => bomb.getFieldsTobeSync()),
        });
        channel.broadcast.emit(EVENTS.SPAWN_PLAYER, newPlayer.getFieldsTobeSync());
      });

      channel.on(EVENTS.CURSOR_UPDATE, (data: CursorMoviment) => {
        const currentPlayer: Player = this.getPlayer(channel.id);
        if (currentPlayer) {
          currentPlayer.setMove(data);
        }
      });
    });
  }

  addCollisions() {
    // check for collisions between the player and the tiled blocked layer
    this.physics.add.collider(this.players, this.ground);
    this.physics.add.collider(this.stars, this.ground);
    this.physics.add.collider(this.bombs, this.ground);
    this.physics.add.overlap(this.players, this.stars, (player: Player, star: Star) => {
      if (star.hidden) return;
      if (player.hidden || player.hit) return;
      star.hide();
      player.addScore();

      if (this.stars.countActive(true) === 0) {
        this.nextLevel();
      }
    });
    this.physics.add.overlap(this.players, this.bombs, (player: Player, bomb: Bomb) => {
      if (bomb.hidden) return;
      if (player.hidden || player.hit) return;
      player.gotHit();
    });
  }

  nextLevel() {
    console.log('nextlevel!');
    this.stars.children.iterate((star: Star) => {
      star.unhide();
    });
    const bomb: Bomb = this.bombs.getFirstDead();
    if (bomb) {
      bomb.unhide();
    } else {
      this.bombs.add(new Bomb(this, this.newId(), 0, 0));
    }
  }

  getPlayer(playerId: string): Player {
    return <Player>this.players.getChildren().find((p: Player) => {
      return p.playerId === playerId;
    });
  }

  /** Create a new object id */
  newId() {
    return this.id++;
  }
}
