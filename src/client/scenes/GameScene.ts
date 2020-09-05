import { ClientChannel } from '@geckos.io/client';
import { Scene } from 'phaser';

import { COLORS, EVENTS, GAME, HEART, PLAYER, SKINS } from '../../constants';
import Map from '../../server/game/components/Map';
import BombBase from '../../shared/components/BombBase';
import GroundBase from '../../shared/components/GroundBase';
import PlayerBase from '../../shared/components/PlayerBase';
import StarBase from '../../shared/components/StarBase';
import { decodeObject } from '../../syncUtil';
import { setPlayerAnimation } from '../components/animations';
import { createPlayerAnimations } from '../components/animations';
import Background from '../components/background';
import Controls from '../components/controls';
import Cursors from '../components/cursors';
import Heart from '../components/Heart';
import ScoreHeaderText from '../components/ScoreHeaderText';

export default class GameScene extends Scene {
  objects: Record<string, Phaser.GameObjects.Sprite | Phaser.Physics.Arcade.Sprite>;
  channel: ClientChannel;
  background: Background;
  player: PlayerBase;
  hearts: Phaser.GameObjects.Group;
  scoreText: ScoreHeaderText;
  hiScoreText: ScoreHeaderText;
  cursors: Cursors;
  controls: Controls;

  ground: Phaser.GameObjects.Group;
  players: Phaser.GameObjects.Group;
  stars: Phaser.GameObjects.Group;
  bombs: Phaser.GameObjects.Group;

  positions: Record<string, Array<PlayerFieldsToBeSync>> = {};
  constructor() {
    super({ key: 'GameScene' });
    this.objects = {};
  }

  init({ channel }: { channel: ClientChannel }): void {
    this.channel = channel;
  }

  create(): void {
    createPlayerAnimations(this);
    this.cameras.main.setBackgroundColor('#ade6ff');
    this.cameras.main.fadeIn();

    const map = new Map();
    this.physics.world.setBounds(0, 0, map.getMaxWidth(), map.getMaxHeight());
    this.cameras.main.setBounds(0, 0, map.getMaxWidth(), map.getMaxHeight());

    this.background = new Background(this);

    this.players = this.add.group();
    this.ground = this.add.group();
    this.stars = this.add.group();
    this.hearts = this.add.group();
    this.bombs = this.add.group();

    this.scoreText = new ScoreHeaderText(this, 15, HEART.HEIGHT / 2);
    this.hiScoreText = new ScoreHeaderText(this, GAME.WIDTH - 170, 15, 'HI-SCORE ');
    this.listenToChannel();
  }

  listenToChannel(): void {
    this.channel.on(EVENTS.CURRENT_OBJECTS, (objects: CurrentObjects) => {
      [...objects.bombs, ...objects.stars, ...objects.ground].forEach((object) => {
        if (!this.objects[object.id]) {
          this.addSprite(object);
        }
      });
      objects.players
        .filter((player) => {
          return !this.objects[player.id];
        })
        .forEach((player) => {
          this.createPlayer(player, player.id === this.channel.id);
        });
    });

    this.channel.on(EVENTS.SPAWN_PLAYER, (player: PlayerFieldsToBeSync) => {
      this.createPlayer(player, player.id === this.channel.id);
    });

    this.channel.on(EVENTS.UPDATE_OBJECTS, (objectsToSync: []) => {
      objectsToSync.forEach((obj) => {
        const object: PlayerFieldsToBeSync | BaseFieldsToBeSync = decodeObject(obj);
        const sprite = this.objects[object.id];
        if (sprite) {
          if (object.hidden !== null) sprite.setVisible(!object.hidden);
          if (object.skin === SKINS.DUDE) {
            this.updateDudeObjects(
              <PlayerFieldsToBeSync>object,
              <Phaser.Physics.Arcade.Sprite>sprite,
              object.id === this.channel.id,
            );
          } else {
            if (object.x !== null) sprite.x = object.x;
            if (object.y !== null) sprite.y = object.y;
          }
        } else {
          this.addSprite(object);
        }
      });
    });

    this.channel.on(EVENTS.DISCONNECT, (playerId: string) => {
      console.log('disconnect ', playerId);
      if (this.objects[playerId]) {
        this.objects[playerId].destroy(true);
        delete this.objects[playerId];
      }
    });

    this.channel.on(EVENTS.GAME_OVER, (playersResult: PlayerResult[]) => {
      this.goToGameOverScene(playersResult);
    });

    this.channel.emit(EVENTS.NEW_PLAYER);

    this.scale.on('resize', (gameSize: any, baseSize: any, displaySize: any, resolution: any) => {
      this.cameras.main.width = gameSize.width;
      this.cameras.main.height = gameSize.height;
      this.resize();
    });

    this.resize();

    this.createInput();
  }

