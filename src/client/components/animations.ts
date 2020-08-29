import { SKINS, DUDE_ANIMATIONS } from '../../constants';

export const createPlayerAnimations = (scene: Phaser.Scene) => {
  scene.anims.create({
    key: DUDE_ANIMATIONS.LEFT,
    frames: scene.anims.generateFrameNumbers(SKINS.DUDE.toString(), { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: DUDE_ANIMATIONS.IDLE,
    frames: [{ key: SKINS.DUDE.toString(), frame: 4 }],
    frameRate: 20,
  });

  scene.anims.create({
    key: DUDE_ANIMATIONS.RIGHT,
    frames: scene.anims.generateFrameNumbers(SKINS.DUDE.toString(), { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });
};

export const setPlayerAnimation = (sprite: Phaser.GameObjects.Sprite, animation = DUDE_ANIMATIONS.IDLE) => {
  if (!sprite.anims) return;

  if (!sprite.anims.isPlaying) sprite.play(animation);
  else if (sprite.anims.isPlaying && sprite.anims.getCurrentKey() !== animation) sprite.play(animation);
};
