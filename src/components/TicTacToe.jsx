import { useState } from 'react';
import { Grid3x3, ArrowLeft, Star } from 'lucide-react';

const TicTacToe = ({ goHome, language, translations }) => {
  const t = translations[language];
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [showNameInput, setShowNameInput] = useState(true);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const startGame = () => {
    if (!player1Name.trim()) setPlayer1Name('Player 1');
    if (!player2Name.trim()) setPlayer2Name('Player 2');
    // Randomly choose starting player
    setCurrentPlayer(Math.random() < 0.5 ? 1 : 2);
    setShowNameInput(false);
  };

  const checkWinner = (newBoard) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinningLine(pattern);
        return newBoard[a]; // Returns 'X' or 'O'
      }
    }
    if (newBoard.every(cell => cell !== null)) {
      return 'draw';
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer === 1 ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      soundPlayer.playLevelVictory(); // Celebration sound for winner!
      if (gameWinner === 'X') {
        setPlayer1Score(prev => prev + 1);
      } else if (gameWinner === 'O') {
        setPlayer2Score(prev => prev + 1);
      }
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    // Randomly choose starting player for next round
    setCurrentPlayer(Math.random() < 0.5 ? 1 : 2);
    setWinner(null);
    setWinningLine([]);
  };

  const resetGame = () => {
    resetBoard();
    setPlayer1Score(0);
    setPlayer2Score(0);
    setShowNameInput(true);
  };

  if (showNameInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <Grid3x3 className="text-blue-600" size={80} />
              {t.ticTacToe}
            </h1>
            <button onClick={goHome} className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold">
              <ArrowLeft size={48} />
              {t.back}
            </button>
          </div>
          <p className="text-center text-gray-600 mb-10 text-4xl">{t.enterPlayerNames || 'Enter player names'}</p>
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-3xl font-bold text-gray-700 mb-3">{t.player || 'Player'} 1 (X):</label>
              <input
                type="text"
                inputMode="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                className="w-full p-6 text-4xl rounded-2xl border-4 border-blue-300 focus:border-blue-500 focus:outline-none"
                maxLength={20}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-3xl font-bold text-gray-700 mb-3">{t.player || 'Player'} 2 (O):</label>
              <input
                type="text"
                inputMode="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                className="w-full p-6 text-4xl rounded-2xl border-4 border-red-300 focus:border-red-500 focus:outline-none"
                maxLength={20}
                autoComplete="off"
              />
            </div>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            {t.startGame || 'Start Game!'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <Grid3x3 className="text-blue-600" size={72} />
            {t.ticTacToe}
          </h1>
          <button onClick={resetGame} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-6 rounded-2xl transition-colors text-3xl font-bold flex items-center gap-3">
            <ArrowLeft size={48} />
            {t.back}
          </button>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-3xl text-center ${currentPlayer === 1 && !winner ? 'bg-blue-100 border-4 border-blue-500' : 'bg-gray-100'}`}>
            <p className="text-3xl font-bold text-blue-800 mb-2">{player1Name} (X)</p>
            <p className="text-7xl font-bold text-blue-600">{player1Score}</p>
          </div>
          <div className={`p-6 rounded-3xl text-center ${currentPlayer === 2 && !winner ? 'bg-red-100 border-4 border-red-500' : 'bg-gray-100'}`}>
            <p className="text-3xl font-bold text-red-800 mb-2">{player2Name} (O)</p>
            <p className="text-7xl font-bold text-red-600">{player2Score}</p>
          </div>
        </div>

        {/* Current Turn */}
        {!winner && (
          <div className="text-center mb-8">
            <p className="text-4xl font-bold text-gray-700">
              {currentPlayer === 1 ? `${player1Name}'s Turn (X)` : `${player2Name}'s Turn (O)`}
            </p>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={winner || cell}
              className={`aspect-square rounded-3xl text-9xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center
                ${winningLine.includes(index) ? 'bg-green-400 text-white' : 'bg-gray-100 hover:bg-gray-200'}
                ${cell === 'X' ? 'text-blue-600' : 'text-red-600'}
                ${!cell && !winner ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Winner Display */}
        {winner && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-3xl p-12 text-center mb-8">
            <h2 className="text-6xl font-bold text-green-800 mb-6">
              {winner === 'draw' ? (t.tie || "It's a Draw!") : `${winner === 'X' ? player1Name : player2Name} ${t.wins || 'Wins'}!`}
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

export default TicTacToe;
