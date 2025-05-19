class MenuControls {
    constructor() {
        this.currentFocusIndex = 0;
        this.menuButtons = [];
        this.activeMenu = null;
        this.handleKeydown = this.handleKeydown.bind(this);
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        // Remove any existing listener first
        document.removeEventListener('keydown', this.handleKeydown);
        // Add the bound event listener
        document.addEventListener('keydown', this.handleKeydown);
    }

    setActiveMenu(menuId) {
        console.log('Setting active menu:', menuId);
        this.activeMenu = menuId ? document.getElementById(menuId) : null;
        
        if (this.activeMenu) {
            // Get all buttons in the active menu
            this.menuButtons = Array.from(this.activeMenu.querySelectorAll('button'));
            this.currentFocusIndex = 0;
            if (this.menuButtons.length > 0) {
                this.menuButtons[this.currentFocusIndex].focus();
            }
            console.log('Menu buttons found:', this.menuButtons.length);
        } else {
            this.menuButtons = [];
            console.log('No active menu, keyboard controls disabled');
        }
    }

    handleKeydown(event) {
        if (!this.activeMenu || this.menuButtons.length === 0) {
            console.log('No active menu or buttons');
            return;
        }

        console.log('Key pressed:', event.key, 'in menu:', this.activeMenu.id);

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.handleEscape();
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (this.activeMenu.id === 'levelsMenu') {
                    this.navigateLeft();
                } else {
                    this.navigateUp();
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (this.activeMenu.id === 'levelsMenu') {
                    this.navigateRight();
                } else {
                    this.navigateDown();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (this.activeMenu.id === 'levelsMenu') {
                    this.navigateLeft();
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (this.activeMenu.id === 'levelsMenu') {
                    this.navigateRight();
                }
                break;
            case 'Enter':
                event.preventDefault();
                this.selectCurrentButton();
                break;
        }
    }

    handleEscape() {
        console.log('Handling escape key for menu:', this.activeMenu.id);
        // Handle different menus
        if (this.activeMenu.id === 'pauseMenu') {
            document.getElementById('resumeButton')?.click();
        } else if (this.activeMenu.id === 'gameOverScreen') {
            document.getElementById('gameOverExitButton')?.click();
        } else if (this.activeMenu.id === 'victoryScreen') {
            document.getElementById('victoryExitButton')?.click();
        } else if (this.activeMenu.id === 'levelsMenu') {
            document.getElementById('closeLevelsButton')?.click();
        } else if (this.activeMenu.id === 'howToPlayMenu') {
            document.getElementById('closeHowToPlayButton')?.click();
        }
    }

    navigateUp() {
        if (this.menuButtons.length > 0) {
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex].focus();
            console.log('Navigated up to button:', this.currentFocusIndex);
        }
    }

    navigateDown() {
        if (this.menuButtons.length > 0) {
            this.currentFocusIndex = (this.currentFocusIndex + 1) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex].focus();
            console.log('Navigated down to button:', this.currentFocusIndex);
        }
    }

    navigateLeft() {
        if (this.menuButtons.length > 0) {
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex].focus();
            console.log('Navigated left to button:', this.currentFocusIndex);
        }
    }

    navigateRight() {
        if (this.menuButtons.length > 0) {
            this.currentFocusIndex = (this.currentFocusIndex + 1) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex].focus();
            console.log('Navigated right to button:', this.currentFocusIndex);
        }
    }

    selectCurrentButton() {
        if (this.menuButtons.length > 0) {
            console.log('Selecting button:', this.currentFocusIndex);
            this.menuButtons[this.currentFocusIndex].click();
        }
    }
}

// Export the class
export default MenuControls; 