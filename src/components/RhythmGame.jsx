import { useState, useEffect } from 'react';
import { Music, ArrowLeft, Star } from 'lucide-react';

const RhythmGame = ({ goHome, language, translations }) => {
  const t = translations[language];
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Streak, setPlayer1Streak] = useState(0);
  const [player2Streak, setPlayer2Streak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showNameInput, setShowNameInput] = useState(true);

  // Notes falling for each player (array of objects with position, lane, id)
  const [player1Notes, setPlayer1Notes] = useState([]);
  const [player2Notes, setPlayer2Notes] = useState([]);

  // Track which lanes are currently pressed
  const [player1Pressed, setPlayer1Pressed] = useState({ left: false, middle: false, right: false });
  const [player2Pressed, setPlayer2Pressed] = useState({ left: false, middle: false, right: false });

  const lanes = ['left', 'middle', 'right'];
  const laneColors = {
    left: 'bg-red-500',
    middle: 'bg-yellow-500',
    right: 'bg-blue-500'
  };

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameStarted && timeLeft === 0) {
      endGame();
    }
  }, [gameStarted, timeLeft]);

  // Spawn notes for players
  useEffect(() => {
    if (gameStarted) {
      const spawnInterval = setInterval(() => {
        // Spawn note for player 1
        const randomLane1 = lanes[Math.floor(Math.random() * lanes.length)];
        setPlayer1Notes(prev => [...prev, {
          id: Date.now() + Math.random(),
          lane: randomLane1,
          position: 0 // 0 = top, 100 = bottom (hit zone)
        }]);

        // Spawn note for player 2
        const randomLane2 = lanes[Math.floor(Math.random() * lanes.length)];
        setPlayer2Notes(prev => [...prev, {
          id: Date.now() + Math.random() + 0.5,
          lane: randomLane2,
          position: 0
        }]);
      }, 1200); // Spawn every 1.2 seconds

      return () => clearInterval(spawnInterval);
    }
  }, [gameStarted]);

  // Move notes down
  useEffect(() => {
    if (gameStarted) {
      const moveInterval = setInterval(() => {
        setPlayer1Notes(prev => {
          const updated = prev.map(note => ({
            ...note,
            position: note.position + 3 // Move down by 3% per tick
          }));
          // Check if any notes were missed (went past hit zone without being hit)
          const missedNotes = updated.filter(note => note.position > 110);
          if (missedNotes.length > 0) {
            setPlayer1Streak(0); // Reset streak for missed notes
          }
          // Remove notes that went past the screen
          return updated.filter(note => note.position <= 110);
        });

        setPlayer2Notes(prev => {
          const updated = prev.map(note => ({
            ...note,
            position: note.position + 3
          }));
          // Check if any notes were missed (went past hit zone without being hit)
          const missedNotes = updated.filter(note => note.position > 110);
          if (missedNotes.length > 0) {
            setPlayer2Streak(0); // Reset streak for missed notes
          }
          return updated.filter(note => note.position <= 110);
        });
      }, 50); // Update every 50ms for smooth animation

      return () => clearInterval(moveInterval);
    }
  }, [gameStarted]);

  const startGame = () => {
    // Use default names if empty
    if (!player1Name.trim()) setPlayer1Name('Player 1');
    if (!player2Name.trim()) setPlayer2Name('Player 2');

    setGameStarted(true);
    setShowNameInput(false);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Streak(0);
    setPlayer2Streak(0);
    setTimeLeft(60);
    setGameOver(false);
    setPlayer1Notes([]);
    setPlayer2Notes([]);
  };

  const handleTap = (player, lane) => {
    if (player === 1) {
      // Check if there's a note in the green hit zone (position 70-105, generous window for elderly users)
      const hitNote = player1Notes.find(note =>
        note.lane === lane && note.position >= 70 && note.position <= 105
      );

      if (hitNote) {
        // Perfect hit!
        const newStreak = player1Streak + 1;
        setPlayer1Streak(newStreak);
        const multiplier = Math.min(Math.floor(newStreak / 3) + 1, 6); // Max 6x multiplier
        setPlayer1Score(prev => prev + (20 * multiplier));

        // Remove the hit note
        setPlayer1Notes(prev => prev.filter(note => note.id !== hitNote.id));

        // Visual feedback
        setPlayer1Pressed(prev => ({ ...prev, [lane]: true }));
        setTimeout(() => setPlayer1Pressed(prev => ({ ...prev, [lane]: false })), 100);
      }
      // Note: No streak reset on miss tap, only on missed notes (handled in move logic)
    } else {
      const hitNote = player2Notes.find(note =>
        note.lane === lane && note.position >= 70 && note.position <= 105
      );

      if (hitNote) {
        const newStreak = player2Streak + 1;
        setPlayer2Streak(newStreak);
        const multiplier = Math.min(Math.floor(newStreak / 3) + 1, 6);
        setPlayer2Score(prev => prev + (20 * multiplier));

        setPlayer2Notes(prev => prev.filter(note => note.id !== hitNote.id));

        setPlayer2Pressed(prev => ({ ...prev, [lane]: true }));
        setTimeout(() => setPlayer2Pressed(prev => ({ ...prev, [lane]: false })), 100);
      }
      // Note: No streak reset on miss tap, only on missed notes (handled in move logic)
    }
  };

  const endGame = () => {
    setGameStarted(false);
    setGameOver(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setShowNameInput(true);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Streak(0);
    setPlayer2Streak(0);
    setTimeLeft(60);
    setPlayer1Notes([]);
    setPlayer2Notes([]);
  };

  const getWinner = () => {
    if (player1Score > player2Score) return player1Name;
    if (player2Score > player1Score) return player2Name;
    return 'Tie!';
  };

  if (showNameInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <Music className="text-purple-600" size={80} />
              {t.rhythmBattle}
            </h1>
            <button onClick={goHome} className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold">
              <ArrowLeft size={48} />
              {t.back}
            </button>
          </div>
          <p className="text-center text-gray-600 mb-10 text-4xl">{t.enterPlayerNames || 'Enter player names'}</p>
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-3xl font-bold text-gray-700 mb-3">{t.player || 'Player'} 1:</label>
              <input
                type="text"
                inputMode="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                className="w-full p-6 text-4xl rounded-2xl border-4 border-purple-300 focus:border-purple-500 focus:outline-none"
                maxLength={20}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-3xl font-bold text-gray-700 mb-3">{t.player || 'Player'} 2:</label>
              <input
                type="text"
                inputMode="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                className="w-full p-6 text-4xl rounded-2xl border-4 border-pink-300 focus:border-pink-500 focus:outline-none"
                maxLength={20}
                autoComplete="off"
              />
            </div>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            {t.startGame || 'Start Game!'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 w-full" style={{ maxWidth: '1800px' }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-5xl font-bold text-white flex items-center gap-6">
            <Music className="text-purple-400" size={64} />
            {t.rhythmBattle}
          </h1>
          <button onClick={resetGame} className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl transition-colors text-2xl font-bold flex items-center gap-2">
            <ArrowLeft size={32} />
            {t.back}
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-yellow-400">{t.timeLeft}: {timeLeft}s</p>
        </div>

        {!gameOver && (
          <div className="grid grid-cols-2" style={{ gap: '50px' }}>
            {/* Player 1 Side */}
            <div className="bg-purple-950 rounded-3xl p-6 border-4 border-purple-500">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold text-purple-300 mb-2">{player1Name}</h2>
                <p className="text-6xl font-bold text-white mb-1">{player1Score}</p>
                <p className="text-2xl text-purple-300 min-h-[2rem]">
                  {player1Streak > 0 ? `🔥 ${player1Streak} Streak! x${Math.min(Math.floor(player1Streak / 3) + 1, 6)}` : ' '}
                </p>
              </div>

              {/* Game area - notes falling */}
              <div className="relative h-[500px] bg-black rounded-2xl overflow-hidden border-4 border-purple-700">
                {/* Falling notes */}
                {player1Notes.map(note => (
                  <div
                    key={note.id}
                    className={`absolute w-1/3 h-16 ${laneColors[note.lane]} rounded-xl opacity-80 flex items-center justify-center text-white font-bold text-2xl transition-all duration-75 ease-linear`}
                    style={{
                      top: `${note.position}%`,
                      left: note.lane === 'left' ? '0%' : note.lane === 'middle' ? '33.33%' : '66.66%',
                    }}
                  >
                    ♪
                  </div>
                ))}

                {/* Hit zone indicator - Larger zone for elderly users */}
                <div className="absolute bottom-12 w-full h-25 border-4 border-dashed border-green-500 rounded-lg" style={{ borderWidth: '6px' }}></div>

                {/* Lane dividers */}
                <div className="absolute top-0 left-1/3 w-1 h-full bg-gray-700"></div>
                <div className="absolute top-0 left-2/3 w-1 h-full bg-gray-700"></div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  onTouchStart={() => handleTap(1, 'left')}
                  onMouseDown={() => handleTap(1, 'left')}
                  className={`${player1Pressed.left ? 'bg-red-700' : 'bg-red-500'} hover:bg-red-600 text-white p-8 rounded-2xl text-4xl font-bold transition-all shadow-lg`}
                >
                  ◀
                </button>
                <button
                  onTouchStart={() => handleTap(1, 'middle')}
                  onMouseDown={() => handleTap(1, 'middle')}
                  className={`${player1Pressed.middle ? 'bg-yellow-700' : 'bg-yellow-500'} hover:bg-yellow-600 text-white p-8 rounded-2xl text-4xl font-bold transition-all shadow-lg`}
                >
                  ▲
                </button>
                <button
                  onTouchStart={() => handleTap(1, 'right')}
                  onMouseDown={() => handleTap(1, 'right')}
                  className={`${player1Pressed.right ? 'bg-blue-700' : 'bg-blue-500'} hover:bg-blue-600 text-white p-8 rounded-2xl text-4xl font-bold transition-all shadow-lg`}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Player 2 Side */}
            <div className="bg-pink-950 rounded-3xl p-6 border-4 border-pink-500">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold text-pink-300 mb-2">{player2Name}</h2>
                <p className="text-6xl font-bold text-white mb-1">{player2Score}</p>
                <p className="text-2xl text-pink-300 min-h-[2rem]">
                  {player2Streak > 0 ? `🔥 ${player2Streak} Streak! x${Math.min(Math.floor(player2Streak / 3) + 1, 6)}` : ' '}
                </p>
              </div>

              {/* Game area - notes falling */}
              <div className="relative h-[500px] bg-black rounded-2xl overflow-hidden border-4 border-pink-700">
                {/* Falling notes */}
                {player2Notes.map(note => (
                  <div
                    key={note.id}
                    className={`absolute w-1/3 h-16 ${laneColors[note.lane]} rounded-xl opacity-80 flex items-center justify-center text-white font-bold text-2xl transition-all duration-75 ease-linear`}
                    style={{
                      top: `${note.position}%`,
                      left: note.lane === 'left' ? '0%' : note.lane === 'middle' ? '33.33%' : '66.66%',
                    }}
                  >
                    ♪
                  </div>
                ))}

                {/* Hit zone indicator - Larger zone for elderly users */}
                <div className="absolute bottom-12 w-full h-25 border-4 border-dashed border-green-500 rounded-lg" style={{ borderWidth: '6px' }}></div>

                {/* Lane dividers */}
                <div className="absolute top-0 left-1/3 w-1 h-full bg-gray-700"></div>
                <div className="absolute top-0 left-2/3 w-1 h-full bg-gray-700"></div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  onTouchStart={() => handleTap(2, 'left')}
                  onMouseDown={() => handleTap(2, 'left')}
                  className={`${player2Pressed.left ? 'bg-red-700' : 'bg-red-500'} hover:bg-red-600 text-white p-8 rounded-2xl text-4xl font-bold transition-all shadow-lg`}
                >
                  ◀
                </button>
                <button
                  onTouchStart={() => handleTap(2, 'middle')}
                  onMouseDown={() => handleTap(2, 'middle')}
                  className={`${player2Pressed.middle ? 'bg-yellow-700' : 'bg-yellow-500'} hover:bg-yellow-600 text-white p-8 rounded-2xl text-4xl font-bold transition-all shadow-lg`}
                >
                  ▲
                </button>
                <button
                  onTouchStart={() => handleTap(2, 'right')}
                  onMouseDown={() => handleTap(2, 'right')}
                  className={`${player2Pressed.right ? 'bg-blue-700' : 'bg-blue-500'} hover:bg-blue-600 text-white p-8 rounded-2xl text-4xl font-bold transition-all shadow-lg`}
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-500 rounded-3xl p-12 text-center">
            <h2 className="text-6xl font-bold text-purple-900 mb-6">🎉 {t.gameOver}</h2>
            <p className="text-5xl text-purple-700 mb-6">
              {getWinner() === 'Tie!' ? t.tie || 'It\'s a Tie!' : `${getWinner()} ${t.wins || 'Wins'}!`}
            </p>
            <div className="flex justify-center gap-2 mb-8">
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={64} className={i < (getWinner() === 'Tie!' ? 2 : 3) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <p className="text-4xl text-gray-700 mb-8">
              {player1Name}: {player1Score} 🎵 • {player2Name}: {player2Score} 🎵
            </p>
            <button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 rounded-3xl text-5xl font-bold transition-colors">
              {t.playAgain}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RhythmGame;
