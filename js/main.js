import { GAME_CONFIG, LEVELS } from './config/gameConfig.js';
import { GameScene } from './scenes/GameScene.js';
import MenuControls from './controls/MenuControls.js';

document.addEventListener('DOMContentLoaded', function () {
  // Initialize menu controls
  const menuControls = new MenuControls();
  window.menuControls = menuControls; // Make it globally accessible

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

  // Landing page keyboard navigation
  const landingButtons = ['startButton', 'levelsButton', 'howToPlayButton'];
  let currentButtonIndex = 0;

  const handleLandingKeydown = (event) => {
    if (document.getElementById('landingPage').style.display !== 'none') {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          currentButtonIndex = (currentButtonIndex - 1 + landingButtons.length) % landingButtons.length;
          document.getElementById(landingButtons[currentButtonIndex]).focus();
          break;
        case 'ArrowRight':
          event.preventDefault();
          currentButtonIndex = (currentButtonIndex + 1) % landingButtons.length;
          document.getElementById(landingButtons[currentButtonIndex]).focus();
          break;
        case 'Enter':
          event.preventDefault();
          document.getElementById(landingButtons[currentButtonIndex]).click();
          break;
      }
    }
  };

  const setupLandingNavigation = () => {
    document.addEventListener('keydown', handleLandingKeydown);
    document.getElementById(landingButtons[currentButtonIndex]).focus();
  };

  // Initial setup
  setupLandingNavigation();

  // Update button click handlers to free keyboard controls
  document.getElementById('startButton').addEventListener('click', function () {
      document.getElementById('landingPage').style.display = 'none';
      document.getElementById('gameContainer').style.display = 'block';
      document.removeEventListener('keydown', handleLandingKeydown);
      game.scene.start('Game', { level: 'level1' });
      document.getElementById('gameContainer').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('levelsButton').addEventListener('click', function () {
      document.getElementById('levelsMenu').classList.toggle('hidden');
      if (!document.getElementById('levelsMenu').classList.contains('hidden')) {
          menuControls.setActiveMenu('levelsMenu');
          document.removeEventListener('keydown', handleLandingKeydown);
      } else {
          menuControls.setActiveMenu(null);
          setupLandingNavigation();
      }
  });

  // Dynamically generate level buttons
  const levelsContainer = document.querySelector('.levels-container');
  const closeButton = document.getElementById('closeLevelsButton');
  levelsContainer.innerHTML = ''; // Clear existing buttons

  // Add level buttons
  Object.entries(LEVELS).forEach(([levelKey, levelValue]) => {
    const button = document.createElement('button');
    button.className = 'levelButton';
    button.setAttribute('data-level', levelValue);
    button.textContent = `Level ${levelKey.replace('level', '')}`;
    levelsContainer.appendChild(button);
  });

  // Add close button at the end
  levelsContainer.appendChild(closeButton);

  document.getElementById('closeLevelsButton').addEventListener('click', function () {
      document.getElementById('levelsMenu').classList.add('hidden');
      menuControls.setActiveMenu(null);
      setupLandingNavigation();
  });

  document.querySelectorAll('.levelButton').forEach(button => {
    button.addEventListener('click', function () {
        let level = this.getAttribute('data-level');
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('levelsMenu').classList.add('hidden');
        menuControls.setActiveMenu(null);
        document.removeEventListener('keydown', handleLandingKeydown);
        game.scene.start('Game', { level: level });
        document.getElementById('gameContainer').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // How to Play Menu
  const howToPlayButton = document.getElementById('howToPlayButton');
  const howToPlayMenu = document.getElementById('howToPlayMenu');
  const closeHowToPlayButton = document.getElementById('closeHowToPlayButton');

  const closeHowToPlay = () => {
      howToPlayMenu.classList.add('hidden');
      howToPlayMenu.style.display = 'none';
      howToPlayMenu.classList.remove('from-landing');
      
      // If we came from pause menu, return to it
      if (!document.getElementById('pauseMenu').classList.contains('hidden')) {
          // Keep pause menu open and just focus the how to play button
          menuControls.setActiveMenu('pauseMenu');
          howToPlayPauseButton.focus();
      } else {
          // Otherwise return to landing page
          menuControls.setActiveMenu(null);
          setupLandingNavigation();
      }
  };

  howToPlayButton.addEventListener('click', () => {
      howToPlayMenu.classList.remove('hidden');
      howToPlayMenu.style.display = 'flex';
      howToPlayMenu.classList.add('from-landing');
      menuControls.setActiveMenu('howToPlayMenu');
      document.removeEventListener('keydown', handleLandingKeydown);
      closeHowToPlayButton.focus();
  });

  closeHowToPlayButton.addEventListener('click', closeHowToPlay);

  // How to Play from Pause Menu
  const howToPlayPauseButton = document.getElementById('howToPlayPauseButton');
  
  howToPlayPauseButton.addEventListener('click', () => {
      // Don't hide the pause menu, just show the how to play menu on top
      howToPlayMenu.classList.remove('hidden');
      howToPlayMenu.style.display = 'flex';
      howToPlayMenu.classList.remove('from-landing');
      menuControls.setActiveMenu('howToPlayMenu');
      closeHowToPlayButton.focus();
  });

  // Expose menuControls to the game scene
  window.menuControls = menuControls;
});
