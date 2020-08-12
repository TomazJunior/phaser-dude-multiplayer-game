import { ClientChannel } from '@geckos.io/client';
import geckos, { GeckosServer, iceServers } from '@geckos.io/server';
import { Scene } from 'phaser';
import Map from './components/Map';

import Player from './components/Player';
import Ground from './components/Ground';

export default class GameManagerScene extends Scene {
  io: GeckosServer;
  players: Phaser.GameObjects.Group;
  ground: Phaser.GameObjects.Group;
  map: Map;
  level: 0;
  id: 0;
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
  }

  generateTheLevel() {
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
        this.players.add(new Player(this, channel.id, Phaser.Math.RND.integerInRange(100, 700)));
        this.io.room().emit(
          'currentPlayers',
          this.players.children.entries.map((player: Player) => player.getFieldsTobeSync()),
        );
        this.io.room().emit(
          'currentGround',
          this.ground.children.entries.map((ground: Ground) => {
            return ground.getFieldsTobeSync();
          }),
        );
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
