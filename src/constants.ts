export const SKINS = {
  DUDE: 0,
  STAR: 1,
  BOMB: 2,
  PLATFORM: 4,
  GROUND: 5,
  HEART: 6,
  HEART_EMPTY: 7,
};

export const DUDE_ANIMATIONS = {
  LEFT: 'left',
  IDLE: 'idle',
  RIGHT: 'right',
};

export const STAR = {
  NUMBER_OF_STARS: 10,
  GRAVITY_Y: -1000,
};

export const PLAYER = {
  MAX_LIFE: 5,
};

export const HEART = {
  HEIGHT: 48,
  WIDTH: 48,
  STEP_X: 35,
};

export const GAME = {
  WIDTH: 1024,
  HEIGHT: 720,
};

export const COLORS = {
  BLACK: 0x000000,
  BLUE: 0x0800ff,
  RED: 0xff0000,
};

export const EVENTS = {
  CURRENT_OBJECTS: 'CURRENT_OBJECTS',
  CURSOR_UPDATE: 'CURSOR_UPDATE',
  DISCONNECT: 'disconnect',
  NEW_PLAYER: 'NEW_PLAYER',
  READY: 'ready',
  UPDATE_OBJECTS: 'UPDATE_OBJECTS',
  SPAWN_PLAYER: 'SPAWN_PLAYER',
  GAME_OVER: 'GAME_OVER',
  RESET_GAME: 'RESET_GAME',
};
