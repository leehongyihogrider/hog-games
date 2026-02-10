import { useState, useEffect } from 'react';
import { ArrowUpDown, Trophy, Star, Home, RotateCcw, PlayCircle, X } from 'lucide-react';
import soundPlayer from '../utils/sounds';

const NumberSorting = ({ goHome, language, translations, addToLeaderboard, leaderboard, playerName, onAITrigger }) => {
  const t = translations[language];
  const [difficulty, setDifficulty] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [sortOrder, setSortOrder] = useState('ascending'); // 'ascending' or 'descending'
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [confetti, setConfetti] = useState([]);
  const [nextTriggerAt, setNextTriggerAt] = useState(() => Math.floor(Math.random() * 2) + 2); // Random 2-3

  // Get random next trigger interval (2-3 correct selections)
  const getNextTriggerInterval = () => Math.floor(Math.random() * 2) + 2;

  const createConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const newConfetti = [];
    for (let i = 0; i < 60; i++) {
      const isLeft = i % 2 === 0;
      newConfetti.push({
        id: i,
        left: isLeft ? Math.random() * 30 : 70 + Math.random() * 30,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: Math.random() * 0.8,
        animationDuration: 2.5 + Math.random() * 1.5
      });
    }
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 5000);
  };

  const difficulties = {
    easy: { name: t.easy, count: 5, range: 20 },
    medium: { name: t.medium, count: 7, range: 50 },
    hard: { name: t.hard, count: 10, range: 100 }
  };

  const generateNumbers = (level) => {
    const config = difficulties[level];
    const nums = new Set();

    // Generate unique random numbers
    while (nums.size < config.count) {
      nums.add(Math.floor(Math.random() * config.range) + 1);
    }

    return Array.from(nums);
  };

  const startGame = (level) => {
    setDifficulty(level);
    const newNumbers = generateNumbers(level);
    setNumbers(newNumbers);
    setSelectedNumbers([]);
    const order = Math.random() > 0.5 ? 'ascending' : 'descending';
    setSortOrder(order);
    setGameOver(false);
    setShowLeaderboard(false);
    setTimeElapsed(0);
    setMistakes(0);
    setNextTriggerAt(getNextTriggerInterval());

    // Start timer
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleNumberClick = (number) => {
    if (gameOver) return;
    if (selectedNumbers.includes(number)) return;

    const newSelected = [...selectedNumbers, number];
    setSelectedNumbers(newSelected);

    // Check if the selection is correct so far
    const isCorrect = checkSelection(newSelected);

    if (!isCorrect) {
      // Mistake made - deselect and increment mistake counter
      soundPlayer.playError(); // Wrong number selected
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setSelectedNumbers([]);

      // AI trigger: comfort on mistakes (every 2 mistakes)
      if (onAITrigger && newMistakes % 2 === 0) {
        onAITrigger(`Player made ${newMistakes} mistakes in Number Sorting. Gentle comfort - "No rush, try again!"`);
      }
      return;
    }

    // Play click sound for correct selection
    soundPlayer.playClick();

    const isComplete = newSelected.length === numbers.length;

    // AI trigger: at intervals for progress (skip if completing)
    if (onAITrigger && newSelected.length >= nextTriggerAt && !isComplete) {
      onAITrigger(`Player selected ${newSelected.length} numbers correctly! Quick encouragement - "That's right!" or "Keep going!"`);
      setNextTriggerAt(newSelected.length + getNextTriggerInterval());
    }

    // Check if game is complete
    if (isComplete) {
      setTimeout(() => {
        soundPlayer.playLevelVictory();
        createConfetti();
      }, 200);
      endGame();

      // AI trigger: ALWAYS on completion
      if (onAITrigger) {
        setTimeout(() => {
          onAITrigger(`Player completed Number Sorting with ${mistakes} mistakes! Celebrate - "All sorted! Well done!"`);
        }, 1000);
      }
    }
  };

  const checkSelection = (selected) => {
    if (selected.length === 0) return true;

    const correctOrder = [...numbers].sort((a, b) =>
      sortOrder === 'ascending' ? a - b : b - a
    );

    // Check if selected numbers match the correct order so far
    for (let i = 0; i < selected.length; i++) {
      if (selected[i] !== correctOrder[i]) {
        return false;
      }
    }

    return true;
  };

  const endGame = () => {
    setGameOver(true);

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // Calculate score: time + (mistakes * 5 seconds penalty)
    const finalScore = timeElapsed + (mistakes * 5);
    addToLeaderboard('numbersorting', playerName, finalScore, difficulty, timeElapsed);
  };

  const backToLevelSelect = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setDifficulty(null);
    setGameOver(false);
    setShowLeaderboard(false);
    setTimeElapsed(0);
    setMistakes(0);
  };

  const getStarRating = () => {
    if (mistakes === 0) return 3;
    if (mistakes <= 2) return 2;
    return 1;
  };

  const isNumberSelected = (number) => {
    return selectedNumbers.includes(number);
  };

  const getNumberPosition = (number) => {
    const index = selectedNumbers.indexOf(number);
    return index !== -1 ? index + 1 : null;
  };

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <ArrowUpDown className="text-teal-600" size={72} />
              {t.numberSorting || 'Number Sorting'}
            </h1>
            <button onClick={() => { soundPlayer.playClick(); goHome(); }} className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold">
              <Home size={48} />
              {t.home}
            </button>
          </div>
          <p className="text-center text-gray-600 mb-10 text-4xl">{t.chooseDifficulty}</p>

          <button
            onClick={() => {
              soundPlayer.playClick();
              setShowTutorial(true);
            }}
            className="w-full mb-6 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-8 py-6 rounded-3xl transition-all transform hover:scale-105 font-bold text-3xl flex items-center justify-center gap-3 shadow-lg"
          >
            <PlayCircle size={48} />
            {t.howToPlay}
          </button>

          <div className="space-y-6">
            <button onClick={() => { soundPlayer.playClick(); startGame('easy'); }} className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>🌟 {t.easy}</span>
              <span className="text-3xl">5 {t.numbers || 'numbers'} • 1-20</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('medium'); }} className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>⭐ {t.medium}</span>
              <span className="text-3xl">7 {t.numbers || 'numbers'} • 1-50</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('hard'); }} className="w-full bg-gradient-to-r from-rose-700 to-purple-800 hover:from-rose-800 hover:to-purple-900 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>🔥 {t.hard}</span>
              <span className="text-3xl">10 {t.numbers || 'numbers'} • 1-100</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); setShowLeaderboard(!showLeaderboard); }} className="w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white p-8 rounded-3xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-4">
              <Trophy size={56} />
              {t.viewLeaderboard}
            </button>
          </div>
          {showLeaderboard && (
            <div className="mt-10 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
              <h3 className="text-4xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                <Trophy className="text-amber-500" size={48} />
                {t.topScores}
              </h3>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-5 rounded-xl shadow-md border-2 border-gray-100 hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-3xl ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {index + 1}.
                        </span>
                        <span className="text-2xl font-semibold text-gray-800">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-bold text-blue-600 text-2xl">
                            {entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : ''}
                          </div>
                        </div>
                        <span className="text-lg text-gray-500 bg-gray-100 px-4 py-2 rounded-lg uppercase font-semibold">{entry.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-2xl">{t.noScores}</p>
              )}
            </div>
          )}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-blue-800 text-center font-semibold text-3xl">💡 {t.howToPlay}</p>
            <p className="text-blue-700 text-center text-2xl mt-2">{t.numberSortingTip || 'Tap numbers in the correct order (ascending or descending)!'}</p>
          </div>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full p-8 relative">
              <button
                onClick={() => {
                  soundPlayer.playClick();
                  setShowTutorial(false);
                }}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-all"
              >
                <X size={32} />
              </button>

              <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                <PlayCircle className="text-purple-600" size={48} />
                {t.howToPlay}
              </h2>

              <video controls autoPlay loop className="w-full rounded-2xl shadow-lg mb-6" style={{ maxHeight: '80vh' }}>
                <source src={`/tutorials/number-sorting-en.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">💡 Quick Tips:</h3>
                <ul className="text-blue-700 text-xl space-y-2">
                  <li>• Tap numbers in ascending or descending order</li>
                  <li>• Watch the direction indicator at the top</li>
                  <li>• Wrong taps reset your selection!</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  soundPlayer.playClick();
                  setShowTutorial(false);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-4 rounded-2xl transition-all transform hover:scale-105 font-bold text-3xl shadow-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentDiff = difficulties[difficulty];
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <ArrowUpDown className="text-teal-600" size={64} />
            {currentDiff.name}
          </h1>
          <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl transition-colors text-3xl font-bold">{t.levels}</button>
        </div>

        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
            <p className="text-4xl font-bold text-purple-700">
              {sortOrder === 'ascending' ? '📈 ' + (t.sortAscending || 'Sort: Smallest to Largest') : '📉 ' + (t.sortDescending || 'Sort: Largest to Smallest')}
            </p>
          </div>

          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-3xl text-gray-600">{t.time || 'Time'}</p>
              <p className="text-6xl font-bold text-blue-600">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-gray-600">{t.selected || 'Selected'}</p>
              <p className="text-6xl font-bold text-green-600">{selectedNumbers.length}/{numbers.length}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-gray-600">{t.mistakes || 'Mistakes'}</p>
              <p className="text-6xl font-bold text-red-600">{mistakes}</p>
            </div>
          </div>
        </div>

        {gameOver && !showLeaderboard && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-2xl p-8 mb-8 text-center victory-entrance shadow-2xl">
            <div className="trophy-bounce inline-block mb-4">
              <Trophy size={80} className="text-yellow-500" />
            </div>
            <h2 className="text-5xl font-bold text-green-700 mb-4">🎉 {t.youWon || 'You Won!'} 🎉</h2>
            <div className="bg-white rounded-xl p-6 mb-4">
              <p className="text-3xl text-gray-700 mb-2 font-semibold">{t.completedIn || 'Completed in'}:</p>
              <p className="text-6xl font-bold text-blue-600 mb-4">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-2xl text-gray-600">{t.mistakes || 'Mistakes'}: <span className="font-bold text-red-600">{mistakes}</span></p>
              {mistakes > 0 && (
                <p className="text-xl text-gray-500 mt-2">({t.penalty || 'Penalty'}: +{mistakes * 5}s)</p>
              )}
              <p className="text-2xl text-gray-600 mt-4">{t.fasterIsBetter || 'Faster time is better!'}</p>
            </div>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={64} className={i < getStarRating() ? 'fill-yellow-400 text-yellow-400 star-sparkle' : 'text-gray-300'} />
              ))}
            </div>
            <div className="flex gap-6 justify-center mt-6">
              <button onClick={() => { soundPlayer.playClick(); startGame(difficulty); }} className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 rounded-2xl transition-all transform hover:scale-105 font-bold flex items-center gap-3 text-3xl shadow-lg">
                <RotateCcw size={40} />
                {t.retryLevel || 'Retry Level'}
              </button>
              <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl transition-all transform hover:scale-105 font-bold text-3xl shadow-lg pulse-glow">{t.tryAnother || 'Try Another'}</button>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 mb-8 shadow-lg">
            <h3 className="text-4xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
              <Trophy className="text-amber-500" size={48} />
              {t.leaderboard}
            </h3>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-5 rounded-xl shadow-md border-2 border-gray-100 hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-4">
                      <span className={`font-bold text-3xl ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {index + 1}.
                      </span>
                      <span className="text-2xl font-semibold text-gray-800">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-blue-600 text-2xl">
                          {entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : ''}
                        </div>
                      </div>
                      <span className="text-lg text-gray-500 bg-gray-100 px-4 py-2 rounded-lg uppercase font-semibold">{entry.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-2xl">{t.noScores}</p>
            )}
            <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl transition-all font-bold text-3xl pulse-glow shadow-lg">{t.tryAnother}</button>
          </div>
        )}

        {!gameOver && (
          <div>
            <div className="grid grid-cols-5 gap-6 mb-8">
              {numbers.map((number) => {
                const position = getNumberPosition(number);
                return (
                  <button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    disabled={isNumberSelected(number)}
                    className={`aspect-square rounded-3xl text-5xl font-bold transition-all transform shadow-xl flex items-center justify-center relative
                      ${isNumberSelected(number)
                        ? 'bg-green-500 text-white scale-95 cursor-not-allowed'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:scale-110 hover:shadow-2xl cursor-pointer'
                      }`}
                  >
                    {number}
                    {position && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold">
                        {position}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 text-center">
              <p className="text-3xl text-gray-700">{t.tapInOrder || 'Tap numbers in the correct order!'}</p>
              <p className="text-2xl text-gray-500 mt-2">{t.mistakesReset || 'Wrong tap resets your selection'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Confetti Effect */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti confetti-left"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.backgroundColor,
            animationDelay: `${piece.animationDelay}s`,
            animationDuration: `${piece.animationDuration}s`
          }}
        />
      ))}
    </div>
  );
};

export default NumberSorting;

