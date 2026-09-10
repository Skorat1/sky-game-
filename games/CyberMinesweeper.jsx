import React, { useState, useEffect } from 'react';
import { RotateCcw, Flag, Trophy, Bomb, Smile, Frown, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

export default function CyberMinesweeper() {
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'won', 'lost'
  const [flagMode, setFlagMode] = useState(false);
  const [flagsRemaining, setFlagsRemaining] = useState(MINES);
  const [timer, setTimer] = useState(0);

  const initBoard = () => {
    let grid = Array(ROWS).fill(null).map((_, r) =>
      Array(COLS).fill(null).map((_, c) => ({
        r,
        c,
        isMine: false,
        revealed: false,
        flagged: false,
        neighborMines: 0
      }))
    );

    // Place mines randomly
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }

    setBoard(grid);
    setGameState('ready');
    setFlagsRemaining(MINES);
    setTimer(0);
  };

  useEffect(() => {
    initBoard();
  }, []);

  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const revealCell = (r, c) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[r][c].flagged || board[r][c].revealed) return;

    if (flagMode) {
      toggleFlag(r, c);
      return;
    }

    if (gameState === 'ready') {
      setGameState('playing');
    }

    sounds.playClick();
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));

    if (newBoard[r][c].isMine) {
      // Hit a mine!
      sounds.playExplosion();
      setGameState('lost');
      // Reveal all mines
      newBoard.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.revealed = true;
      }));
      setBoard(newBoard);
      return;
    }

    // Flood fill empty cells
    const queue = [[r, c]];
    newBoard[r][c].revealed = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift();
      if (newBoard[currR][currC].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (
              nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
              !newBoard[nr][nc].revealed && !newBoard[nr][nc].flagged && !newBoard[nr][nc].isMine
            ) {
              newBoard[nr][nc].revealed = true;
              queue.push([nr, nc]);
            }
          }
        }
      }
    }

    setBoard(newBoard);

    // Check Win condition
    let unrevealedSafe = 0;
    newBoard.forEach(row => row.forEach(cell => {
      if (!cell.isMine && !cell.revealed) unrevealedSafe++;
    }));

    if (unrevealedSafe === 0) {
      sounds.playPowerup();
      setGameState('won');
    }
  };

  const toggleFlag = (r, c, e) => {
    if (e) e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[r][c].revealed) return;

    sounds.playLaser();
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const current = newBoard[r][c].flagged;

    if (!current && flagsRemaining <= 0) return;

    newBoard[r][c].flagged = !current;
    setFlagsRemaining(f => current ? f + 1 : f - 1);
    setBoard(newBoard);
  };

  const numberColors = {
    1: '#00f2fe',
    2: '#00f5a0',
    3: '#ffd200',
    4: '#b85df5',
    5: '#f52d3a',
    6: '#ff0080',
    7: '#4facfe',
    8: '#ffffff'
  };

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge">
          <Flag size={15} color="#f52d3a" />
          <span>Mines: <strong>{flagsRemaining}</strong></span>
        </div>

        <button className="neon-icon-btn" onClick={initBoard} style={{ padding: '6px 14px' }}>
          {gameState === 'lost' ? <Frown size={20} color="#f52d3a" /> : gameState === 'won' ? <Sparkles size={20} color="#ffd200" /> : <Smile size={20} color="#00f2fe" />}
        </button>

        <div className="stat-badge">
          <span>⏱️ {timer}s</span>
        </div>

        <button
          className={`neon-flag-toggle ${flagMode ? 'active' : ''}`}
          onClick={() => setFlagMode(!flagMode)}
          title="Toggle Flag Mode (for touch screens)"
        >
          <Flag size={16} /> {flagMode ? 'FLAGGING ON' : 'REVEAL MODE'}
        </button>
      </div>

      <div className="minesweeper-grid">
        {board.map((row, r) => (
          <div key={r} className="minesweeper-row">
            {row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={`minesweeper-cell ${cell.revealed ? 'cell-revealed' : 'cell-hidden'} ${cell.isMine && cell.revealed ? 'cell-mine' : ''}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(r, c, e)}
              >
                {cell.revealed ? (
                  cell.isMine ? (
                    <Bomb size={16} color="#ffffff" />
                  ) : cell.neighborMines > 0 ? (
                    <span style={{ color: numberColors[cell.neighborMines], fontWeight: 'bold' }}>
                      {cell.neighborMines}
                    </span>
                  ) : null
                ) : cell.flagged ? (
                  <Flag size={14} color="#f52d3a" />
                ) : null}
              </button>
            ))}
          </div>
        ))}

        {gameState === 'lost' && (
          <div className="game-overlay">
            <h2 className="glow-text-red">QUANTUM OVERLOAD</h2>
            <p>Mine detonation triggered!</p>
            <button className="neon-play-btn" onClick={initBoard}>
              <RotateCcw size={20} /> RETRY PROTOCOL
            </button>
          </div>
        )}

        {gameState === 'won' && (
          <div className="game-overlay">
            <h2 className="glow-text">🎉 MAINFRAME CLEARED!</h2>
            <p>All quantum mines neutralized in {timer} seconds!</p>
            <button className="neon-play-btn" onClick={initBoard}>
              <RotateCcw size={20} /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p className="game-tip-text">💡 Right-click to flag mines | Mobile: Toggle Flagging Button</p>
    </div>
  );
}
