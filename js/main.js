import { GAME_CONFIG } from './config/gameConfig.js';
import { GameScene } from './scenes/GameScene.js';

document.addEventListener('DOMContentLoaded', function () {
  let text = document.getElementById('text');
  let leaf = document.getElementById('leaf');
  let hill1 = document.getElementById('hill1');
  let hill2 = document.getElementById('hill2');
  let hill3 = document.getElementById('hill3');
  let hill4 = document.getElementById('hill4');
  let hill5 = document.getElementById('hill5');

  window.addEventListener('scroll', () => {
      let value = window.scrollY;

      text.style.marginTop = value * 2.5 + 'px';
      leaf.style.top = value * -1.5 + 'px';
      leaf.style.left = value * 1.5 + 'px';
      hill1.style.top = value * 1 + 'px';
      hill2.style.top = value * 0.8 + 'px';
      hill3.style.top = value * 0.6 + 'px';
      hill4.style.top = value * 0.4 + 'px';
      hill5.style.top = value * 0.2 + 'px';
  });

  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('levelsMenu').classList.add('hidden');

  const config = {
    ...GAME_CONFIG,
    scene: [GameScene]
  };
  const game = new Phaser.Game(config);

  document.getElementById('startButton').addEventListener('click', function () {
      document.getElementById('landingPage').style.display = 'none';
      document.getElementById('gameContainer').style.display = 'block';
      game.scene.start('Game', { level: 'level1' });
      document.getElementById('gameContainer').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('levelsButton').addEventListener('click', function () {
      document.getElementById('levelsMenu').classList.toggle('hidden');
  });

  document.getElementById('closeLevelsButton').addEventListener('click', function () {
      document.getElementById('levelsMenu').classList.add('hidden');
  });

  document.querySelectorAll('.levelButton').forEach(button => {
    button.addEventListener('click', function () {
        let level = this.getAttribute('data-level');
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        game.scene.start('Game', { level: level });
        document.getElementById('gameContainer').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('levelsMenu').classList.add('hidden');
    });
  });
});
