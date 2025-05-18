class MenuControls {
    constructor() {
        this.currentFocusIndex = 0;
        this.menuButtons = [];
        this.activeMenu = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    setActiveMenu(menuId) {
        this.activeMenu = document.getElementById(menuId);
        if (this.activeMenu) {
            this.menuButtons = Array.from(this.activeMenu.querySelectorAll('button'));
            this.currentFocusIndex = 0;
            this.menuButtons[this.currentFocusIndex]?.focus();
        }
    }

    handleKeyPress(event) {
        if (!this.activeMenu || this.menuButtons.length === 0) return;

        // Special handling for levels menu
        if (this.activeMenu.id === 'levelsMenu') {
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    this.navigateLeft();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.navigateRight();
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    this.menuButtons[this.currentFocusIndex]?.click();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.handleEscape();
                    break;
            }
        } else {
            // Standard up/down navigation for other menus
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.navigateUp();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.navigateDown();
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    this.menuButtons[this.currentFocusIndex]?.click();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.handleEscape();
                    break;
            }
        }
    }

    navigateLeft() {
        if (this.activeMenu.id === 'levelsMenu') {
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex]?.focus();
        }
    }

    navigateRight() {
        if (this.activeMenu.id === 'levelsMenu') {
            this.currentFocusIndex = (this.currentFocusIndex + 1) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex]?.focus();
        }
    }

    navigateUp() {
        this.currentFocusIndex = (this.currentFocusIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
        this.menuButtons[this.currentFocusIndex]?.focus();
    }

    navigateDown() {
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.menuButtons.length;
        this.menuButtons[this.currentFocusIndex]?.focus();
    }

    handleEscape() {
        // Handle different menus
        if (this.activeMenu.id === 'pauseMenu') {
            document.getElementById('resumeButton')?.click();
        } else if (this.activeMenu.id === 'gameOverScreen') {
            document.getElementById('gameOverExitButton')?.click();
        } else if (this.activeMenu.id === 'victoryScreen') {
            document.getElementById('victoryExitButton')?.click();
        } else if (this.activeMenu.id === 'levelsMenu') {
            document.getElementById('closeLevelsButton')?.click();
        }
    }
}

// Export the class
export default MenuControls; 