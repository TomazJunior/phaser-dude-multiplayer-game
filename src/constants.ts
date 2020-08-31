export const SKINS = {
  DUDE: 0,
  STAR: 1,
  BOMB: 2,
  PLATFORM: 4,
  GROUND_MIDDLE: 5,
  HEART: 6,
  HEART_EMPTY: 7,
  GROUND_LEFT: 8,
  GROUND_RIGHT: 9,
};

export const DUDE_ANIMATIONS = {
  LEFT: 'left',
  IDLE: 'idle',
  RIGHT: 'right',
};

export const STAR = {
  GRAVITY_Y: -1000,
};

export const PLAYER = {
  MAX_LIFE: 3,
  SCALE: 2,
};

export const BOMB = {
  SCALE: 1.5,
};

export const HEART = {
  HEIGHT: 128,
  WIDTH: 128,
  STEP_X: 58,
  SCALE: 0.5,
};

export const GAME = {
  WIDTH: 1024,
  HEIGHT: 720,
  MAX_PLAYERS: 5,
  NUMBER_OF_STARS: 10,
  USER_KICK_TIMEOUT: 60_000, // 1 minute
};

export const GROUND = {
  SIZE: 128,
};

export const COLORS = {
  BLACK: 0x000000,
  BLUE: 0x0800ff,
  RED: 0xff0000,
};

export const EVENTS = {
  CURRENT_OBJECTS: 'A',
  CURSOR_UPDATE: 'B',
  DISCONNECT: 'disconnect',
  NEW_PLAYER: 'C',
  READY: 'ready',
  UPDATE_OBJECTS: 'D',
  SPAWN_PLAYER: 'E',
  GAME_OVER: 'F',
  RESET_GAME: 'G',
  REMOVE_PLAYER: 'H',
};

export const FIELDS_MAPPING = ['x', 'y', 'skin', 'id', 'hidden', 'scale', 'animation', 'hit', 'alpha', 'life', 'score'];
