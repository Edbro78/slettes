
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameObject, Invader, GameStatus } from './types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_START_Y,
  PLAYER_BULLET_WIDTH,
  PLAYER_BULLET_HEIGHT,
  PLAYER_BULLET_SPEED,
  INVADER_BULLET_WIDTH,
  INVADER_BULLET_HEIGHT,
  INVADER_BULLET_SPEED,
  INVADER_FIRE_RATE,
  INVADER_GRID_ROWS,
  INVADER_GRID_COLS,
  INVADER_WIDTH,
  INVADER_HEIGHT,
  INVADER_SPACING_X,
  INVADER_SPACING_Y,
  INVADER_START_X,
  INVADER_START_Y,
  INVADER_SPEED_X,
  INVADER_SPEED_Y,
  INITIAL_LIVES
} from './constants';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('START_SCREEN');
  const [player, setPlayer] = useState<GameObject>({ x: (GAME_WIDTH - PLAYER_WIDTH) / 2, y: PLAYER_START_Y, id: 0 });
  const [invaders, setInvaders] = useState<Invader[]>([]);
  const [playerBullets, setPlayerBullets] = useState<GameObject[]>([]);
  const [invaderBullets, setInvaderBullets] = useState<GameObject[]>([]);
  const [invaderDirection, setInvaderDirection] = useState<1 | -1>(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  
  const createInvaders = useCallback(() => {
    const newInvaders: Invader[] = [];
    let idCounter = 0;
    for (let row = 0; row < INVADER_GRID_ROWS; row++) {
      for (let col = 0; col < INVADER_GRID_COLS; col++) {
        let type: 'A' | 'B' | 'C';
        if (row === 0) type = 'C';
        else if (row <= 2) type = 'B';
        else type = 'A';

        newInvaders.push({
          id: idCounter++,
          x: INVADER_START_X + col * (INVADER_WIDTH + INVADER_SPACING_X),
          y: INVADER_START_Y + row * (INVADER_HEIGHT + INVADER_SPACING_Y),
          type: type,
        });
      }
    }
    setInvaders(newInvaders);
  }, []);

  const startGame = useCallback(() => {
    setPlayer({ x: (GAME_WIDTH - PLAYER_WIDTH) / 2, y: PLAYER_START_Y, id: 0 });
    setScore(0);
    setLives(INITIAL_LIVES);
    setPlayerBullets([]);
    setInvaderBullets([]);
    createInvaders();
    setInvaderDirection(1);
    setGameStatus('PLAYING');
  }, [createInvaders]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.code);
     if (e.code === 'Space' && gameStatus === 'PLAYING' && playerBullets.length === 0) {
        setPlayerBullets(prev => [...prev, {
          x: player.x + PLAYER_WIDTH / 2 - PLAYER_BULLET_WIDTH / 2,
          y: player.y,
          id: Date.now()
        }]);
      }
  }, [gameStatus, player.x, player.y, playerBullets.length]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.code);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const gameLoop = useCallback(() => {
    if (gameStatus !== 'PLAYING') return;

    // Player Movement
    setPlayer(prevPlayer => {
      let newX = prevPlayer.x;
      if (keysPressed.current.has('ArrowLeft')) {
        newX -= PLAYER_SPEED;
      }
      if (keysPressed.current.has('ArrowRight')) {
        newX += PLAYER_SPEED;
      }
      return { ...prevPlayer, x: Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, newX)) };
    });

    // Bullets Movement
    setPlayerBullets(bullets => bullets.map(b => ({ ...b, y: b.y - PLAYER_BULLET_SPEED })).filter(b => b.y > 0));
    setInvaderBullets(bullets => bullets.map(b => ({ ...b, y: b.y + INVADER_BULLET_SPEED })).filter(b => b.y < GAME_HEIGHT));

    // Invaders Movement & Firing
    setInvaders(prevInvaders => {
      let wallHit = false;
      let newInvaders = prevInvaders.map(inv => {
        const newX = inv.x + INVADER_SPEED_X * invaderDirection;
        if (newX <= 0 || newX >= GAME_WIDTH - INVADER_WIDTH) {
          wallHit = true;
        }
        return { ...inv, x: newX };
      });

      if (wallHit) {
        setInvaderDirection(prev => (prev === 1 ? -1 : 1));
        newInvaders = newInvaders.map(inv => ({ ...inv, y: inv.y + INVADER_SPEED_Y }));
      }
      
      const bottomInvaders = new Map<number, Invader>();
      newInvaders.forEach(invader => {
          const col = Math.round((invader.x - INVADER_START_X) / (INVADER_WIDTH + INVADER_SPACING_X));
          if (!bottomInvaders.has(col) || invader.y > (bottomInvaders.get(col)?.y ?? 0)) {
              bottomInvaders.set(col, invader);
          }
      });

      bottomInvaders.forEach(invader => {
          if (Math.random() < INVADER_FIRE_RATE) {
              setInvaderBullets(prev => [...prev, {
                  x: invader.x + INVADER_WIDTH / 2 - INVADER_BULLET_WIDTH / 2,
                  y: invader.y + INVADER_HEIGHT,
                  id: Date.now() + invader.id
              }]);
          }
      });
      return newInvaders;
    });
    
    // --- Collision Detection Refactor ---

    // Player bullets vs Invaders
    const hitPlayerBullets = new Set<number>();
    const hitInvaders = new Set<number>();
    let scoreGained = 0;

    for (const bullet of playerBullets) {
        for (const invader of invaders) {
            if (hitInvaders.has(invader.id)) continue; // Already marked for removal
            if (
                bullet.x < invader.x + INVADER_WIDTH &&
                bullet.x + PLAYER_BULLET_WIDTH > invader.x &&
                bullet.y < invader.y + INVADER_HEIGHT &&
                bullet.y + PLAYER_BULLET_HEIGHT > invader.y
            ) {
                hitPlayerBullets.add(bullet.id);
                hitInvaders.add(invader.id);
                scoreGained += invader.type === 'A' ? 10 : invader.type === 'B' ? 20 : 30;
                break; // One bullet hits one invader
            }
        }
    }

    if (hitInvaders.size > 0) {
        setPlayerBullets(prev => prev.filter(b => !hitPlayerBullets.has(b.id)));
        setInvaders(prev => prev.filter(i => !hitInvaders.has(i.id)));
        setScore(s => s + scoreGained);
    }
    
    // Invader bullets vs Player
    let playerWasHit = false;
    setInvaderBullets(prevInvaderBullets => {
        const remainingBullets = prevInvaderBullets.filter(bullet => {
            if (
                bullet.x < player.x + PLAYER_WIDTH &&
                bullet.x + INVADER_BULLET_WIDTH > player.x &&
                bullet.y < player.y + PLAYER_HEIGHT &&
                bullet.y + INVADER_BULLET_HEIGHT > player.y
            ) {
                playerWasHit = true;
                return false; // remove bullet
            }
            return true;
        });
        if (playerWasHit) {
            setLives(l => l - 1);
        }
        return remainingBullets;
    });

    // Win/Loss Conditions
    if (lives <= 0) {
      setGameStatus('GAME_OVER');
    }
    if (invaders.length > 0 && invaders.length === hitInvaders.size) { // check if last invaders were hit
      setGameStatus('WIN');
    }
    if (invaders.some(inv => inv.y + INVADER_HEIGHT >= player.y)) {
      setGameStatus('GAME_OVER');
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameStatus, invaderDirection, player, invaders, lives, playerBullets, invaderBullets]);
  
  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStatus, gameLoop]);

  const renderScreen = () => {
    switch(gameStatus) {
      case 'START_SCREEN':
        return <MenuScreen title="SPACE INVADERS" buttonText="Start Game" onButtonClick={startGame} />;
      case 'GAME_OVER':
        return <MenuScreen title="GAME OVER" buttonText="Play Again" onButtonClick={startGame} />;
      case 'WIN':
        return <MenuScreen title="YOU WIN!" buttonText="Play Again" onButtonClick={startGame} />;
      case 'PLAYING':
        return (
          <>
            <GameUI score={score} lives={lives} />
            {/* Player */}
            <div className="absolute bg-green-500" style={{ left: player.x, top: player.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}></div>
            
            {/* Invaders */}
            {invaders.map(inv => (
              <div key={inv.id} className="absolute" style={{ left: inv.x, top: inv.y, width: INVADER_WIDTH, height: INVADER_HEIGHT, color: inv.type === 'A' ? '#ff9b85' : inv.type === 'B' ? '#aed9e0' : '#fcf6b1', fontSize: '24px', textAlign: 'center' }}>
                {inv.type === 'A' ? '👽' : inv.type === 'B' ? '👾' : '💀'}
              </div>
            ))}
            
            {/* Bullets */}
            {playerBullets.map(b => (
              <div key={b.id} className="absolute bg-green-400" style={{ left: b.x, top: b.y, width: PLAYER_BULLET_WIDTH, height: PLAYER_BULLET_HEIGHT }}></div>
            ))}
            {invaderBullets.map(b => (
              <div key={b.id} className="absolute bg-red-500" style={{ left: b.x, top: b.y, width: INVADER_BULLET_WIDTH, height: INVADER_BULLET_HEIGHT }}></div>
            ))}
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black font-mono text-green-500">
      <div className="relative bg-black border-2 border-green-700 shadow-2xl shadow-green-500/20" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {renderScreen()}
      </div>
      <p className="mt-4 text-xs text-gray-500">Use Arrow Keys to Move, Spacebar to Shoot</p>
    </div>
  );
};

interface MenuScreenProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ title, buttonText, onButtonClick }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-center">
    <h1 className="text-6xl font-bold mb-8 animate-pulse">{title}</h1>
    <button
      onClick={onButtonClick}
      className="bg-green-700 text-white font-bold py-3 px-6 border-b-4 border-green-800 hover:bg-green-600 hover:border-green-700 rounded text-2xl transition-all duration-150 transform hover:scale-105"
    >
      {buttonText}
    </button>
  </div>
);

interface GameUIProps {
  score: number;
  lives: number;
}

const GameUI: React.FC<GameUIProps> = ({ score, lives }) => (
  <div className="absolute top-0 left-0 w-full p-2 flex justify-between text-lg">
    <div>SCORE: {score.toString().padStart(4, '0')}</div>
    <div>LIVES: {'❤️'.repeat(lives)}</div>
  </div>
);

export default App;
