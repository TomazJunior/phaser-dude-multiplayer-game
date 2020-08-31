import * as Types from '@geckos.io/common/lib/types';
import { GeckosServer, ServerChannel } from '@geckos.io/server';
import { v4 as uuidv4 } from 'uuid';

import { EVENTS, GAME } from '../constants';
import Game, { PhaserGame } from './game/game';

interface User {
  id: string;
  lastUpdate: number;
  roomId: string;
}

interface Users {
  [userId: string]: User;
}

interface Room {
  roomId: string;
  game: Phaser.Game;
  removing: boolean;
  users: Users;
  scene: Phaser.Scene;
}

interface Rooms {
  [room: string]: Room;
}

export default class RoomManager {
  rooms: Rooms = {};
  constructor(public io: GeckosServer) {
    this.io.onConnection((channel: ServerChannel) => {
      console.log('Connect user ' + channel.id);
      channel.onDisconnect(() => {
        console.log('Disconnect user ' + channel.id);
        this.leaveRoom(channel.roomId, channel.id);
      });

      channel.emit(EVENTS.READY);
      channel.on(EVENTS.NEW_PLAYER, () => {
        this.joinRoom(channel);
      });
    });
  }

  getRooms() {
    return Object.keys(this.rooms).map((roomid) => {
      return {
        roomid,
        users: Object.keys(this.rooms[roomid].users),
        removing: this.rooms[roomid].removing,
      };
    });
  }
  joinRoom(channel: ServerChannel) {
    const roomId = this.chooseRoom();
    // create a new game instance if this room does not exist yet
    if (!this.rooms[roomId]) {
      this.createRoom(roomId);
    }
    this.addUser(channel, roomId);
    this.rooms[roomId].scene.events.emit(EVENTS.NEW_PLAYER, channel);
  }

  leaveRoom(roomId: string, channelId: string): void {
    this.removeUser(roomId, channelId);
    if (this.isRemoving(roomId)) return;
    if (!this.roomExists(roomId)) return;
    this.rooms[roomId].scene.events.emit(EVENTS.REMOVE_PLAYER, { channelId });
    this.emit(roomId, EVENTS.DISCONNECT, channelId);
  }

  async removeRoom(roomId: string) {
    if (this.isRemoving(roomId)) return;
    if (!this.roomExists(roomId)) return;
    console.log(`Removing room <b>${roomId}</b>`);
    this.rooms[roomId].removing = true;
    // this.rooms[roomId].scene.events.emit('stopScene');

    setTimeout(async () => {
      await this.rooms[roomId].game.destroy(true, false);
      this.rooms[roomId].game = null;
      delete this.rooms[roomId];

      console.log(`Room <b>${roomId}</b> has been removed!`);
      console.log(`Remaining rooms: ${Object.keys(this.rooms).length}`);
    }, 2000);
  }

  isRemoving(roomId: string): boolean {
    if (!!!this.rooms[roomId] || this.rooms[roomId].removing) return true;
    else return false;
  }

  removeUser(roomId: string, userId: string): boolean {
    // if (this.io.sockets[userId]) this.ioNspGame.sockets[userId].leave(roomId);

    if (this.userExists(roomId, userId)) {
      delete this.rooms[roomId].users[userId];
      console.log(`User <b>${userId}</b> disconnected!`);
      return true;
    }
    return false;
  }

  userExists(roomId: string, userId: string): boolean {
    if (this.roomExists(roomId) && this.rooms[roomId].users && this.rooms[roomId].users[userId]) return true;
    return false;
  }

  roomExists(roomId: string): boolean {
    if (this.rooms && this.rooms[roomId]) return true;
    return false;
  }

  addUser(channel: ServerChannel, roomId: string) {
    console.log(`addUser new user ${channel.id} to room`, roomId);
    const newUsers: Users = {
      [channel.id]: {
        id: channel.id,
        lastUpdate: Date.now(),
        roomId,
      },
    };
    this.rooms[roomId].users = {
      ...this.rooms[roomId].users,
      ...newUsers,
    };
    // join the socket room
    channel.join(roomId);
  }

  chooseRoom(): string {
    const rooms = Object.keys(this.rooms);
    if (rooms.length === 0) return uuidv4();
    const room = rooms.find((roomId: string) => {
      const room = this.rooms[roomId];
      const count = Object.keys(room.users).length;
      return count < GAME.MAX_PLAYERS && !room.removing;
    });
    return room ? room : uuidv4();
  }

  emit(roomId: string, eventName: Types.EventName, data?: Types.Data | null): void {
    this.io.room(roomId).emit(eventName, data);
  }

  // emitToChannel(channelId: string, eventName: Types.EventName, data?: Types.Data | null): void {
  //   this.io.connectionsManager.getConnection(channelId).emit(eventName, data);
  // }

  createRoom(roomId: string): void {
    const game: PhaserGame = Game(this, roomId);

    this.rooms[roomId] = {
      roomId: roomId,
      users: {},
      game,
      removing: false,
      //TODO: better fix
      scene: (game.scene.keys as any)['GameManagerScene'],
    };
  }
}
