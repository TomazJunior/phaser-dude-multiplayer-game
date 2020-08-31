import { Scene } from 'phaser';
import { ClientChannel } from '@geckos.io/client';
import { decodeObject } from '../../syncUtil';
import { COLORS, EVENTS, GAME, HEART, PLAYER, SKINS } from '../../constants';
import Map from '../../server/game/components/Map';
import { setPlayerAnimation } from '../components/animations';
import Background from '../components/background';
import Controls from '../components/controls';
import Cursors from '../components/cursors';
import Heart from '../components/Heart';
import ScoreHeaderText from '../components/ScoreHeaderText';
import { createPlayerAnimations } from '../components/animations';

export default class GameScene extends Scene {
  objects: Record<string, Phaser.GameObjects.Sprite>;
  channel: ClientChannel;
  background: Background;
  player: Phaser.GameObjects.Sprite;
  hearts: Phaser.GameObjects.Group;
  scoreText: ScoreHeaderText;
  hiScoreText: ScoreHeaderText;
  cursors: Cursors;
  controls: Controls;
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

    this.hearts = this.add.group();
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
      this.createPlayer(player, false);
    });

    this.channel.on(EVENTS.UPDATE_OBJECTS, (objectsToSync: []) => {
      objectsToSync.forEach((obj) => {
        const object: PlayerFieldsToBeSync | BaseFieldsToBeSync = decodeObject(obj);
        const sprite = this.objects[object.id];
        if (sprite) {
          if (object.hidden !== null) sprite.setVisible(!object.hidden);
          if (object.x !== null) sprite.x = object.x;
          if (object.y !== null) sprite.y = object.y;
          if (object.skin === SKINS.DUDE) {
            this.updateDudeObjects(<PlayerFieldsToBeSync>object, sprite, object.id === this.channel.id);
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

  private addSprite(object: BaseFieldsToBeSync): Phaser.GameObjects.Sprite {
    const sprite = this.add.sprite(object.x, object.y, object.skin.toString()).setOrigin(0.5);
    this.objects[object.id] = sprite;
    if (object.hidden !== null) sprite.setVisible(!object.hidden);
    if (object.scale !== null) sprite.setScale(object.scale);
    return sprite;
  }

  private updateDudeObjects(player: PlayerFieldsToBeSync, sprite: Phaser.GameObjects.Sprite, mainPlayer: boolean) {
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
        this.player = sprite;
        this.createHearts();
        setPlayerAnimation(this.player, playerFields.animation);
        this.cameras.main.startFollow(this.player);
      }
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
    if (this.player) this.player.update(this.cursors);
  }

  createInput(): void {
    this.cursors = new Cursors(this, (data: CursorMoviment) => {
      this.channel.emit(EVENTS.CURSOR_UPDATE, data);
    });
    if (this.sys.game.device.input.touch) {
      this.controls = new Controls(this, (data: CursorMoviment) => {
        this.channel.emit(EVENTS.CURSOR_UPDATE, data);
      });
    }
  }

  goToGameOverScene(playersResult: PlayerResult[]): void {
    Object.keys(this.objects).forEach((key: string) => {
      this.objects[key].destroy();
      delete this.objects[key];
    });
    this.scene.stop();
    this.scene.start('GameOverScene', { channel: this.channel, playersResult });
  }

  resize(): void {
    this.background.adjustPosition();
    if (this.controls) this.controls.resize();
  }
}
