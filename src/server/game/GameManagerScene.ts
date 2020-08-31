import { ServerChannel } from '@geckos.io/server';
import { Scene } from 'phaser';

import { EVENTS, SKINS, GAME } from '../../constants';
import Bomb from './components/Bomb';
import Ground from './components/Ground';
import Map from './components/Map';
import Player from './components/Player';
import Star from './components/Star';
import RoomManager from '../roomManager';
import { encodeObject } from '../../syncUtil';

export default class GameManagerScene extends Scene {
  bombs: Phaser.GameObjects.Group;
  ground: Phaser.GameObjects.Group;
  players: Phaser.GameObjects.Group;
  stars: Phaser.GameObjects.Group;

  map: Map;
  level = 0;
  id = 0;
  tick = 0;
  isGameOver = false;
  gameStarted = false;

  playerPositions: Array<{ x: number; y: number }> = new Array(GAME.MAX_PLAYERS);
  roomManager: RoomManager;
  roomId: string;
  constructor() {
    super({ key: 'GameManagerScene' });
  }

  init(): void {
    //TODO: create custom preBoot
    const { roomManager, roomId } = <{ roomManager: RoomManager; roomId: string }>(
      (<unknown>this.game.config.preBoot(undefined))
    );
    this.roomManager = roomManager;
    this.roomId = roomId;
  }

  create(): void {
    this.isGameOver = false;

    this.players = this.add.group();
    this.ground = this.add.group();
    this.stars = this.add.group();
    this.bombs = this.add.group();
    this.map = new Map();
    this.generateTheLevel();
    this.addCollisions();

    this.physics.world.setBounds(0, 0, this.map.getMaxWidth(), this.map.getMaxHeight());

    this.events.on(
      EVENTS.NEW_PLAYER,
      (channel: ServerChannel) => {
        this.createPlayer(channel);
        this.setupEventListeners(channel);
      },
      this,
    );

    this.events.on(
      EVENTS.REMOVE_PLAYER,
      ({ channelId }: RemoveChannel) => {
        console.log('Remove user ' + channelId);
        this.removePlayer(channelId);
      },
      this,
    );
  }

  async update(): Promise<void> {
    const objectsToSync: Array<PlayerFieldsToBeSync | BaseFieldsToBeSync> = [];
    if (this.isGameOver) {
      return;
    }
    this.tick++;
    if (this.tick > 1000000) this.tick = 0;
    objectsToSync.push(...this.updateGroup(this.players));
    if (this.tick % 3 === 0) {
      objectsToSync.push(...this.updateGroup(this.stars));
      objectsToSync.push(...this.updateGroup(this.bombs));
    }
    if (objectsToSync.length) {
      this.roomManager.emit(
        this.roomId,
        EVENTS.UPDATE_OBJECTS,
        objectsToSync.map((obj) => {
          return encodeObject(obj);
        }),
      );
    }
    if (this.gameStarted && this.players.getFirstAlive() === null) {
      await this.setGameOver();
    }
  }

  private async setGameOver() {
    console.log('game over');
    this.isGameOver = true;
    this.gameStarted = false;
    const playerResults: PlayerResult[] = this.players.children.getArray().map(({ playerId, score }: Player) => {
      return {
        playerId,
        score,
      };
    });
    this.roomManager.emit(this.roomId, EVENTS.GAME_OVER, playerResults);
    this.players.children
      .getArray()
      .filter((child: Player) => !!child)
      .forEach((child: Player) => {
        this.roomManager.leaveRoom(this.roomId, child.playerId);
      });
    await this.roomManager.removeRoom(this.roomId);

    this.players.destroy(true);
    this.bombs.destroy(true);
    this.ground.destroy(true);
    this.stars.destroy(true);
    this.scene.stop();
  }

  private updateGroup(group: Phaser.GameObjects.Group): PlayerFieldsToBeSync[] | BaseFieldsToBeSync[] {
    return group.children
      .getArray()
      .filter((child: Player | Star | Bomb) => {
        child.update();
        const x = child.prevPosition.x.toFixed(0) !== child.body.position.x.toFixed(0);
        const y = child.prevPosition.y.toFixed(0) !== child.body.position.y.toFixed(0);
        const hidden = child.prevHidden !== child.hidden;
        const hasChanged =
          x || y || hidden || (child.skin === SKINS.DUDE && (<Player>child).hit !== (<Player>child).prevHit);
        child.postUpdate();
        return hasChanged;
      })
      .map((child: Player | Star | Bomb) => {
        return child.getFieldsTobeSync();
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

  private setupEventListeners(channel: ServerChannel) {
    channel.on(EVENTS.CURSOR_UPDATE, (data: CursorMoviment) => {
      const currentPlayer: Player = this.getPlayer(channel.id);
      if (currentPlayer) {
        currentPlayer.setMove(data);
      }
    });
  }

  private removePlayer(channelId: string) {
    const currentPlayer = this.getPlayer(channelId);
    if (currentPlayer) {
      this.players.remove(currentPlayer, true);
    }
  }

  private createPlayer(channel: ServerChannel) {
    if (this.players.children.size >= this.playerPositions.length) {
      return;
    }
    const position = this.playerPositions[this.players.children.size];
    const newPlayer = new Player(this, channel.id, position.x, position.y);
    this.players.add(newPlayer);
    // TODO: validate, it should be send only to current player
    channel.emit(EVENTS.CURRENT_OBJECTS, {
      players: this.players.children.entries.map((player: Player) => player.getFieldsTobeSync()),
      ground: this.ground.children.entries.map((ground: Ground) => ground.getFieldsTobeSync()),
      stars: this.stars.children.entries.map((star: Star) => star.getFieldsTobeSync()),
      bombs: this.bombs.children.entries.map((bomb: Bomb) => bomb.getFieldsTobeSync()),
    });
    this.roomManager.emit(this.roomId, EVENTS.SPAWN_PLAYER, newPlayer.getFieldsTobeSync());
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
    if (!this.players || !this.players.children) return;
    return <Player>this.players.getChildren().find((p: Player) => {
      return p.playerId === playerId;
    });
  }

  /** Create a new object id */
  private newId() {
    return this.id++;
  }
}
