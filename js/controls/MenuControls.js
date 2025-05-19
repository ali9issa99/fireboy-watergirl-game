class MenuControls {
    constructor() {
        this.currentFocusIndex = 0;
        this.menuButtons = [];
        this.activeMenu = null;
        this.menuSound = null;
        this.handleKeydown = this.handleKeydown.bind(this);
        this.setupKeyboardControls();
    }

    setMenuSound(sound) {
        this.menuSound = sound;
    }

    playMenuSound() {
        if (this.menuSound) {
            this.menuSound.play();
        }
    }

    setupKeyboardControls() {
        document.removeEventListener('keydown', this.handleKeydown);
        document.addEventListener('keydown', this.handleKeydown);
    }

    setActiveMenu(menuId) {
        console.log('Setting active menu:', menuId);
        this.activeMenu = menuId ? document.getElementById(menuId) : null;
        
        if (this.activeMenu) {
            this.menuButtons = Array.from(this.activeMenu.querySelectorAll('button'));
            this.currentFocusIndex = 0;
            if (this.menuButtons.length > 0) {
                this.menuButtons[this.currentFocusIndex].focus();
                this.playMenuSound();
            }
            console.log('Menu buttons found:', this.menuButtons.length);
        } else {
            this.menuButtons = [];
            console.log('No active menu, keyboard controls disabled');
        }
    }

    handleKeydown(event) {
        if (!this.activeMenu || this.menuButtons.length === 0) {
            return;
        }

        const key = event.key;
        const isLevelsMenu = this.activeMenu.id === 'levelsMenu';

        // Handle navigation keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            event.preventDefault();
            
            // For levels menu, use horizontal navigation
            if (isLevelsMenu) {
                if (key === 'ArrowLeft' || key === 'ArrowUp') {
                    this.navigatePrevious();
                } else if (key === 'ArrowRight' || key === 'ArrowDown') {
                    this.navigateNext();
                }
            } 
            // For other menus, use vertical navigation
            else {
                if (key === 'ArrowUp') {
                    this.navigatePrevious();
                } else if (key === 'ArrowDown') {
                    this.navigateNext();
                }
            }
        }
        // Handle selection and escape
        else if (key === 'Enter') {
            event.preventDefault();
            this.selectCurrentButton();
        }
        else if (key === 'Escape') {
            event.preventDefault();
            this.handleEscape();
        }
    }

    handleEscape() {
        const menuActions = {
            'pauseMenu': 'resumeButton',
            'gameOverScreen': 'gameOverExitButton',
            'victoryScreen': 'victoryExitButton',
            'levelsMenu': 'closeLevelsButton',
            'howToPlayMenu': 'closeHowToPlayButton'
        };

        const buttonId = menuActions[this.activeMenu.id];
        if (buttonId) {
            this.playMenuSound();
            document.getElementById(buttonId)?.click();
        }
    }

    navigatePrevious() {
        if (this.menuButtons.length > 0) {
            this.currentFocusIndex = (this.currentFocusIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex].focus();
            this.playMenuSound();
            console.log('Navigated to previous button:', this.currentFocusIndex);
        }
    }

    navigateNext() {
        if (this.menuButtons.length > 0) {
            this.currentFocusIndex = (this.currentFocusIndex + 1) % this.menuButtons.length;
            this.menuButtons[this.currentFocusIndex].focus();
            this.playMenuSound();
            console.log('Navigated to next button:', this.currentFocusIndex);
        }
    }

    selectCurrentButton() {
        if (this.menuButtons.length > 0) {
            console.log('Selecting button:', this.currentFocusIndex);
            this.playMenuSound();
            this.menuButtons[this.currentFocusIndex].click();
        }
    }
}

// Export the class
export default MenuControls; 