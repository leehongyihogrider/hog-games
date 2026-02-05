import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Trophy, Star, Home, Award, PlayCircle, X } from 'lucide-react';
import soundPlayer from '../utils/sounds';

const MemoryGame = ({ goHome, language, translations, addToLeaderboard, leaderboard, playerName, onAITrigger }) => {
  const t = translations[language];

  // Safety hazard cards with image paths and reminders
  // Supports .jpg, .jpeg, .webp, .png - just specify the correct file extension for each image
  const safetyCards = [
    { id: 'memory_card_1', image: '/images/memory/stove.jpg', reminderKey: 'reminderStove' },
    { id: 'memory_card_2', image: '/images/memory/tap.webp', reminderKey: 'reminderTap' },
    { id: 'memory_card_3', image: '/images/memory/door.jpg', reminderKey: 'reminderDoor' },
    { id: 'memory_card_4', image: '/images/memory/lights.jpg', reminderKey: 'reminderLights' },
    { id: 'memory_card_5', image: '/images/memory/medicine.jpeg', reminderKey: 'reminderMedicine' },
    { id: 'memory_card_6', image: '/images/memory/keys.webp', reminderKey: 'reminderKeys' },
    { id: 'memory_card_7', image: '/images/memory/phone.webp', reminderKey: 'reminderPhone' },
    { id: 'memory_card_8', image: '/images/memory/wallet.jpg', reminderKey: 'reminderWallet' },
  ];

  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [actionCount, setActionCount] = useState(0);
  const [nextTriggerAt, setNextTriggerAt] = useState(() => Math.floor(Math.random() * 3) + 2); // Random 2-4

  // Get random next trigger interval (2-4 actions)
  const getNextTriggerInterval = () => Math.floor(Math.random() * 3) + 2;

  const difficulties = {
    easy: { pairs: 3, name: t.easy, gridCols: 3 },
    medium: { pairs: 6, name: t.medium, gridCols: 4 },
    hard: { pairs: 8, name: t.hard, gridCols: 4 }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerStarted && !isWon) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStarted, isWon]);

  // Confetti creation function
  const createConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const newConfetti = [];

    // Create 60 confetti pieces
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

    // Clear confetti after animation
    setTimeout(() => setConfetti([]), 5000);
  };

  const initializeGame = (level) => {
    const pairCount = difficulties[level].pairs;

    // Randomly select which cards to use for this game
    const shuffledSafetyCards = [...safetyCards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffledSafetyCards.slice(0, pairCount);

    // Shuffle the card positions
    const shuffled = [...selectedCards, ...selectedCards]
      .sort(() => Math.random() - 0.5)
      .map((card, i) => ({
        id: i,
        cardId: card.id,
        image: card.image,
        reminderKey: card.reminderKey
      }));

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setCurrentReminder(null);
    setScore(0);
    setTimeElapsed(0);
    setTimerStarted(false);
    setIsWon(false);
    setDifficulty(level);
    setShowLeaderboard(false);
    setActionCount(0);
    setNextTriggerAt(getNextTriggerInterval());
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    // Start timer on first click
    if (!timerStarted) {
      setTimerStarted(true);
    }

    // Play flip sound
    soundPlayer.playFlip();

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);
      const [first, second] = newFlipped;

      const newActionCount = actionCount + 1;
      setActionCount(newActionCount);

      if (cards[first].cardId === cards[second].cardId) {
        // Play match sound
        setTimeout(() => soundPlayer.playMatch(), 300);

        setMatched([...matched, first, second]);
        setFlipped([]);
        // Set the current reminder to display
        setCurrentReminder(cards[first].reminderKey);

        const isGameComplete = matched.length + 2 === cards.length;

        // AI trigger: random interval (2-4 actions) for success
        // But SKIP if this is the final match (completion trigger will handle it)
        if (onAITrigger && newActionCount >= nextTriggerAt && !isGameComplete) {
          onAITrigger(`Player just found a matching pair! Say something encouraging like "Nice match!" or "Wah, sharp eyes lah!"`);
          setNextTriggerAt(newActionCount + getNextTriggerInterval());
        }

        if (isGameComplete) {
          setIsWon(true);
          // Play dramatic victory sound and confetti
          setTimeout(() => {
            soundPlayer.playLevelVictory();
            createConfetti();
          }, 500);
          // Auto-save with moves and time (leaderboard will sort by moves first, then time)
          // Store as score for compatibility, but use moves as primary metric
          addToLeaderboard('memory', playerName, newMoves, difficulty, timeElapsed);

          // AI trigger: ALWAYS on completion (with delay to let sounds play first)
          if (onAITrigger) {
            setTimeout(() => {
              onAITrigger(`Player just completed the memory game in ${newMoves} moves! Celebrate big time - "Wah shiok! You did it!"`);
            }, 1000);
          }
        }
      } else {
        // Play error sound for mismatch
        setTimeout(() => soundPlayer.playError(), 600);
        setTimeout(() => setFlipped([]), 1000);

        // AI trigger: random interval (2-4 actions) for mismatch comfort
        if (onAITrigger && newActionCount >= nextTriggerAt) {
          onAITrigger(`Player just got a mismatch. Comfort them gently - "No rush lah" or "Aiyah, try again!"`);
          setNextTriggerAt(newActionCount + getNextTriggerInterval());
        }
      }
    }
  };

  const backToLevelSelect = () => {
    setDifficulty(null);
    setCards([]);
    setShowLeaderboard(false);
    setTimerStarted(false); // Stop timer
    setTimeElapsed(0);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
  };

  const getStarRating = (level, moveCount) => {
    const thresholds = {
      easy: [8, 12],
      medium: [15, 25],
      hard: [20, 35]
    };
    
    if (moveCount <= thresholds[level][0]) return 3;
    if (moveCount <= thresholds[level][1]) return 2;
    return 1;
  };

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <Sparkles className="text-yellow-500" size={72} />
              {t.memoryCard}
            </h1>
            <button
              onClick={() => { soundPlayer.playClick(); goHome(); }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold"
            >
              <Home size={48} />
              {t.home}
            </button>
          </div>
          <p className="text-center text-gray-600 mb-10 text-4xl">{t.chooseDifficulty}</p>

          <div className="space-y-6">
            <button
              onClick={() => { soundPlayer.playClick(); setShowTutorial(true); }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white p-8 rounded-3xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-4"
            >
              <PlayCircle size={56} />
              {t.howToPlay || '📖 How to Play'}
            </button>
            <button
              onClick={() => { soundPlayer.playClick(); initializeGame('easy'); }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between"
            >
              <span>🌟 {t.easy}</span>
              <span className="text-3xl">3 {t.pairs}</span>
            </button>

            <button
              onClick={() => { soundPlayer.playClick(); initializeGame('medium'); }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between"
            >
              <span>⭐ {t.medium}</span>
              <span className="text-3xl">6 {t.pairs}</span>
            </button>

            <button
              onClick={() => { soundPlayer.playClick(); initializeGame('hard'); }}
              className="w-full bg-rose-700 hover:bg-rose-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between"
            >
              <span>🔥 {t.hard}</span>
              <span className="text-3xl">8 {t.pairs}</span>
            </button>

            <button
              onClick={() => { soundPlayer.playClick(); setShowLeaderboard(!showLeaderboard); }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white p-8 rounded-3xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-4"
            >
              <Trophy size={56} />
              {t.viewLeaderboard}
            </button>
          </div>

          {showLeaderboard && leaderboard.length > 0 && (
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
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
                      <div className="text-right">
                        <div className="font-bold text-emerald-600 text-2xl">{entry.score} {t.movesCount || 'moves'}</div>
                        <div className="text-blue-600 text-xl">{entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : ''}</div>
                      </div>
                      <span className="text-lg text-gray-500 bg-gray-100 px-4 py-2 rounded-lg uppercase font-semibold">{entry.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showLeaderboard && leaderboard.length === 0 && (
            <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-8 text-center shadow-lg">
              <Trophy className="text-gray-400 mx-auto mb-4" size={64} />
              <p className="text-3xl font-semibold text-gray-600">{t.noScores || 'No scores yet!'}</p>
              <p className="text-2xl text-gray-500 mt-2">{t.beTheFirst || 'Be the first to play!'}</p>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <p className="text-blue-800 text-center font-semibold text-3xl">💡 {t.tip}</p>
            <p className="text-blue-700 text-center text-2xl mt-2">{t.memoryTip}</p>
          </div>
        </div>

        {/* Tutorial Video Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full p-8 relative">
              <button
                onClick={() => { soundPlayer.playClick(); setShowTutorial(false); }}
                className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-all transform hover:scale-110 shadow-lg"
              >
                <X size={32} />
              </button>

              <h2 className="text-5xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-4">
                <PlayCircle size={64} className="text-indigo-600" />
                {t.howToPlay || 'How to Play'}
              </h2>

              <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-6">
                <video
                  controls
                  autoPlay
                  loop
                  className="w-full"
                  style={{ maxHeight: '80vh' }}
                >
                  <source src={`/tutorials/memory-game-en.mp4`} type="video/mp4" />
                  {t.browserNotSupported || 'Your browser does not support the video tag.'}
                </video>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-3xl font-bold text-blue-800 mb-3">{t.quickTips || 'Quick Tips'}:</h3>
                <ul className="text-2xl text-blue-700 space-y-2 list-disc list-inside">
                  <li>{t.memoryTip1 || 'Tap cards to flip them over and reveal the emoji'}</li>
                  <li>{t.memoryTip2 || 'Match pairs of identical emojis'}</li>
                  <li>{t.memoryTip3 || 'Complete all pairs to win!'}</li>
                  <li>{t.memoryTip4 || 'Fewer moves = higher star rating ⭐'}</li>
                </ul>
              </div>

              <button
                onClick={() => { soundPlayer.playClick(); setShowTutorial(false); }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white p-8 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                ✓ {t.gotIt || 'Got it!'}
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
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-7xl w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <Sparkles className="text-yellow-500" size={64} />
            {currentDiff.name}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => { soundPlayer.playClick(); initializeGame(difficulty); }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold"
            >
              <RotateCcw size={48} />
              {t.restart}
            </button>
            <button
              onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl transition-colors text-3xl font-bold"
            >
              {t.levels}
            </button>
          </div>
        </div>

        <div className="text-center mb-10">
          <div className="flex justify-center gap-16">
            <p className="text-5xl text-gray-700">{t.moves}: <span className="font-bold text-purple-600">{moves}</span></p>
            <p className="text-5xl text-gray-700">{t.time || 'Time'}: <span className="font-bold text-blue-600">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span></p>
          </div>
          <p className="text-3xl text-gray-500 mt-4">
            {t.fewerMovesBetter || 'Fewer moves is better!'}
          </p>
        </div>

        {isWon && !showLeaderboard && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-2xl p-8 mb-6 text-center victory-entrance shadow-2xl">
            <div className="trophy-bounce inline-block mb-4">
              <Trophy size={80} className="text-yellow-500" />
            </div>
            <h2 className="text-5xl font-bold text-green-700 mb-4">🎉 {t.youWon} 🎉</h2>
            <p className="text-3xl text-green-600 font-semibold">{t.completedIn} {moves} {t.movesCount || 'moves'}</p>
            <p className="text-2xl text-green-600">{t.time || 'Time'}: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  size={56}
                  className={i < getStarRating(difficulty, moves) ? 'fill-yellow-400 text-yellow-400 star-sparkle' : 'text-gray-300'}
                />
              ))}
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => { soundPlayer.playClick(); initializeGame(difficulty); }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl transition-all transform hover:scale-105 font-bold text-2xl flex items-center gap-3 shadow-lg"
              >
                <RotateCcw size={32} />
                {t.retryLevel || 'Retry Level'}
              </button>
              <button
                onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all transform hover:scale-105 font-bold text-2xl shadow-lg pulse-glow"
              >
                {t.tryAnother}
              </button>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-6">
            <h3 className="text-xl font-bold text-yellow-800 mb-3 text-center flex items-center justify-center gap-2">
              <Trophy className="text-yellow-600" />
              {t.leaderboard}
            </h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                    <span className="font-bold text-xl">{index + 1}.</span>
                    <span className="flex-1 ml-3 text-lg">{entry.name}</span>
                    <div className="text-right mr-3">
                      <div className="font-bold text-purple-600 text-lg">{entry.score} {t.movesCount || 'moves'}</div>
                      <div className="text-blue-600 text-base">{entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : ''}</div>
                    </div>
                    <span className="text-sm text-gray-500">{entry.difficulty}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-yellow-700">{t.noScores}</p>
            )}
            <button
              onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all font-semibold text-xl pulse-glow"
            >
              {t.tryAnother}
            </button>
          </div>
        )}

        {/* Card Grid */}
        <div className={`grid ${gridColsClass} gap-6`}>
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                  isFlipped
                    ? isMatched
                      ? 'ring-4 ring-green-500 shadow-2xl'
                      : 'ring-4 ring-blue-500 shadow-2xl'
                    : 'bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 shadow-lg'
                }`}
                disabled={flipped.length === 2}
              >
                {isFlipped ? (
                  <img
                    src={card.image}
                    alt="Memory card"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't load
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%234ade80" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="white"%3E%E2%9C%93%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-8xl font-bold">
                    ?
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-6 text-center text-gray-600">
          <p className="text-2xl">{t.memoryGameInstruction || 'Tap cards to reveal and match pairs'}</p>
        </div>
      </div>

      {/* Absolute Right Side: Safety Reminder Panel */}
      <div className="absolute -right-[420px] top-1/2 -translate-y-1/2 w-[400px] bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-amber-400 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-4xl font-bold text-amber-900 mb-6 text-center flex items-center justify-center gap-3">
          <Sparkles className="text-amber-600" size={48} />
          {t.safetyReminders || 'Safety Reminders'}
        </h2>

        {currentReminder ? (
          <div className="space-y-6">
            {/* Display the matched card image */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <img
                src={cards.find(c => c.reminderKey === currentReminder)?.image}
                alt="Matched safety item"
                className="w-full h-48 object-cover rounded-xl"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f59e0b" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="white"%3E%E2%9A%A0%EF%B8%8F%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Display the reminder text */}
            <div className="bg-white border-4 border-amber-300 rounded-2xl p-6 shadow-lg">
              <p className="text-3xl font-bold text-amber-900 text-center leading-relaxed">
                {t[currentReminder] || 'Remember to be safe!'}
              </p>
            </div>

            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4">
              <p className="text-green-800 text-xl text-center font-semibold">
                ✓ {t.goodJob || 'Great match! Keep going!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-8xl mb-6">💡</div>
            <p className="text-2xl text-amber-800 font-semibold leading-relaxed">
              {t.matchCardsToSee || 'Match cards to see important safety reminders!'}
            </p>
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

export default MemoryGame;