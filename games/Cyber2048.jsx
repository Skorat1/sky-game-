import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Undo2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Cyber2048() {
  const [grid, setGrid] = useState(() => getInitialGrid());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_2048_highscore') || localStorage.getItem('thop_2048_highscore') || '0', 10);
  });
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function getInitialGrid() {
    let g = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(g);
    addRandomTile(g);
    return g;
  }

  function addRandomTile(board) {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
  }

  const slideRow = (row) => {
    let arr = row.filter(val => val !== 0);
    let pts = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        pts += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) arr.push(0);
    return { row: arr, points: pts };
  };

  const move = useCallback((direction) => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let pointsGained = 0;
    let moved = false;

    if (direction === 'LEFT') {
      for (let r = 0; r < 4; r++) {
        const { row, points } = slideRow(newGrid[r]);
        pointsGained += points;
        if (JSON.stringify(newGrid[r]) !== JSON.stringify(row)) moved = true;
        newGrid[r] = row;
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...newGrid[r]].reverse();
        const { row, points } = slideRow(reversed);
        const corrected = row.reverse();
        pointsGained += points;
        if (JSON.stringify(newGrid[r]) !== JSON.stringify(corrected)) moved = true;
        newGrid[r] = corrected;
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) {
        let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        const { row, points } = slideRow(col);
        pointsGained += points;
        for (let r = 0; r < 4; r++) {
          if (newGrid[r][c] !== row[r]) moved = true;
          newGrid[r][c] = row[r];
        }
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        let col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
        const { row, points } = slideRow(col);
        const corrected = row.reverse();
        pointsGained += points;
        for (let r = 0; r < 4; r++) {
          if (newGrid[r][c] !== corrected[r]) moved = true;
          newGrid[r][c] = corrected[r];
        }
      }
    }

    if (moved) {
      sounds.playLaser();
      setHistory(h => [...h, { grid, score }]);
      addRandomTile(newGrid);
      setGrid(newGrid);

      if (pointsGained > 0) {
        sounds.playScore();
        setScore(s => {
          const ns = s + pointsGained;
          if (ns > highScore) {
            setHighScore(ns);
            localStorage.setItem('sky_2048_highscore', ns.toString());
          }
          return ns;
        });
      }

      // Check win 2048
      if (!won && newGrid.some(row => row.includes(2048))) {
        setWon(true);
        sounds.playPowerup();
      }

      // Check game over
      if (checkGameOver(newGrid)) {
        setGameOver(true);
        sounds.playGameOver();
      }
    }
  }, [grid, gameOver, highScore, score, won]);

  const checkGameOver = (board) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return false;
        if (c < 3 && board[r][c] === board[r][c + 1]) return false;
        if (r < 3 && board[r][c] === board[r + 1][c]) return false;
      }
    }
    return true;
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setGrid(last.grid);
    setScore(last.score);
    setHistory(h => h.slice(0, -1));
    setGameOver(false);
    sounds.playClick();
  };

  const restart = () => {
    setGrid(getInitialGrid());
    setScore(0);
    setHistory([]);
    setGameOver(false);
    setWon(false);
    sounds.playClick();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        move('LEFT');
        e.preventDefault();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        move('RIGHT');
        e.preventDefault();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        move('UP');
        e.preventDefault();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        move('DOWN');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileStyle = (val) => {
    const colors = {
      2: { bg: 'rgba(184, 93, 245, 0.2)', text: '#e0c3fc', border: '#b85df5', shadow: '0 0 10px rgba(184, 93, 245, 0.4)' },
      4: { bg: 'rgba(0, 242, 254, 0.2)', text: '#00f2fe', border: '#00f2fe', shadow: '0 0 12px rgba(0, 242, 254, 0.5)' },
      8: { bg: 'rgba(0, 245, 160, 0.25)', text: '#00f5a0', border: '#00f5a0', shadow: '0 0 14px rgba(0, 245, 160, 0.6)' },
      16: { bg: 'rgba(255, 210, 0, 0.25)', text: '#ffd200', border: '#ffd200', shadow: '0 0 16px rgba(255, 210, 0, 0.7)' },
      32: { bg: 'rgba(245, 45, 58, 0.3)', text: '#f52d3a', border: '#f52d3a', shadow: '0 0 18px rgba(245, 45, 58, 0.8)' },
      64: { bg: 'rgba(255, 0, 128, 0.35)', text: '#ff0080', border: '#ff0080', shadow: '0 0 20px rgba(255, 0, 128, 0.9)' },
      128: { bg: 'rgba(121, 40, 202, 0.4)', text: '#c850c0', border: '#c850c0', shadow: '0 0 24px #c850c0' },
      256: { bg: 'rgba(0, 223, 216, 0.45)', text: '#00dfd8', border: '#00dfd8', shadow: '0 0 26px #00dfd8' },
      512: { bg: 'rgba(254, 219, 55, 0.5)', text: '#fedb37', border: '#fedb37', shadow: '0 0 28px #fedb37' },
      1024: { bg: 'rgba(255, 75, 43, 0.6)', text: '#ff4b2b', border: '#ff4b2b', shadow: '0 0 32px #ff4b2b' },
      2048: { bg: 'linear-gradient(135deg, #b85df5, #f52d3a)', text: '#ffffff', border: '#ffffff', shadow: '0 0 38px #f52d3a' },
    };
    return colors[val] || { bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff', border: '#ffffff' };
  };

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge">
          <span>Score: <strong>{score}</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>Best: <strong>{highScore}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="neon-icon-btn" onClick={undo} disabled={history.length === 0} title="Undo">
            <Undo2 size={16} />
          </button>
          <button className="neon-icon-btn" onClick={restart} title="Restart">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="puzzle-2048-grid">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const style = val > 0 ? getTileStyle(val) : {};
            return (
              <div
                key={`${r}-${c}`}
                className={`tile-2048 ${val > 0 ? 'tile-active' : 'tile-empty'}`}
                style={{
                  background: style.bg,
                  color: style.text,
                  borderColor: style.border,
                  boxShadow: style.shadow
                }}
              >
                {val > 0 ? val : ''}
              </div>
            );
          })
        )}

        {gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text-red">GRID LOCKED</h2>
            <p>No more valid moves! Final Score: <strong>{score}</strong></p>
            <button className="neon-play-btn" onClick={restart}>
              <RotateCcw size={20} /> TRY AGAIN
            </button>
          </div>
        )}

        {won && (
          <div className="game-overlay" style={{ background: 'rgba(10, 20, 50, 0.92)' }}>
            <h2 className="glow-text">🎉 2048 UNLOCKED! 🎉</h2>
            <p>You fused the Quantum 2048 Core!</p>
            <button className="neon-play-btn" onClick={() => setWon(false)}>
              KEEP PLAYING
            </button>
          </div>
        )}
      </div>

      {/* Mobile Swipe Buttons */}
      <div className="mobile-dpad">
        <button className="dpad-btn up" onClick={() => move('UP')}>▲</button>
        <div className="dpad-row">
          <button className="dpad-btn left" onClick={() => move('LEFT')}>◀</button>
          <button className="dpad-btn right" onClick={() => move('RIGHT')}>▶</button>
        </div>
        <button className="dpad-btn down" onClick={() => move('DOWN')}>▼</button>
      </div>
    </div>
  );
}
