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
  players: Phaser.GameObjects.Group;
  ground: Phaser.GameObjects.Group;
  stars: Phaser.GameObjects.Group;
  bombs: Phaser.GameObjects.Group;

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
    this.players.children.iterate((child: Player) => {
      child.update();
      const x = child.prevPosition.x.toFixed(0) !== child.body.position.x.toFixed(0);
      const y = child.prevPosition.y.toFixed(0) !== child.body.position.y.toFixed(0);
      if (x || y) {
        this.io.emit('playerMoved', child.getFieldsTobeSync());
      }
      child.postUpdate();
    });

    this.stars.children.iterate((star: Star) => {
      star.update();
      const x = star.prevPosition.x.toFixed(0) !== star.body.position.x.toFixed(0);
      const y = star.prevPosition.y.toFixed(0) !== star.body.position.y.toFixed(0);
      if (x || y || star.hidden !== star.prevHidden) {
        this.io.emit('starUpdated', star.getFieldsTobeSync());
      }
      star.postUpdate();
    });

    this.bombs.children.iterate((bomb: Bomb) => {
      bomb.update();
      const x = bomb.prevPosition.x.toFixed(0) !== bomb.body.position.x.toFixed(0);
      const y = bomb.prevPosition.y.toFixed(0) !== bomb.body.position.y.toFixed(0);
      if (x || y || bomb.hidden !== bomb.prevHidden) {
        this.io.emit('bombMoved', bomb.getFieldsTobeSync());
      }
      bomb.postUpdate();
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

    const stepX = 70;
    for (let i = 0; i < STAR.NUMBER_OF_STARS; i++) {
      this.stars.add(new Star(this, this.newId(), 12 + i * stepX, 0));
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
          this.io.room().emit('disconnect', channel.id);
        }
      });
      channel.emit('ready');
      channel.on('newPlayer', () => {
        const newPlayer = new Player(this, channel.id, Phaser.Math.RND.integerInRange(100, 700));
        this.players.add(newPlayer);
        channel.emit(EVENTS.CURRENT_OBJECTS, {
          players: this.players.children.entries.map((player: Player) => player.getFieldsTobeSync()),
          ground: this.ground.children.entries.map((ground: Ground) => ground.getFieldsTobeSync()),
          stars: this.stars.children.entries.map((star: Star) => star.getFieldsTobeSync()),
          bombs: this.bombs.children.entries.map((bomb: Bomb) => bomb.getFieldsTobeSync()),
        });
        channel.broadcast.emit('spawnPlayer', newPlayer.getFieldsTobeSync());
      });

      channel.on('cursorUpdate', (data: CursorMoviment) => {
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
      star.hide();
      // this.io.emit('starUpdated', star.getFieldsTobeSync());
      // player.addScore(10);
      if (this.stars.countActive(true) === 0) {
        this.nextLevel();
      }
    });
    this.physics.add.overlap(this.players, this.bombs, (player: Player, bomb: Bomb) => {
      if (bomb.hidden) return;
      if (player.dead) return;
      bomb.hide();
      player.kill();
      // player.addScore(10);
      setTimeout(() => {
        player.revive();
      }, 1000);
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
