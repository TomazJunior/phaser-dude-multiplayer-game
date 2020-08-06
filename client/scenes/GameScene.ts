import { Scene } from 'phaser';
import { ClientChannel } from '@geckos.io/client';

export default class GameScene extends Scene {
  objects: Record<string, unknown>;
  channel: ClientChannel;
  playerId: number;
  constructor() {
    super({ key: 'GameScene' });
    this.objects = {};
    this.playerId;
  }

  init({ channel }: { channel: ClientChannel }) {
    this.channel = channel;
  }
}
