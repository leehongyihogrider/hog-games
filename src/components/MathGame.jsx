import { useState, useEffect } from 'react';
import { Calculator, Trophy, Star, Home, RotateCcw, PlayCircle, X } from 'lucide-react';
import soundPlayer from '../utils/sounds';

const MathGame = ({ goHome, language, translations, addToLeaderboard, leaderboard, playerName }) => {
  const t = translations[language];
  const [difficulty, setDifficulty] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [problemsSolved, setProblemsSolved] = useState(0);

  const difficulties = {
    easy: { name: t.easy, range: 10, operations: ['+', '-'] },
    medium: { name: t.medium, range: 50, operations: ['+', '-', '×'] },
    hard: { name: t.hard, range: 100, operations: ['+', '-', '×', '÷'] }
  };

  // Financial literacy tips that display as problems are solved
  const financialTips = {
    en: [
      { title: "Smart Budgeting", tip: "Track your monthly expenses by writing them down. This helps you see where your money goes and find areas to save." },
      { title: "Beware of Scams", tip: "Never share your bank PIN or passwords over the phone. Banks will never call asking for this information." },
      { title: "Compare Prices", tip: "Check prices at different stores before buying. The same item can cost much less at another shop!" },
      { title: "Emergency Fund", tip: "Try to save a little each month for unexpected expenses like medical bills or home repairs." },
      { title: "Understand Bills", tip: "Review your utility bills monthly. Look for unusual charges and ask questions if something seems wrong." },
      { title: "Avoid Impulse Buys", tip: "Wait 24 hours before making non-essential purchases. This helps avoid spending on things you don't really need." },
      { title: "ATM Safety", tip: "Cover the keypad when entering your PIN at ATMs. Check for suspicious devices attached to the machine." },
      { title: "Plan Groceries", tip: "Make a shopping list before going to the supermarket. This prevents overspending on items you don't need." },
      { title: "Check Change", tip: "Always count your change when paying with cash. Mistakes can happen, so it's good to verify." },
      { title: "Beware of 'Free' Offers", tip: "Be cautious of offers that seem too good to be true. They often have hidden costs or are scams." },
      { title: "Save Receipts", tip: "Keep receipts for major purchases. You'll need them for returns, warranties, or checking expenses." },
      { title: "Understand Interest", tip: "Know the interest rates on your savings and any loans. Higher rates mean you earn more or pay more." }
    ],
    zh: [
      { title: "智能预算", tip: "写下每月的开支。这可以帮助你了解钱花在哪里，找到节省的地方。" },
      { title: "警惕诈骗", tip: "永远不要通过电话分享你的银行密码。银行绝不会打电话索要这些信息。" },
      { title: "比较价格", tip: "购买前检查不同商店的价格。同样的商品在另一家店可能便宜很多！" },
      { title: "应急基金", tip: "每月尝试存一点钱以应对意外开支，如医疗费或房屋维修。" },
      { title: "理解账单", tip: "每月查看你的水电账单。寻找异常收费，如有疑问请咨询。" },
      { title: "避免冲动购买", tip: "在购买非必需品前等待24小时。这有助于避免购买不需要的东西。" },
      { title: "ATM安全", tip: "在ATM输入密码时遮住键盘。检查是否有可疑设备连接到机器上。" },
      { title: "计划购物", tip: "去超市前列一个购物清单。这可以防止过度消费不需要的物品。" },
      { title: "检查找零", tip: "用现金付款时总是数一数找零。可能会出错，所以最好核实一下。" },
      { title: "警惕免费优惠", tip: "对看起来好得令人难以置信的优惠要谨慎。它们通常有隐藏费用或是骗局。" },
      { title: "保存收据", tip: "保留重要购买的收据。你需要它们来退货、保修或检查开支。" },
      { title: "了解利息", tip: "了解你的储蓄和贷款的利率。利率越高意味着你赚得更多或支付更多。" }
    ]
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

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isPlaying && timeLeft === 0) {
      endGame();
    }
  }, [isPlaying, timeLeft]);

  const generateProblem = (level) => {
    const config = difficulties[level];
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)];
    let num1, num2, answer;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * config.range) + 1;
        num2 = Math.floor(Math.random() * config.range) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * config.range) + 1;
        num2 = Math.floor(Math.random() * config.range) + 1;
        if (num2 > num1) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * Math.min(config.range / 5, 12)) + 1;
        num2 = Math.floor(Math.random() * Math.min(config.range / 5, 12)) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    return { num1, num2, operation, answer };
  };

  const startGame = (level) => {
    setDifficulty(level);
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setGameOver(false);
    setShowLeaderboard(false);
    setUserAnswer('');
    setFeedback('');
    setProblemsSolved(0); // Reset problems solved counter
    setCurrentProblem(generateProblem(level));
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    setCurrentProblem(null);
    // Play victory sound and confetti
    soundPlayer.playLevelVictory();
    createConfetti();
    // Auto-save score with player name (no multiplier needed, already in points per correct)
    addToLeaderboard('math', playerName, score, difficulty);
  };

  const checkAnswer = () => {
    if (!userAnswer) return;

    const numAnswer = parseInt(userAnswer);
    if (numAnswer === currentProblem.answer) {
      // Give points based on difficulty
      const pointsPerCorrect = { easy: 10, medium: 15, hard: 20 };
      setScore(score + pointsPerCorrect[difficulty]);
      setFeedback('✓');
      setTimeout(() => setFeedback(''), 300);
      // Increment problems solved when answer is correct
      setProblemsSolved(prev => prev + 1);
    } else {
      setFeedback('✗');
      setTimeout(() => setFeedback(''), 500);
    }

    setUserAnswer('');
    setCurrentProblem(generateProblem(difficulty));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const backToLevelSelect = () => {
    setDifficulty(null);
    setIsPlaying(false);
    setGameOver(false);
    setShowLeaderboard(false);
  };

  const getStarRating = (level, finalScore) => {
    const thresholds = { easy: [30, 20], medium: [25, 15], hard: [20, 12] };
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
              <Calculator className="text-blue-600" size={72} />
              {t.mathGame}
            </h1>
            <button onClick={goHome} className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold">
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
            <button onClick={() => startGame('easy')} className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>🌟 {t.easy}</span>
              <span className="text-3xl">+, - • +10 pts</span>
            </button>
            <button onClick={() => startGame('medium')} className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>⭐ {t.medium}</span>
              <span className="text-3xl">+, -, × • +15 pts</span>
            </button>
            <button onClick={() => startGame('hard')} className="w-full bg-gradient-to-r from-rose-700 to-purple-800 hover:from-rose-800 hover:to-purple-900 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>🔥 {t.hard}</span>
              <span className="text-3xl">+, -, ×, ÷ • +20 pts</span>
            </button>
            <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white p-8 rounded-3xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-4">
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
            <p className="text-blue-700 text-center text-2xl mt-2">{t.mathTip}</p>
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
                <source src={`/tutorials/math-game-en.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">💡 Quick Tips:</h3>
                <ul className="text-blue-700 text-xl space-y-2">
                  <li>• Solve math problems as quickly as possible</li>
                  <li>• Type your answer and press Enter or click Submit</li>
                  <li>• More points for harder problems!</li>
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
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-7xl w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <Calculator className="text-blue-600" size={64} />
            {currentDiff.name}
          </h1>
          <button onClick={backToLevelSelect} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl transition-colors text-3xl font-bold">{t.levels}</button>
        </div>
        <div className="flex justify-around mb-10">
          <div className="text-center">
            <p className="text-3xl text-gray-600">{t.score}</p>
            <p className="text-6xl font-bold text-blue-600">{score}</p>
            <p className="text-2xl text-gray-500 mt-2">
              {difficulty === 'easy' && '+10 per correct'}
              {difficulty === 'medium' && '+15 per correct'}
              {difficulty === 'hard' && '+20 per correct'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl text-gray-600">{t.timeLeft}</p>
            <p className="text-6xl font-bold text-orange-600">{timeLeft}s</p>
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
              <button onClick={backToLevelSelect} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl transition-all transform hover:scale-105 font-bold text-3xl shadow-lg pulse-glow">{t.tryAnother || 'Try Another'}</button>
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
                    <span className="font-bold text-blue-600 text-2xl">{entry.score}</span>
                    <span className="text-lg text-gray-500 ml-4">{entry.difficulty}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-yellow-700 text-2xl">{t.noScores}</p>
            )}
            <button onClick={backToLevelSelect} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl transition-all font-bold text-3xl pulse-glow shadow-lg">{t.tryAnother}</button>
          </div>
        )}
        {isPlaying && currentProblem && (
          <div className="text-center mb-8">
            <div className="bg-blue-50 rounded-3xl p-12 mb-6">
              <p className="text-8xl font-bold text-gray-800 mb-8">
                {currentProblem.num1} {currentProblem.operation} {currentProblem.num2} = ?
              </p>
              <input
                type="number"
                inputMode="numeric"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="?"
                className="w-64 p-6 text-6xl rounded-2xl border-4 border-blue-300 text-center focus:border-blue-500 focus:outline-none"
                autoFocus
                autoComplete="off"
              />
              {feedback && (
                <p className={`text-7xl font-bold mt-6 ${feedback === '✓' ? 'text-green-600' : 'text-red-600'}`}>
                  {feedback}
                </p>
              )}
            </div>
            <button
              onClick={checkAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl text-4xl font-bold transition-colors"
            >
              {t.submit || 'Submit'}
            </button>
          </div>
        )}
      </div>

      {/* Financial Literacy Tips Panel */}
      {isPlaying && (
        <div className="absolute -right-[420px] top-1/2 -translate-y-1/2 w-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-400 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            {t.financialTips || 'Financial Tips'}
          </h3>
          <p className="text-gray-600 text-center mb-6 text-xl font-semibold">
            {t.solveProblemsToSeeTips || 'Solve problems to learn money tips!'}
          </p>

          {problemsSolved === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-600 text-2xl font-semibold">
                💰 {t.startSolvingForTips || 'Start solving to see tips!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {financialTips[language].slice(Math.max(0, Math.min(problemsSolved, financialTips[language].length) - 3), Math.min(problemsSolved, financialTips[language].length)).map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-200">
                  <p className="font-bold text-blue-700 text-2xl mb-2">{item.title}</p>
                  <p className="text-gray-800 text-xl font-semibold leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

export default MathGame;
