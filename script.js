document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gameContainer = document.getElementById('game-container');
    const playerElement = document.getElementById('player');
    const scoreValueElement = document.getElementById('score-value');
    const livesValueElement = document.getElementById('lives-value');
    
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const winScreen = document.getElementById('win-screen');
    
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again-button');
    const winPlayAgainButton = document.getElementById('win-play-again-button');

    // --- Game Constants ---
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;

    const PLAYER_WIDTH = 50;
    const PLAYER_HEIGHT = 25;
    const PLAYER_SPEED = 8;
    const PLAYER_START_Y = GAME_HEIGHT - PLAYER_HEIGHT - 20;

    const PLAYER_BULLET_WIDTH = 5;
    const PLAYER_BULLET_HEIGHT = 15;
    const PLAYER_BULLET_SPEED = 10;
    const PLAYER_BULLET_COOLDOWN = 300; // ms

    const INVADER_BULLET_WIDTH = 5;
    const INVADER_BULLET_HEIGHT = 10;
    const INVADER_BULLET_SPEED = 5;
    const INVADER_FIRE_RATE = 0.01;

    const INVADER_GRID_ROWS = 5;
    const INVADER_GRID_COLS = 11;
    const INVADER_WIDTH = 40;
    const INVADER_HEIGHT = 30;
    const INVADER_SPACING_X = 20;
    const INVADER_SPACING_Y = 20;
    const INVADER_START_X = 50;
    const INVADER_START_Y = 50;
    const INVADER_SPEED_X_BASE = 0.5;
    const INVADER_SPEED_Y = 20;
    
    const INITIAL_LIVES = 3;

    // --- Game State ---
    let gameStatus = 'START_SCREEN';
    let player;
    let invaders = [];
    let playerBullets = [];
    let invaderBullets = [];
    let invaderDirection = 1;
    let score = 0;
    let lives = 0;
    let keysPressed = new Set();
    let gameLoopId;
    let lastPlayerBulletTime = 0;
    let invaderSpeedX = INVADER_SPEED_X_BASE;

    // --- Game Logic Functions ---

    function init() {
        showScreen('START_SCREEN');
        startButton.addEventListener('click', startGame);
        playAgainButton.addEventListener('click', startGame);
        winPlayAgainButton.addEventListener('click', startGame);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    }
    
    function showScreen(screen) {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        winScreen.style.display = 'none';

        if(screen === 'START_SCREEN') startScreen.style.display = 'flex';
        if(screen === 'GAME_OVER') gameOverScreen.style.display = 'flex';
        if(screen === 'WIN') winScreen.style.display = 'flex';
    }

    function startGame() {
        // Reset state
        player = { x: (GAME_WIDTH - PLAYER_WIDTH) / 2, y: PLAYER_START_Y };
        score = 0;
        lives = INITIAL_LIVES;
        invaders = [];
        playerBullets = [];
        invaderBullets = [];
        invaderDirection = 1;
        invaderSpeedX = INVADER_SPEED_X_BASE;
        gameStatus = 'PLAYING';
        
        // Clean up DOM
        gameContainer.querySelectorAll('.invader, .player-bullet, .invader-bullet').forEach(el => el.remove());

        createInvaders();
        updateUI();
        showScreen('NONE');
        
        if(gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoop();
    }
    
    function updateUI() {
        scoreValueElement.textContent = score.toString().padStart(4, '0');
        livesValueElement.textContent = '❤️'.repeat(lives);
        playerElement.style.left = player.x + 'px';
        playerElement.style.top = player.y + 'px';
    }

    function createInvaders() {
        let idCounter = 0;
        for (let row = 0; row < INVADER_GRID_ROWS; row++) {
            for (let col = 0; col < INVADER_GRID_COLS; col++) {
                let type;
                let text;
                let color;
                if (row === 0) { type = 'C'; text = '💀'; color = '#fcf6b1'; } 
                else if (row <= 2) { type = 'B'; text = '👾'; color = '#aed9e0'; }
                else { type = 'A'; text = '👽'; color = '#ff9b85'; }
                
                const invaderElement = document.createElement('div');
                invaderElement.className = 'invader';
                invaderElement.textContent = text;
                invaderElement.style.color = color;

                const invader = {
                    id: idCounter++,
                    x: INVADER_START_X + col * (INVADER_WIDTH + INVADER_SPACING_X),
                    y: INVADER_START_Y + row * (INVADER_HEIGHT + INVADER_SPACING_Y),
                    type: type,
                    element: invaderElement,
                };
                
                invaders.push(invader);
                gameContainer.appendChild(invaderElement);
            }
        }
    }
    
    function handleKeyDown(e) {
        keysPressed.add(e.code);
        if (e.code === 'Space' && gameStatus === 'PLAYING') {
            firePlayerBullet();
        }
    }

    function handleKeyUp(e) {
        keysPressed.delete(e.code);
    }
    
    function firePlayerBullet() {
        const now = Date.now();
        if (now - lastPlayerBulletTime < PLAYER_BULLET_COOLDOWN) return;
        lastPlayerBulletTime = now;

        const bulletElement = document.createElement('div');
        bulletElement.className = 'player-bullet';

        const bullet = {
            id: Date.now(),
            x: player.x + PLAYER_WIDTH / 2 - PLAYER_BULLET_WIDTH / 2,
            y: player.y,
            element: bulletElement,
        };
        playerBullets.push(bullet);
        gameContainer.appendChild(bulletElement);
    }

    function checkCollision(a, b) {
        // Simple AABB collision detection
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    function gameLoop() {
        if (gameStatus !== 'PLAYING') return;

        // --- Update Positions ---

        // Player movement
        if (keysPressed.has('ArrowLeft')) {
            player.x -= PLAYER_SPEED;
        }
        if (keysPressed.has('ArrowRight')) {
            player.x += PLAYER_SPEED;
        }
        player.x = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, player.x));
        
        // Player bullets movement
        playerBullets.forEach(b => b.y -= PLAYER_BULLET_SPEED);
        
        // Invaders movement
        let wallHit = false;
        invaders.forEach(inv => {
            inv.x += invaderSpeedX * invaderDirection;
            if (inv.x <= 0 || inv.x >= GAME_WIDTH - INVADER_WIDTH) {
                wallHit = true;
            }
        });

        if (wallHit) {
            invaderDirection *= -1;
            invaders.forEach(inv => inv.y += INVADER_SPEED_Y);
        }

        // Invader bullets movement
        invaderBullets.forEach(b => b.y += INVADER_BULLET_SPEED);
        
        // Invader firing
        const bottomInvaders = new Map();
        invaders.forEach(invader => {
            const col = Math.round((invader.x - INVADER_START_X) / (INVADER_WIDTH + INVADER_SPACING_X));
            if (!bottomInvaders.has(col) || invader.y > bottomInvaders.get(col).y) {
                bottomInvaders.set(col, invader);
            }
        });

        bottomInvaders.forEach(invader => {
            if (Math.random() < INVADER_FIRE_RATE) {
                const bulletElement = document.createElement('div');
                bulletElement.className = 'invader-bullet';
                const bullet = {
                    id: Date.now() + invader.id,
                    x: invader.x + INVADER_WIDTH / 2 - INVADER_BULLET_WIDTH / 2,
                    y: invader.y + INVADER_HEIGHT,
                    element: bulletElement,
                };
                invaderBullets.push(bullet);
                gameContainer.appendChild(bulletElement);
            }
        });

        // --- Collision Detection ---
        
        // Player bullets vs Invaders
        const hitPlayerBullets = [];
        const hitInvaders = [];
        
        for (const bullet of playerBullets) {
            for (const invader of invaders) {
                if (checkCollision(
                    {...bullet, width: PLAYER_BULLET_WIDTH, height: PLAYER_BULLET_HEIGHT},
                    {...invader, width: INVADER_WIDTH, height: INVADER_HEIGHT}
                )) {
                    hitPlayerBullets.push(bullet);
                    hitInvaders.push(invader);
                    score += invader.type === 'A' ? 10 : invader.type === 'B' ? 20 : 30;
                    break;
                }
            }
        }
        
        hitPlayerBullets.forEach(b => b.element.remove());
        playerBullets = playerBullets.filter(b => !hitPlayerBullets.includes(b));
        
        hitInvaders.forEach(i => i.element.remove());
        invaders = invaders.filter(i => !hitInvaders.includes(i));
        
        if (hitInvaders.length > 0) {
            // Speed up remaining invaders
            invaderSpeedX = INVADER_SPEED_X_BASE * (1 + (INVADER_GRID_COLS * INVADER_GRID_ROWS - invaders.length) / (INVADER_GRID_COLS * INVADER_GRID_ROWS));
        }

        // Invader bullets vs Player
        const hitInvaderBullets = [];
        for (const bullet of invaderBullets) {
            if (checkCollision(
                {...bullet, width: INVADER_BULLET_WIDTH, height: INVADER_BULLET_HEIGHT},
                {...player, width: PLAYER_WIDTH, height: PLAYER_HEIGHT}
            )) {
                hitInvaderBullets.push(bullet);
                lives--;
            }
        }
        hitInvaderBullets.forEach(b => b.element.remove());
        invaderBullets = invaderBullets.filter(b => !hitInvaderBullets.includes(b));

        // Filter out-of-bounds bullets
        playerBullets.filter(b => b.y < 0).forEach(b => b.element.remove());
        playerBullets = playerBullets.filter(b => b.y >= 0);
        invaderBullets.filter(b => b.y > GAME_HEIGHT).forEach(b => b.element.remove());
        invaderBullets = invaderBullets.filter(b => b.y <= GAME_HEIGHT);


        // --- Render ---
        updateUI();
        invaders.forEach(i => {
            i.element.style.left = i.x + 'px';
            i.element.style.top = i.y + 'px';
        });
        playerBullets.forEach(b => {
            b.element.style.left = b.x + 'px';
            b.element.style.top = b.y + 'px';
        });
        invaderBullets.forEach(b => {
            b.element.style.left = b.x + 'px';
            b.element.style.top = b.y + 'px';
        });

        // --- Win/Loss Conditions ---
        if (lives <= 0) {
            gameStatus = 'GAME_OVER';
            showScreen('GAME_OVER');
            return;
        }
        if (invaders.length === 0) {
            gameStatus = 'WIN';
            showScreen('WIN');
            return;
        }
        if (invaders.some(inv => inv.y + INVADER_HEIGHT >= player.y)) {
            gameStatus = 'GAME_OVER';
            showScreen('GAME_OVER');
            return;
        }

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    // --- Initial Call ---
    init();
});
