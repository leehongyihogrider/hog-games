import { useState, useEffect } from 'react';
import { Hammer, Trophy, Star, Home, PlayCircle, X, RotateCcw } from 'lucide-react';
import soundPlayer from '../utils/sounds';

const WhackAMole = ({ goHome, language, translations, addToLeaderboard, leaderboard, playerName, onAITrigger }) => {
  const t = translations[language];
  const [difficulty, setDifficulty] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeMoles, setActiveMoles] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [whackCount, setWhackCount] = useState(0);
  const [nextTriggerAt, setNextTriggerAt] = useState(() => Math.floor(Math.random() * 3) + 3); // Random 3-5

  // Get random next trigger interval (3-5 whacks for faster-paced game)
  const getNextTriggerInterval = () => Math.floor(Math.random() * 3) + 3;

  const difficulties = {
    easy: { name: t.easy, speed: 1500, holes: 6, gridCols: 3, displayTime: 2500, maxMoles: 2, spawnCount: 1 },
    medium: { name: t.medium, speed: 1200, holes: 9, gridCols: 3, displayTime: 2000, maxMoles: 3, spawnCount: 1 },
    hard: { name: t.hard, speed: 1400, holes: 12, gridCols: 4, displayTime: 2200, maxMoles: 4, spawnCount: 2 },
    crazy: { name: t.crazy || 'Crazy', speed: 700, holes: 12, gridCols: 4, displayTime: 1200, maxMoles: 6, spawnCount: 2 }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isPlaying && timeLeft === 0) {
      endGame();
    }
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isPlaying && difficulty) {
      const config = difficulties[difficulty];
      const interval = setInterval(() => {
        setActiveMoles(prev => {
          // Find available holes (not currently active)
          const availableHoles = [];
          for (let i = 0; i < config.holes; i++) {
            if (!prev.includes(i)) availableHoles.push(i);
          }

          if (availableHoles.length === 0) return prev;

          // Calculate how many moles to spawn
          const molesToSpawn = Math.min(
            config.spawnCount,
            config.maxMoles - prev.length,
            availableHoles.length
          );

          if (molesToSpawn <= 0) return prev;

          const newMoles = [...prev];

          // Spawn multiple moles
          for (let i = 0; i < molesToSpawn; i++) {
            const randomIndex = Math.floor(Math.random() * availableHoles.length);
            const holeIndex = availableHoles[randomIndex];
            availableHoles.splice(randomIndex, 1); // Remove from available
            newMoles.push(holeIndex);

            // Play pop-up sound
            soundPlayer.playPopUp();

            // Schedule this mole to disappear
            setTimeout(() => {
              setActiveMoles(current => current.filter(m => m !== holeIndex));
            }, config.displayTime);
          }

          return newMoles;
        });
      }, config.speed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, difficulty]);

  // Confetti creation function
  const createConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const newConfetti = [];

    for (let i = 0; i < 50; i++) {
      const isLeft = i % 2 === 0;
      newConfetti.push({
        id: i,
        left: isLeft ? Math.random() * 20 : 80 + Math.random() * 20,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: Math.random() * 0.5,
        animationDuration: 2 + Math.random() * 2
      });
    }

    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 4000);
  };

  const startGame = (level) => {
    setDifficulty(level);
    setScore(0);
    setTimeLeft(30);
    setActiveMoles([]);
    setIsPlaying(true);
    setGameOver(false);
    setShowLeaderboard(false);
    setWhackCount(0);
    setNextTriggerAt(getNextTriggerInterval());
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    setActiveMoles([]);
    // Play dramatic victory sound and confetti
    soundPlayer.playLevelVictory();
    createConfetti();
    // Auto-save score with player name
    const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0, crazy: 2.5 };
    const finalScore = Math.round(score * difficultyMultiplier[difficulty]);
    addToLeaderboard('whack', playerName, finalScore, difficulty);

    // AI trigger: ALWAYS on completion
    if (onAITrigger) {
      setTimeout(() => {
        onAITrigger(`Player finished Whack-a-Mole with ${score} hits! Celebrate - "Nice reflexes!" or similar.`);
      }, 1000);
    }
  };

  const whackMole = (index) => {
    if (activeMoles.includes(index)) {
      // Play whack sound
      soundPlayer.playWhack();
      const newScore = score + 1;
      setScore(newScore);
      setActiveMoles(prev => prev.filter(m => m !== index));

      // Track whacks for AI triggers
      const newWhackCount = whackCount + 1;
      setWhackCount(newWhackCount);

      // AI trigger: random interval (3-5 whacks) for encouragement
      if (onAITrigger && newWhackCount >= nextTriggerAt) {
        onAITrigger(`Player whacked ${newWhackCount} moles so far! Quick encouragement - "Nice!" or "Quick hands!"`);
        setNextTriggerAt(newWhackCount + getNextTriggerInterval());
      }
    }
  };

  const backToLevelSelect = () => {
    setIsPlaying(false); // This stops the intervals via useEffect cleanup
    setGameOver(false);
    setDifficulty(null);
    setShowLeaderboard(false);
    setActiveMoles([]); // Clear any active moles and stop sounds
    setScore(0);
    setTimeLeft(30);
  };

  const getStarRating = (level, finalScore) => {
    const thresholds = { easy: [15, 10], medium: [25, 18], hard: [35, 25], crazy: [45, 35] };
    if (finalScore >= thresholds[level][0]) return 3;
    if (finalScore >= thresholds[level][1]) return 2;
    return 1;
  };

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <Hammer className="text-green-600" size={72} />
              {t.whackMole}
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
              <span className="text-3xl">6 {t.holes} • 1x</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('medium'); }} className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>⭐ {t.medium}</span>
              <span className="text-3xl">9 {t.holes} • 1.5x</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('hard'); }} className="w-full bg-gradient-to-r from-rose-700 to-purple-800 hover:from-rose-800 hover:to-purple-900 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>🔥 {t.hard}</span>
              <span className="text-3xl">12 {t.holes} • 2x • {t.multiMole || 'Multi'}</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('crazy'); }} className="w-full bg-gradient-to-r from-purple-700 to-pink-800 hover:from-purple-800 hover:to-pink-900 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>💀 {t.crazy || 'Crazy'}</span>
              <span className="text-3xl">12 {t.holes} • 2.5x • {t.insane || 'Insane!'}</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); setShowLeaderboard(!showLeaderboard); }} className="w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white p-8 rounded-3xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-4">
              <Trophy size={56} />
              {t.viewLeaderboard}
            </button>
          </div>
          {showLeaderboard && leaderboard.length > 0 && (
            <div className="mt-10 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
              <h3 className="text-4xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                <Trophy className="text-amber-500" size={48} />
                {t.topScores}
              </h3>
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
                      <span className="font-bold text-emerald-600 text-3xl">{entry.score}</span>
                      <span className="text-lg text-gray-500 bg-gray-100 px-4 py-2 rounded-lg uppercase font-semibold">{entry.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showLeaderboard && leaderboard.length === 0 && (
            <div className="mt-10 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-8 text-center shadow-lg">
              <Trophy className="text-gray-400 mx-auto mb-4" size={64} />
              <p className="text-3xl font-semibold text-gray-600">{t.noScores || 'No scores yet!'}</p>
              <p className="text-2xl text-gray-500 mt-2">{t.beTheFirst || 'Be the first to play!'}</p>
            </div>
          )}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-blue-800 text-center font-semibold text-3xl">💡 {t.howToPlay}</p>
            <p className="text-blue-700 text-center text-2xl mt-2">{t.whackTip}</p>
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
                <source src={`/tutorials/whack-a-mole-en.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">💡 Quick Tips:</h3>
                <ul className="text-blue-700 text-xl space-y-2">
                  <li>• Click on moles as quickly as possible!</li>
                  <li>• Different difficulties have different speeds</li>
                  <li>• Try to get the highest score before time runs out</li>
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
  const gridColsClass = currentDiff.gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <Hammer className="text-green-600" size={64} />
            {currentDiff.name}
          </h1>
          <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl transition-colors text-3xl font-bold">{t.levels}</button>
        </div>
        <div className="flex justify-around mb-10">
          <div className="text-center">
            <p className="text-3xl text-gray-600">{t.score}</p>
            <p className="text-6xl font-bold text-green-600">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl text-gray-600">{t.timeLeft}</p>
            <p className="text-6xl font-bold text-blue-600">{timeLeft}s</p>
          </div>
        </div>
        {gameOver && !showLeaderboard && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-2xl p-8 mb-8 text-center victory-entrance shadow-2xl">
            <div className="trophy-bounce inline-block mb-4">
              <Trophy size={80} className="text-yellow-500" />
            </div>
            <h2 className="text-5xl font-bold text-green-700 mb-4">🎉 {t.gameOver} 🎉</h2>
            <p className="text-3xl text-green-600 font-semibold mb-4">{t.finalScore} {score}</p>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={64} className={i < getStarRating(difficulty, score) ? 'fill-yellow-400 text-yellow-400 star-sparkle' : 'text-gray-300'} />
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
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 mb-8">
            <h3 className="text-3xl font-bold text-yellow-800 mb-4 text-center flex items-center justify-center gap-3">
              <Trophy className="text-yellow-600" size={48} />
              {t.leaderboard}
            </h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-4 rounded-xl">
                    <span className="font-bold text-2xl">{index + 1}.</span>
                    <span className="flex-1 ml-4 text-xl">{entry.name}</span>
                    <span className="font-bold text-green-600 text-2xl">{entry.score}</span>
                    <span className="text-lg text-gray-500 ml-4">{entry.difficulty}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-yellow-700 text-2xl">{t.noScores}</p>
            )}
            <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl transition-all font-bold text-3xl pulse-glow shadow-lg">{t.tryAnother}</button>
          </div>
        )}
        <div className={`grid ${gridColsClass} gap-8 mb-8`}>
          {[...Array(currentDiff.holes)].map((_, index) => {
            const isActive = activeMoles.includes(index);
            return (
              <button key={index} onClick={() => whackMole(index)} disabled={!isPlaying} className={`aspect-square rounded-3xl text-8xl flex items-center justify-center transition-all duration-200 transform ${isActive ? 'bg-gradient-to-br from-amber-600 to-amber-800 scale-110 shadow-2xl' : 'bg-gradient-to-br from-green-700 to-green-900 shadow-lg'} ${isPlaying ? 'hover:scale-105' : ''}`}>
                {isActive ? '🦫' : '🕳️'}
              </button>
            );
          })}
        </div>
        <div className="mt-8 text-center text-gray-600">
          <p className="text-3xl">{t.tapMoles}</p>
        </div>
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

export default WhackAMole;