  private addSprite(object: BaseFieldsToBeSync): Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Sprite {
    let sprite;
    if ([SKINS.GROUND_LEFT, SKINS.GROUND_MIDDLE, SKINS.GROUND_RIGHT].includes(object.skin)) {
      sprite = new GroundBase(this, object.id, object.x, object.y, object.skin);
      this.ground.add(sprite);
    } else if (SKINS.DUDE === object.skin) {
      sprite = new PlayerBase(this, object.id, object.x, object.y, object.skin);
      this.players.add(sprite);
    } else if (SKINS.STAR === object.skin) {
      sprite = new StarBase(this, object.id, object.x, object.y, object.skin);
      this.stars.add(sprite);
    } else if (SKINS.BOMB === object.skin) {
      sprite = new BombBase(this, object.id, object.x, object.y, object.skin);
      this.bombs.add(sprite);
    } else {
      sprite = this.physics.add.sprite(object.x, object.y, object.skin.toString()).setOrigin(0.5);
      this.physics.add.existing(sprite);
      sprite.setCollideWorldBounds(true).setOrigin(0.5);
    }
    this.objects[object.id] = sprite;
    if (object.hidden !== null) sprite.setVisible(!object.hidden);
    if (object.scale !== null) sprite.setScale(object.scale);
    return sprite;
  }

  private updateDudeObjects(player: PlayerFieldsToBeSync, sprite: Phaser.Physics.Arcade.Sprite, mainPlayer: boolean) {
    if (player.animation !== null) {
      setPlayerAnimation(sprite, player.animation);
    }
    if (player.alpha !== null) {
      sprite.setAlpha(player.alpha);
    }
    if (mainPlayer) {
      if (player.score) {
        this.scoreText.setScore(player.score);
      }
      if (this.hearts && player.life !== null) {
        if (this.hearts.countActive() !== player.life) {
          const heart = <Heart>this.hearts.children
            .getArray()
            .reverse()
            .find((heart) => heart.active);
          if (heart) {
            heart.hide();
          }
        }
      }
    } else {
      if (player.x !== null) sprite.x = player.x;
      if (player.y !== null) sprite.y = player.y;
      // if (!this.positions[player.id]) {
      //   this.positions[player.id] = [];
      // }
      // this.positions[player.id].push(player);
    }
    this.updateHiScore(player.score);
  }

  updateHiScore(score: number): void {
    if (score && score > this.hiScoreText.getScore()) {
      this.hiScoreText.setScore(score);
    }
    if (this.hiScoreText.getScore() > this.scoreText.getScore()) {
      this.hiScoreText.setTint(COLORS.RED);
    } else {
      this.hiScoreText.setTint(COLORS.BLUE);
    }
  }
  createPlayer(playerFields: PlayerFieldsToBeSync, mainPlayer: boolean): void {
    if (!this.objects[playerFields.id]) {
      const sprite = this.addSprite(playerFields);
      if (mainPlayer) {
        this.player = <PlayerBase>sprite;
        this.createHearts();
        setPlayerAnimation(this.player, playerFields.animation);
        this.cameras.main.startFollow(this.player);
        this.physics.add.collider(this.stars, this.ground);
      }
      this.physics.add.collider(sprite, this.ground);
    }
  }

  private createHearts() {
    const margin = 35;
    for (let i = 0; i < PLAYER.MAX_LIFE; i++) {
      this.hearts.add(new Heart(this, i, margin + i * HEART.STEP_X, margin));
    }
  }

  update(): void {
    this.background.parallax();
    if (this.player) {
      this.player.setMove(this.cursors);
      this.player.update();
    }

    // this.players.children.entries.forEach((x) => {
    //   console.log(`#${x.id} ${JSON.stringify(x.body.position)}`);
    // });

    // Object.keys(this.positions).forEach((id: string) => {
    //   if (this.positions[id].length) {
    //     const player = this.positions[id].pop();
    //     if (player) {
    //       if (player.x !== null) this.objects[player.id].body.position.x = player.x;
    //       if (player.y !== null) this.objects[player.id].body.position.y = player.y;
    //       console.log(`#${player.id} ${JSON.stringify(player.body.position)}`);
    //     }
    //   }
    // });
  }

  createInput(): void {
    this.cursors = new Cursors(this, (total: number) => {
      this.channel.emit(EVENTS.CURSOR_UPDATE, total);
    });
    if (this.sys.game.device.input.touch) {
      this.controls = new Controls(this, (total: number) => {
        this.channel.emit(EVENTS.CURSOR_UPDATE, total);
      });
    }
  }

  goToGameOverScene(playersResult: PlayerResult[]): void {
    Object.keys(this.objects).forEach((key: string) => {
      this.objects[key].destroy(true);
      delete this.objects[key];
    });
    this.background.destroy(true);
    this.hearts.destroy(true);
    this.scoreText.destroy(true);
    this.hiScoreText.destroy(true);
    this.players.destroy(true);
    this.ground.destroy(true);
    this.stars.destroy(true);
    this.bombs.destroy(true);

    this.scene.stop();
    this.scene.start('GameOverScene', { channel: this.channel, playersResult });
  }

  resize(): void {
    this.background.adjustPosition();
    if (this.controls) this.controls.resize();
  }
}
