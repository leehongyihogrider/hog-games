import { useState, useRef } from 'react';
import { Zap, Trophy, Star, Home, RotateCcw, PlayCircle, X } from 'lucide-react';
import soundPlayer from '../utils/sounds';

const ColorSequence = ({ goHome, language, translations, addToLeaderboard, leaderboard, playerName }) => {
  const t = translations[language];
  const [difficulty, setDifficulty] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [round, setRound] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [colorClickCounts, setColorClickCounts] = useState({});
  const shouldStopSequence = useRef(false);

  // Nutrition tips for each color - 3-5 tips per color to avoid repetition
  const nutritionTips = {
    en: {
      red: [
        'Tomatoes are rich in lycopene for heart health',
        'Red bell peppers have more vitamin C than oranges',
        'Strawberries boost immune system and brain health',
        'Beets improve blood flow and lower blood pressure',
        'Red apples contain antioxidants that protect cells'
      ],
      blue: [
        'Blueberries improve memory and cognitive function',
        'Blue foods contain anthocyanins for brain health',
        'Blackberries are high in fiber and vitamin K',
        'Purple grapes support heart and brain health'
      ],
      green: [
        'Leafy greens provide calcium for strong bones',
        'Spinach is rich in iron and folate',
        'Broccoli contains cancer-fighting compounds',
        'Green tea boosts metabolism and antioxidants',
        'Kale is one of the most nutrient-dense foods'
      ],
      yellow: [
        'Bananas provide potassium for heart health',
        'Yellow peppers support eye health with vitamin A',
        'Corn contains lutein for vision protection',
        'Pineapple has enzymes that aid digestion'
      ],
      purple: [
        'Eggplant contains fiber and antioxidants',
        'Purple cabbage has anti-inflammatory properties',
        'Purple sweet potatoes boost immune function',
        'Acai berries are superfoods for overall health'
      ],
      orange: [
        'Carrots improve vision and eye health',
        'Sweet potatoes are rich in vitamin A and fiber',
        'Oranges boost immune system with vitamin C',
        'Pumpkin supports healthy skin and eyes',
        'Mangoes provide vitamins A, C, and E'
      ]
    },
    zh: {
      red: [
        '番茄富含番茄红素有益心脏健康',
        '红甜椒维生素C含量高于橙子',
        '草莓增强免疫系统和大脑健康',
        '甜菜根改善血液循环降低血压',
        '红苹果含抗氧化剂保护细胞'
      ],
      blue: [
        '蓝莓改善记忆和认知功能',
        '蓝色食物含花青素有益大脑健康',
        '黑莓富含纤维和维生素K',
        '紫葡萄支持心脏和大脑健康'
      ],
      green: [
        '绿叶蔬菜提供钙质强健骨骼',
        '菠菜富含铁和叶酸',
        '西兰花含抗癌化合物',
        '绿茶促进新陈代谢和抗氧化',
        '羽衣甘蓝是营养最丰富的食物之一'
      ],
      yellow: [
        '香蕉提供钾有益心脏健康',
        '黄甜椒维生素A支持眼睛健康',
        '玉米含叶黄素保护视力',
        '菠萝含酶帮助消化'
      ],
      purple: [
        '茄子含纤维和抗氧化剂',
        '紫甘蓝具有抗炎特性',
        '紫薯增强免疫功能',
        '巴西莓是整体健康的超级食品'
      ],
      orange: [
        '胡萝卜改善视力和眼睛健康',
        '红薯富含维生素A和纤维',
        '橙子维生素C增强免疫系统',
        '南瓜支持健康皮肤和眼睛',
        '芒果提供维生素A、C和E'
      ]
    }
  };

  const colorSets = {
    easy: [
      { id: 0, color: 'bg-red-700', hover: 'hover:bg-red-600', name: 'red' },
      { id: 1, color: 'bg-blue-700', hover: 'hover:bg-blue-600', name: 'blue' },
      { id: 2, color: 'bg-green-700', hover: 'hover:bg-green-600', name: 'green' }
    ],
    medium: [
      { id: 0, color: 'bg-red-700', hover: 'hover:bg-red-600', name: 'red' },
      { id: 1, color: 'bg-blue-700', hover: 'hover:bg-blue-600', name: 'blue' },
      { id: 2, color: 'bg-green-700', hover: 'hover:bg-green-600', name: 'green' },
      { id: 3, color: 'bg-yellow-600', hover: 'hover:bg-yellow-500', name: 'yellow' }
    ],
    hard: [
      { id: 0, color: 'bg-red-700', hover: 'hover:bg-red-600', name: 'red' },
      { id: 1, color: 'bg-blue-700', hover: 'hover:bg-blue-600', name: 'blue' },
      { id: 2, color: 'bg-green-700', hover: 'hover:bg-green-600', name: 'green' },
      { id: 3, color: 'bg-yellow-600', hover: 'hover:bg-yellow-500', name: 'yellow' },
      { id: 4, color: 'bg-purple-700', hover: 'hover:bg-purple-600', name: 'purple' },
      { id: 5, color: 'bg-orange-700', hover: 'hover:bg-orange-600', name: 'orange' }
    ]
  };

  const difficulties = {
    easy: { name: t.easy, speed: 800, colors: 3 },
    medium: { name: t.medium, speed: 600, colors: 4 },
    hard: { name: t.hard, speed: 400, colors: 6 }
  };

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
    shouldStopSequence.current = false;
    setDifficulty(level);
    setRound(1);
    setSequence([]);
    setPlayerSequence([]);
    setIsPlaying(true);
    setGameOver(false);
    setShowLeaderboard(false);
    setColorClickCounts({}); // Reset click counts for new game
    setTimeout(() => startNewRound([], level), 500);
  };

  const startNewRound = (currentSequence, level = difficulty) => {
    const colors = colorSets[level];
    const newColor = Math.floor(Math.random() * colors.length);
    const newSequence = [...currentSequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    setIsPlayerTurn(false);
    playSequence(newSequence, level);
  };

  const playSequence = async (seq, level = difficulty) => {
    const speed = difficulties[level].speed;
    for (let i = 0; i < seq.length; i++) {
      if (shouldStopSequence.current) {
        setActiveColor(null);
        return; // Stop the sequence
      }
      await new Promise(resolve => setTimeout(resolve, speed));
      if (shouldStopSequence.current) {
        setActiveColor(null);
        return; // Stop the sequence
      }
      setActiveColor(seq[i]);
      soundPlayer.playColorTone(seq[i]); // Play tone for this color
      await new Promise(resolve => setTimeout(resolve, speed));
      setActiveColor(null);
    }
    if (!shouldStopSequence.current) {
      setIsPlayerTurn(true);
    }
  };

  const handleColorClick = (colorId) => {
    if (!isPlayerTurn || gameOver) return;

    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);

    // Track color clicks for nutrition tips
    const colorName = colorSets[difficulty][colorId].name;
    setColorClickCounts(prev => ({
      ...prev,
      [colorName]: (prev[colorName] || 0) + 1
    }));

    setActiveColor(colorId);
    soundPlayer.playColorTone(colorId); // Play tone when player clicks
    setTimeout(() => setActiveColor(null), 200);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      soundPlayer.playError(); // Wrong sequence
      endGame();
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      // Completed round successfully!
      setIsPlayerTurn(false);

      if (round >= 10) {
        // Final victory - game complete!
        setTimeout(() => {
          soundPlayer.playLevelVictory();
          createConfetti();
        }, 500);
        winGame();
      } else if (round >= 5) {
        // Round 5+ celebration with confetti!
        soundPlayer.playSuccess();
        setTimeout(() => {
          soundPlayer.playLevelVictory();
          createConfetti();
        }, 300);
        setTimeout(() => {
          setRound(round + 1);
          startNewRound(sequence);
        }, 3000); // Wait longer for confetti to show
      } else {
        // Early rounds - just success sound
        soundPlayer.playSuccess();
        setTimeout(() => {
          setRound(round + 1);
          startNewRound(sequence);
        }, 1000);
      }
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    setIsPlayerTurn(false);
    // Auto-save score with player name
    const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0 };
    const score = Math.round(round * 100 * difficultyMultiplier[difficulty]);
    addToLeaderboard('sequence', playerName, score, difficulty);
  };

  const winGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    setIsPlayerTurn(false);
    // Auto-save score with player name
    const difficultyMultiplier = { easy: 1.0, medium: 1.5, hard: 2.0 };
    const score = Math.round(10 * 100 * difficultyMultiplier[difficulty]);
    addToLeaderboard('sequence', playerName, score, difficulty);
  };

  const backToLevelSelect = () => {
    shouldStopSequence.current = true; // Stop any ongoing sequence
    setDifficulty(null);
    setIsPlaying(false);
    setGameOver(false);
    setShowLeaderboard(false);
    setActiveColor(null); // Clear any active color
  };

  const getStarRating = (level, finalRound) => {
    if (finalRound >= 10) return 3;
    if (finalRound >= 8) return 3;
    if (finalRound >= 5) return 2;
    return 1;
  };

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <Zap className="text-purple-600" size={72} />
              {t.colorSequence}
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
              <span className="text-3xl">3 {t.colors} • 1x</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('medium'); }} className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>⭐ {t.medium}</span>
              <span className="text-3xl">4 {t.colors} • 1.5x</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('hard'); }} className="w-full bg-gradient-to-r from-rose-700 to-purple-800 hover:from-rose-800 hover:to-purple-900 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>🔥 {t.hard}</span>
              <span className="text-3xl">6 {t.colors} • 2x</span>
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
            <p className="text-blue-700 text-center text-2xl mt-2">{t.sequenceTip}</p>
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
                <source src={`/tutorials/colour-sequence-en.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">💡 Quick Tips:</h3>
                <ul className="text-blue-700 text-xl space-y-2">
                  <li>• Watch the sequence carefully</li>
                  <li>• Repeat the pattern in the same order</li>
                  <li>• Each round adds one more color to remember</li>
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
  const colors = colorSets[difficulty];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-7xl w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <Zap className="text-purple-600" size={64} />
            {currentDiff.name}
          </h1>
          <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl transition-colors text-3xl font-bold">{t.levels}</button>
        </div>
        <div className="text-center mb-10">
          <p className="text-5xl text-gray-700">{t.round}: <span className="font-bold text-purple-600">{round}</span></p>
          <p className="text-3xl text-gray-600 mt-4">
            {!isPlayerTurn && isPlaying ? t.watch : isPlayerTurn ? t.yourTurn : ''}
          </p>
        </div>
        {gameOver && !showLeaderboard && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-2xl p-8 mb-8 text-center victory-entrance shadow-2xl">
            <div className="trophy-bounce inline-block mb-4">
              <Trophy size={80} className="text-yellow-500" />
            </div>
            <h2 className="text-5xl font-bold text-green-700 mb-4">{round >= 10 ? `🎉 ${t.youWon} 🎉` : `${t.wrong}`}</h2>
            <p className="text-3xl text-green-600 font-semibold mb-4">{t.reachedRound} {round}</p>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={64} className={i < getStarRating(difficulty, round) ? 'fill-yellow-400 text-yellow-400 star-sparkle' : 'text-gray-300'} />
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
                    <span className="font-bold text-purple-600 text-2xl">{entry.score}</span>
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
        <div className={`grid ${colors.length === 3 ? 'grid-cols-3' : colors.length === 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-10 max-w-4xl mx-auto mb-10`}>
          {colors.map((colorData) => (
            <button
              key={colorData.id}
              onClick={() => handleColorClick(colorData.id)}
              disabled={!isPlayerTurn}
              className={`aspect-square rounded-3xl transition-all duration-200 transform shadow-2xl ${colorData.color}
                ${activeColor === colorData.id ? 'scale-125 brightness-[2] shadow-[0_0_80px_rgba(255,255,255,1)] ring-[12px] ring-yellow-400' : 'scale-100 shadow-[0_10px_40px_rgba(0,0,0,0.3)]'}
                ${isPlayerTurn ? `${colorData.hover} hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] cursor-pointer` : 'cursor-not-allowed'}`}
              style={{
                boxShadow: activeColor === colorData.id
                  ? '0 0 80px rgba(255,255,255,1), 0 0 120px rgba(255,255,255,0.8), 0 0 160px rgba(255,255,255,0.6), inset 0 0 60px rgba(255,255,255,0.5)'
                  : '0 10px 40px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>
        <div className="mt-8 text-center text-gray-600">
          <p className="text-3xl">{isPlayerTurn ? t.yourTurn : t.watch}</p>
        </div>
      </div>

      {/* Nutrition Tips Panel - Positioned on the right side */}
      <div className="absolute -right-[420px] top-1/2 -translate-y-1/2 w-[400px] bg-gradient-to-br from-orange-50 to-amber-50 border-4 border-orange-400 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-500 text-white p-3 rounded-full">
            <Zap size={36} />
          </div>
          <h3 className="text-3xl font-bold text-orange-800">{t.nutritionTips || 'Nutrition Tips'}</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(colorClickCounts).length > 0 ? (
            (() => {
              // Collect all tips with their color info
              const allTips = [];
              Object.entries(colorClickCounts).forEach(([colorName, count]) => {
                const tips = nutritionTips[language][colorName];
                if (!tips) return;

                for (let i = 0; i < Math.min(count, tips.length); i++) {
                  allTips.push({ colorName, tip: tips[i] });
                }
              });

              // Show only the last 3 tips
              const recentTips = allTips.slice(-3);

              // Color mapping for display
              const colorClasses = {
                red: 'border-red-300 bg-red-50',
                blue: 'border-blue-300 bg-blue-50',
                green: 'border-green-300 bg-green-50',
                yellow: 'border-yellow-300 bg-yellow-50',
                purple: 'border-purple-300 bg-purple-50',
                orange: 'border-orange-300 bg-orange-50'
              };

              const colorEmojis = {
                red: '🔴',
                blue: '🔵',
                green: '🟢',
                yellow: '🟡',
                purple: '🟣',
                orange: '🟠'
              };

              return recentTips.map((item, index) => (
                <div key={index} className={`rounded-2xl p-4 shadow-md border-2 ${colorClasses[item.colorName]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{colorEmojis[item.colorName]}</span>
                    <p className="font-bold text-gray-800 text-lg capitalize">{item.colorName} {t.foods || 'Foods'}</p>
                  </div>
                  <p className="text-gray-800 text-xl font-semibold leading-relaxed">{item.tip}</p>
                </div>
              ));
            })()
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-orange-200 text-center">
              <p className="text-gray-600 text-xl">
                {t.clickColorsToSeeTips || 'Click colors to learn about nutrition!'}
              </p>
            </div>
          )}
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

export default ColorSequence;