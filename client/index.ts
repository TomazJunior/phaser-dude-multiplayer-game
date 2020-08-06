import 'phaser';
import resize from './components/resize';
import Game from './game';
import FullScreenEvent from './components/fullscreenEvent';

window.addEventListener('load', () => {
  const game = new Game();
  window.addEventListener('resize', () => {
    resize(game);
  });
  FullScreenEvent(() => resize(game));
  resize(game);
});
