document.getElementById('startBtn').addEventListener('click', function() {
    // Hide the landing page
    document.getElementById('landingPage').classList.add('hidden');
    // Show the game container
    document.getElementById('gameContainer').classList.remove('hidden');
    // Start the game
    startGame();
  });
  
  document.getElementById('characterBtn').addEventListener('click', function() {
    // Logic for character selection or viewing
    console.log('Character button clicked');
    // Implement your character selection logic here
  });
  
 

  
  function startGame() {
    // This function initializes the Phaser game
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'gameContainer',
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };
  
    const game = new Phaser.Game(config);
  
    function preload() {
      // Preload assets for the game
      this.load.image('sky', 'assets/sky.png');
      // Load other assets as needed
    }
  
    function create() {
      // Create the game scene
      this.add.image(400, 300, 'sky');
      // Add other game objects here
    }
  
    function update() {
      // Update the game scene
    }
  }
  