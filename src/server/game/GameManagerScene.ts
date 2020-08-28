import { ClientChannel } from '@geckos.io/client';
import * as Types from '@geckos.io/common/lib/types';

import geckos, { GeckosServer, iceServers } from '@geckos.io/server';
import { Scene } from 'phaser';

import { EVENTS, SKINS, GAME } from '../../constants';
import Bomb from './components/Bomb';
import Ground from './components/Ground';
import Map from './components/Map';
import Player from './components/Player';
import Star from './components/Star';

interface ServerChannel extends ClientChannel {
  broadcast: {
    emit(eventName: Types.EventName, data?: Types.Data | null, options?: Types.EmitOptions): void;
  };
}

export default class GameManagerScene extends Scene {
  io: GeckosServer;
  bombs: Phaser.GameObjects.Group;
  ground: Phaser.GameObjects.Group;
  players: Phaser.GameObjects.Group;
  stars: Phaser.GameObjects.Group;

  map: Map;
  level = 0;
  id = 0;
  tick: number;
  isGameOver = false;
  gameStarted = false;

  playerPositions: Array<{ x: number; y: number }> = new Array(GAME.MAX_PLAYERS);
  constructor() {
    super({ key: 'GameManagerScene' });
  }

  init(): void {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    this.io = geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    });
    this.io.addServer(this.game.server);
  }

  create(): void {
    this.players = this.add.group();
    this.ground = this.add.group();
    this.stars = this.add.group();
    this.bombs = this.add.group();
    this.map = new Map();
    this.generateTheLevel();
    this.setupEventListeners();
    this.addCollisions();

    this.physics.world.setBounds(0, 0, this.map.getMaxWidth(), this.map.getMaxHeight());
  }

  update(): void {
    if (this.isGameOver) return;
    this.tick++;
    if (this.tick > 1000000) this.tick = 0;
    this.updateGroup(this.players);
    this.updateGroup(this.stars);
    this.updateGroup(this.bombs);
    if (this.gameStarted && this.players.getFirstAlive() === null) {
      this.setGameOver();
    }
  }

  private setGameOver() {
    console.log('game over');
    this.isGameOver = true;
    this.gameStarted = false;
    const playerResults: PlayerResult[] = this.players.children.getArray().map(({ playerId, score }: Player) => {
      return {
        playerId,
        score,
      };
    });
    this.io.emit(EVENTS.GAME_OVER, playerResults);
  }

  private updateGroup(group: Phaser.GameObjects.Group) {
    group.children.iterate((child: Player | Star | Bomb) => {
      child.update();
      const x = child.prevPosition.x.toFixed(0) !== child.body.position.x.toFixed(0);
      const y = child.prevPosition.y.toFixed(0) !== child.body.position.y.toFixed(0);
      const hidden = child.prevHidden !== child.hidden;
      if (x || y || hidden || (child.skin === SKINS.DUDE && (<Player>child).hit !== (<Player>child).prevHit)) {
        this.io.emit(EVENTS.UPDATE_OBJECTS, child.getFieldsTobeSync());
      }
      child.postUpdate();
    });
  }

  private generateTheLevel() {
    console.log('generateTheLevel called!');
    const level = this.map.getLevel();
    // generate the level
    level.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const xx = x * this.map.tileSize + this.map.margin.x;
        const yy = y * this.map.tileSize + this.map.margin.y;
        if (row[x] === 'X') this.ground.add(new Ground(this, this.newId(), xx, yy));
        if (row[x] === '[') this.ground.add(new Ground(this, this.newId(), xx, yy, SKINS.GROUND_LEFT));
        if (row[x] === ']') this.ground.add(new Ground(this, this.newId(), xx, yy, SKINS.GROUND_RIGHT));
        if (['1', '2', '3', '4', '5'].includes(row[x])) {
          this.playerPositions[parseInt(row[x]) - 1] = { x: xx, y: yy - this.map.margin.y };
        }
      }
    });

    //TODO: set position of stars based on the map position
    const startStepX = 100;
    for (let i = 0; i < GAME.NUMBER_OF_STARS; i++) {
      this.stars.add(new Star(this, this.newId(), 56 + i * startStepX, 0));
    }
  }

  private setupEventListeners() {
    this.io.onConnection((channel: ServerChannel) => {
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
        this.createPlayer(channel);
      });

      channel.on(EVENTS.CURSOR_UPDATE, (data: CursorMoviment) => {
        const currentPlayer: Player = this.getPlayer(channel.id);
        if (currentPlayer) {
          currentPlayer.setMove(data);
        }
      });
    });
  }

  private createPlayer(channel: ServerChannel) {
    if (this.players.children.size >= this.playerPositions.length) {
      return;
    }
    const position = this.playerPositions[this.players.children.size];
    const newPlayer = new Player(this, channel.id, position.x, position.y);
    this.players.add(newPlayer);
    channel.emit(EVENTS.CURRENT_OBJECTS, {
      players: this.players.children.entries.map((player: Player) => player.getFieldsTobeSync()),
      ground: this.ground.children.entries.map((ground: Ground) => ground.getFieldsTobeSync()),
      stars: this.stars.children.entries.map((star: Star) => star.getFieldsTobeSync()),
      bombs: this.bombs.children.entries.map((bomb: Bomb) => bomb.getFieldsTobeSync()),
    });
    channel.broadcast.emit(EVENTS.SPAWN_PLAYER, newPlayer.getFieldsTobeSync());
    this.gameStarted = true;
  }

  private addCollisions() {
    // check for collisions between the player and the tiled blocked layer
    this.physics.add.collider(this.players, this.ground);
    this.physics.add.collider(this.stars, this.ground);
    this.physics.add.collider(this.bombs, this.ground);
    this.physics.add.overlap(this.players, this.stars, (player: Player, star: Star) => {
      if (star.hidden) return;
      if (player.hidden || player.hit) return;
      star.hide(this.map.getMaxWidth());
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

  private nextLevel() {
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

  private getPlayer(playerId: string): Player {
    return <Player>this.players.getChildren().find((p: Player) => {
      return p.playerId === playerId;
    });
  }

  /** Create a new object id */
  private newId() {
    return this.id++;
  }
}
