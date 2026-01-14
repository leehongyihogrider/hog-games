import { useState } from 'react';
import { Columns3, ArrowLeft, Star } from 'lucide-react';

const Connect4 = ({ goHome, language, translations }) => {
  const t = translations[language];
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [showNameInput, setShowNameInput] = useState(true);
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [hoveredColumn, setHoveredColumn] = useState(null);

  const ROWS = 6;
  const COLS = 7;

  const startGame = () => {
    if (!player1Name.trim()) setPlayer1Name('Player 1');
    if (!player2Name.trim()) setPlayer2Name('Player 2');
    // Randomly choose starting player
    setCurrentPlayer(Math.random() < 0.5 ? 1 : 2);
    setShowNameInput(false);
  };

  const checkWinner = (board) => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        if (board[row][col] &&
            board[row][col] === board[row][col + 1] &&
            board[row][col] === board[row][col + 2] &&
            board[row][col] === board[row][col + 3]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]
          };
        }
      }
    }

    // Check vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row <= ROWS - 4; row++) {
        if (board[row][col] &&
            board[row][col] === board[row + 1][col] &&
            board[row][col] === board[row + 2][col] &&
            board[row][col] === board[row + 3][col]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]
          };
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        if (board[row][col] &&
            board[row][col] === board[row + 1][col + 1] &&
            board[row][col] === board[row + 2][col + 2] &&
            board[row][col] === board[row + 3][col + 3]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]
          };
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 3; col < COLS; col++) {
        if (board[row][col] &&
            board[row][col] === board[row + 1][col - 1] &&
            board[row][col] === board[row + 2][col - 2] &&
            board[row][col] === board[row + 3][col - 3]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]]
          };
        }
      }
    }

    // Check for draw
    if (board.every(row => row.every(cell => cell !== null))) {
      return { winner: 'draw', cells: [] };
    }

    return null;
  };

  const dropDisc = (col) => {
    if (winner) return;

    // Find the lowest empty row in this column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column is full

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningCells(result.cells);
      soundPlayer.playLevelVictory(); // Celebration sound for winner!
      if (result.winner === 1) {
        setPlayer1Score(prev => prev + 1);
      } else if (result.winner === 2) {
        setPlayer2Score(prev => prev + 1);
      }
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetBoard = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
    // Randomly choose starting player for next round
    setCurrentPlayer(Math.random() < 0.5 ? 1 : 2);
    setWinner(null);
    setWinningCells([]);
  };

  const resetGame = () => {
    resetBoard();
    setPlayer1Score(0);
    setPlayer2Score(0);
    setShowNameInput(true);
  };

  const isCellWinning = (row, col) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  if (showNameInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-900 to-red-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <Columns3 className="text-yellow-600" size={80} />
              {t.connect4}
            </h1>
            <button onClick={goHome} className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold">
              <ArrowLeft size={48} />
              {t.back}
            </button>
          </div>
          <p className="text-center text-gray-600 mb-10 text-4xl">{t.enterPlayerNames || 'Enter player names'}</p>
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-3xl font-bold text-gray-700 mb-3">{t.player || 'Player'} 1 (🔴):</label>
              <input
                type="text"
                inputMode="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                className="w-full p-6 text-4xl rounded-2xl border-4 border-red-300 focus:border-red-500 focus:outline-none"
                maxLength={20}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-3xl font-bold text-gray-700 mb-3">{t.player || 'Player'} 2 (🟡):</label>
              <input
                type="text"
                inputMode="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                className="w-full p-6 text-4xl rounded-2xl border-4 border-yellow-300 focus:border-yellow-500 focus:outline-none"
                maxLength={20}
                autoComplete="off"
              />
            </div>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            {t.startGame || 'Start Game!'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-900 to-red-900 p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-7xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <Columns3 className="text-yellow-600" size={72} />
            {t.connect4}
          </h1>
          <button onClick={resetGame} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-6 rounded-2xl transition-colors text-3xl font-bold flex items-center gap-3">
            <ArrowLeft size={48} />
            {t.back}
          </button>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-3xl text-center ${currentPlayer === 1 && !winner ? 'bg-red-100 border-4 border-red-500' : 'bg-gray-100'}`}>
            <p className="text-3xl font-bold text-red-800 mb-2">{player1Name} 🔴</p>
            <p className="text-7xl font-bold text-red-600">{player1Score}</p>
          </div>
          <div className={`p-6 rounded-3xl text-center ${currentPlayer === 2 && !winner ? 'bg-yellow-100 border-4 border-yellow-500' : 'bg-gray-100'}`}>
            <p className="text-3xl font-bold text-yellow-800 mb-2">{player2Name} 🟡</p>
            <p className="text-7xl font-bold text-yellow-600">{player2Score}</p>
          </div>
        </div>

        {/* Current Turn */}
        {!winner && (
          <div className="text-center mb-8">
            <p className="text-4xl font-bold text-gray-700">
              {currentPlayer === 1 ? `${player1Name}'s Turn 🔴` : `${player2Name}'s Turn 🟡`}
            </p>
          </div>
        )}

        {/* Game Board - Centered */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-8 rounded-3xl inline-block">
            <div className="grid grid-cols-7 gap-4">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => dropDisc(colIndex)}
                    onMouseEnter={() => setHoveredColumn(colIndex)}
                    onMouseLeave={() => setHoveredColumn(null)}
                    disabled={winner}
                    className={`w-28 h-28 rounded-full transition-all transform hover:scale-105 flex items-center justify-center
                      ${isCellWinning(rowIndex, colIndex) ? 'ring-8 ring-green-400 bg-white' : 'bg-white'}
                      ${hoveredColumn === colIndex && !winner && rowIndex === 0 ? 'shadow-xl shadow-blue-400' : ''}
                      ${!winner ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                  >
                    <span className="text-8xl leading-none">
                      {cell === 1 ? '🔴' : cell === 2 ? '🟡' : ''}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Winner Display */}
        {winner && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-3xl p-12 text-center">
            <h2 className="text-6xl font-bold text-green-800 mb-6">
              {winner === 'draw' ? (t.tie || "It's a Draw!") : `${winner === 1 ? player1Name : player2Name} ${t.wins || 'Wins'}!`}
            </h2>
            {winner !== 'draw' && (
              <div className="flex justify-center gap-2 mb-6">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} size={64} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}
            <button
              onClick={resetBoard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-3xl text-5xl font-bold transition-colors"
            >
              {t.playAgain}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connect4;
