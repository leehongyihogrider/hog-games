import { useState, useEffect } from 'react';
import { Search, Trophy, Star, Home, PlayCircle, X, RotateCcw } from 'lucide-react';
import soundPlayer from '../utils/sounds';

const WordSearch = ({ goHome, language, translations, addToLeaderboard, leaderboard, playerName }) => {
  const t = translations[language];
  const [difficulty, setDifficulty] = useState(null);
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [confetti, setConfetti] = useState([]);

  // Confetti creation function
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
    easy: { name: t.easy, size: 6, wordCount: 4, directions: ['horizontal', 'vertical'] },
    medium: { name: t.medium, size: 8, wordCount: 5, directions: ['horizontal', 'vertical', 'diagonal'] },
    hard: { name: t.hard, size: 10, wordCount: 6, directions: ['horizontal', 'vertical', 'diagonal', 'backward'] }
  };

  // Health & Wellness themed word lists for different languages
  const wordLists = {
    en: {
      easy: ['WATER', 'SLEEP', 'WALK', 'FRUIT', 'DOCTOR', 'HEALTH', 'RELAX', 'SAFE'],
      medium: ['MEDICINE', 'EXERCISE', 'VITAMIN', 'BALANCE', 'FAMILY', 'ENERGY', 'CHECKUP', 'ACTIVE', 'MINDFUL', 'HYGIENE'],
      hard: ['NUTRITION', 'WELLBEING', 'BREAKFAST', 'MOVEMENT', 'STRETCHING', 'VEGETABLES', 'SUNLIGHT', 'HYDRATION', 'STRENGTH', 'WELLNESS']
    },
    zh: {
      easy: ['水', '睡眠', '散步', '水果', '医生', '健康', '放松', '安全'],
      medium: ['药物', '运动', '维生素', '平衡', '家人', '能量', '体检', '活跃', '正念', '卫生'],
      hard: ['营养', '福祉', '早餐', '活动', '伸展', '蔬菜', '阳光', '水分', '力量', '保健']
    }
  };

  // Wellness tips mapped to words - key is the English word
  const wellnessTips = {
    en: {
      WATER: 'Drink 6-8 glasses of water daily',
      SLEEP: 'Maintain 7-8 hours of sleep nightly',
      WALK: 'Take a 15-30 minute walk every day',
      FRUIT: 'Eat colorful fruits for vitamins',
      DOCTOR: 'Schedule annual health checkups',
      HEALTH: 'Prevention is better than cure',
      RELAX: 'Practice deep breathing to reduce stress',
      SAFE: 'Keep emergency contacts accessible',
      MEDICINE: 'Set phone reminders for medication',
      EXERCISE: 'Stay active to boost brain health',
      VITAMIN: 'Get vitamin D from sunlight',
      BALANCE: 'Practice balance exercises daily',
      FAMILY: 'Social connection keeps mind sharp',
      ENERGY: 'Eat regular meals for steady energy',
      CHECKUP: 'Monitor blood pressure regularly',
      ACTIVE: 'Movement improves mood and memory',
      MINDFUL: 'Stay present and reduce worry',
      HYGIENE: 'Wash hands frequently to prevent illness',
      NUTRITION: 'Eat a rainbow of colorful foods',
      WELLBEING: 'Mental health is as important as physical',
      BREAKFAST: 'Never skip your morning meal',
      MOVEMENT: 'Every step counts for fitness',
      STRETCHING: 'Gentle stretches prevent stiffness',
      VEGETABLES: 'Leafy greens provide essential nutrients',
      SUNLIGHT: 'Morning sun boosts mood and vitamin D',
      HYDRATION: 'Dehydration affects memory and focus',
      STRENGTH: 'Light weights maintain muscle mass',
      WELLNESS: 'Small healthy habits add up'
    },
    zh: {
      水: '每天喝6-8杯水',
      睡眠: '每晚保持7-8小时睡眠',
      散步: '每天散步15-30分钟',
      水果: '吃彩色水果补充维生素',
      医生: '安排年度健康检查',
      健康: '预防胜于治疗',
      放松: '练习深呼吸减轻压力',
      安全: '保持紧急联系方式可用',
      药物: '设置手机提醒吃药',
      运动: '保持活跃促进大脑健康',
      维生素: '从阳光中获取维生素D',
      平衡: '每天练习平衡运动',
      家人: '社交联系保持头脑敏锐',
      能量: '定时进餐保持稳定能量',
      体检: '定期监测血压',
      活跃: '运动改善情绪和记忆',
      正念: '保持当下减少担忧',
      卫生: '经常洗手预防疾病',
      营养: '吃各种颜色的食物',
      福祉: '心理健康与身体健康同样重要',
      早餐: '永远不要跳过早餐',
      活动: '每一步都有助于健身',
      伸展: '轻柔拉伸防止僵硬',
      蔬菜: '绿叶蔬菜提供必需营养素',
      阳光: '晨光提升情绪和维生素D',
      水分: '脱水影响记忆和专注力',
      力量: '轻量训练保持肌肉量',
      保健: '健康的小习惯积少成多'
    }
  };

  // Define colors for letters (like the example)
  const letterColors = ['#3b82f6', '#ef4444', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

  const getLetterColor = (row, col, gridSize) => {
    const index = (row * gridSize + col) % letterColors.length;
    return letterColors[index];
  };

  const generateGrid = (level) => {
    const config = difficulties[level];
    const size = config.size;
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
    const selectedWords = [...wordLists[language][level]]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.wordCount);

    const allDirections = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
      backward: [0, -1],
      verticalBackward: [-1, 0],
      diagonalBackward: [-1, -1]
    };

    // Build available directions based on difficulty configuration
    const availableDirections = [];
    config.directions.forEach(dir => {
      if (dir === 'horizontal') {
        availableDirections.push(allDirections.horizontal);
        availableDirections.push(allDirections.backward); // horizontal backward
      } else if (dir === 'vertical') {
        availableDirections.push(allDirections.vertical);
        availableDirections.push(allDirections.verticalBackward); // vertical backward
      } else if (dir === 'diagonal') {
        availableDirections.push(allDirections.diagonal);
        availableDirections.push(allDirections.diagonalBackward); // diagonal backward
      } else if (dir === 'backward') {
        // Already added via horizontal
      }
    });

    const placedWords = [];

    selectedWords.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const [dr, dc] = availableDirections[Math.floor(Math.random() * availableDirections.length)];
        const maxRow = dr >= 0 ? size - (word.length * Math.abs(dr)) : word.length * Math.abs(dr) - 1;
        const maxCol = dc >= 0 ? size - (word.length * Math.abs(dc)) : word.length * Math.abs(dc) - 1;

        if (maxRow >= 0 && maxCol >= 0) {
          const startRow = dr >= 0 ? Math.floor(Math.random() * (maxRow + 1)) : Math.floor(Math.random() * (size - maxRow)) + maxRow;
          const startCol = dc >= 0 ? Math.floor(Math.random() * (maxCol + 1)) : Math.floor(Math.random() * (size - maxCol)) + maxCol;

          let canPlace = true;
          const positions = [];

          for (let i = 0; i < word.length; i++) {
            const row = startRow + (dr * i);
            const col = startCol + (dc * i);

            if (row < 0 || row >= size || col < 0 || col >= size) {
              canPlace = false;
              break;
            }

            // Ensure strict letter exclusivity - cell must be empty
            if (newGrid[row][col] !== '') {
              canPlace = false;
              break;
            }

            positions.push({ row, col });
          }

          if (canPlace) {
            positions.forEach((pos, i) => {
              newGrid[pos.row][pos.col] = word[i];
            });
            placedWords.push({ word, positions });
            placed = true;
          }
        }

        attempts++;
      }
    });

    // Fill empty cells with random letters
    const alphabet = language === 'zh'
      ? ['的', '一', '是', '在', '不', '了', '有', '和', '人', '这', '中', '大', '为', '上', '个', '国', '我', '以', '要', '他']
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    return { grid: newGrid, words: placedWords.map(w => w.word) };
  };

  const startGame = (level) => {
    setDifficulty(level);
    const { grid: newGrid, words: newWords } = generateGrid(level);
    setGrid(newGrid);
    setWords(newWords);
    setFoundWords([]);
    setSelectedCells([]);
    setGameOver(false);
    setShowLeaderboard(false);
    setTimeElapsed(0);

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

  const handleCellClick = (row, col) => {
    if (gameOver) return;

    // Check if cell is already found
    if (isCellFound(row, col)) return;

    const cellIndex = selectedCells.findIndex(cell => cell.row === row && cell.col === col);

    // If cell is already selected, deselect it and all cells after it
    if (cellIndex !== -1) {
      setSelectedCells(selectedCells.slice(0, cellIndex));
      return;
    }

    // If this is the first cell, just add it
    if (selectedCells.length === 0) {
      setSelectedCells([{ row, col }]);
      return;
    }

    // Check if adjacent to the last selected cell
    const lastCell = selectedCells[selectedCells.length - 1];
    const isAdjacent = Math.abs(lastCell.row - row) <= 1 && Math.abs(lastCell.col - col) <= 1;

    if (!isAdjacent) {
      // Start a new selection
      setSelectedCells([{ row, col }]);
      return;
    }

    // Check if in same direction as previous selections
    if (selectedCells.length > 1) {
      const prevCell = selectedCells[selectedCells.length - 2];
      const prevDr = lastCell.row - prevCell.row;
      const prevDc = lastCell.col - prevCell.col;
      const newDr = row - lastCell.row;
      const newDc = col - lastCell.col;

      if (prevDr !== newDr || prevDc !== newDc) {
        // Not in same direction, start new selection
        setSelectedCells([{ row, col }]);
        return;
      }
    }

    // Add cell to selection
    setSelectedCells([...selectedCells, { row, col }]);
  };

  const handleSubmitWord = () => {
    if (selectedCells.length === 0 || gameOver) return;

    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');

    if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      // Correct word found!
      soundPlayer.playSuccess();
      const newFoundWords = [...foundWords, selectedWord];
      setFoundWords(newFoundWords);

      if (newFoundWords.length === words.length) {
        setTimeout(() => {
          soundPlayer.playLevelVictory();
          createConfetti();
        }, 300);
        endGame();
      }
    } else {
      // Wrong word or already found
      soundPlayer.playError();
    }

    setSelectedCells([]);
  };

  const handleClearSelection = () => {
    setSelectedCells([]);
  };

  const endGame = () => {
    setGameOver(true);

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // Save time as score (lower is better)
    addToLeaderboard('wordsearch', playerName, timeElapsed, difficulty, timeElapsed);
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
  };

  const getStarRating = () => {
    const percentage = (foundWords.length / words.length) * 100;
    if (percentage === 100) return 3;
    if (percentage >= 70) return 2;
    return 1;
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row, col) => {
    return foundWords.some(word => {
      const wordPositions = findWordPositions(word);
      return wordPositions.some(pos => pos.row === row && pos.col === col);
    });
  };

  const findWordPositions = (word) => {
    const positions = [];
    const size = grid.length;
    const directions = [
      [0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]
    ];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (const [dr, dc] of directions) {
          let match = true;
          const wordPos = [];

          for (let i = 0; i < word.length; i++) {
            const nr = r + (dr * i);
            const nc = c + (dc * i);

            if (nr < 0 || nr >= size || nc < 0 || nc >= size || grid[nr][nc] !== word[i]) {
              match = false;
              break;
            }

            wordPos.push({ row: nr, col: nc });
          }

          if (match) return wordPos;
        }
      }
    }

    return positions;
  };

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
              <Search className="text-indigo-600" size={72} />
              {t.wordSearch || 'Word Search'}
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
              <span className="text-3xl">6x6 • 4 {t.words || 'words'}</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('medium'); }} className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>⭐ {t.medium}</span>
              <span className="text-3xl">8x8 • 5 {t.words || 'words'}</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); startGame('hard'); }} className="w-full bg-gradient-to-r from-rose-700 to-purple-800 hover:from-rose-800 hover:to-purple-900 text-white p-10 rounded-3xl text-5xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-between">
              <span>🔥 {t.hard}</span>
              <span className="text-3xl">10x10 • 6 {t.words || 'words'}</span>
            </button>
            <button onClick={() => { soundPlayer.playClick(); setShowLeaderboard(!showLeaderboard); }} className="w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white p-8 rounded-3xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-4">
              <Trophy size={56} />
              {t.viewLeaderboard}
            </button>
          </div>
          {showLeaderboard && leaderboard && leaderboard.length > 0 && (
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
                      <span className="font-bold text-blue-600 text-3xl">
                        {entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : ''}
                      </span>
                      <span className="text-lg text-gray-500 bg-gray-100 px-4 py-2 rounded-lg uppercase font-semibold">{entry.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showLeaderboard && (!leaderboard || leaderboard.length === 0) && (
            <div className="mt-10 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-8 text-center shadow-lg">
              <Trophy className="text-gray-400 mx-auto mb-4" size={64} />
              <p className="text-3xl font-semibold text-gray-600">{t.noScores || 'No scores yet!'}</p>
              <p className="text-2xl text-gray-500 mt-2">{t.beTheFirst || 'Be the first to play!'}</p>
            </div>
          )}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-blue-800 text-center font-semibold text-3xl">💡 {t.howToPlay}</p>
            <p className="text-blue-700 text-center text-2xl mt-2">{t.wordSearchTip || 'Find all hidden words in the grid by selecting letters in order!'}</p>
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
                <source src={`/tutorials/word-search-en.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-3">💡 Quick Tips:</h3>
                <ul className="text-blue-700 text-xl space-y-2">
                  <li>• Click and drag to select letters in the grid</li>
                  <li>• Find all the words from the list</li>
                  <li>• Words can be horizontal, vertical, or diagonal!</li>
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
            <Search className="text-indigo-600" size={64} />
            {currentDiff.name}
          </h1>
          <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl transition-colors text-3xl font-bold">{t.levels}</button>
        </div>

        <div className="flex justify-around items-center mb-8">
          <div className="text-center">
            <p className="text-3xl text-gray-600">{t.time || 'Time'}</p>
            <p className="text-6xl font-bold text-blue-600">
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl text-gray-600">{t.found || 'Found'}</p>
            <p className="text-6xl font-bold text-green-600">{foundWords.length}/{words.length}</p>
          </div>
        </div>

        {gameOver && !showLeaderboard && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-2xl p-8 mb-8 text-center victory-entrance shadow-2xl">
            <div className="trophy-bounce inline-block mb-4">
              <Trophy size={80} className="text-yellow-500" />
            </div>
            <h2 className="text-5xl font-bold text-green-700 mb-4">🎉 {t.youWon || 'You Won!'} 🎉</h2>
            <p className="text-3xl text-green-600 mb-2 font-semibold">{t.completedIn || 'Completed in'}:</p>
            <p className="text-6xl font-bold text-blue-600 mb-4">
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-2xl text-gray-600 mb-4">{t.fasterIsBetter || 'Faster time is better!'}</p>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={64} className={i < getStarRating() ? 'fill-yellow-400 text-yellow-400 star-sparkle' : 'text-gray-300'} />
              ))}
            </div>
            <div className="flex gap-6 justify-center mt-6">
              <button onClick={() => { soundPlayer.playClick(); setShowLeaderboard(true); }} className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 rounded-2xl transition-all transform hover:scale-105 font-bold flex items-center gap-3 text-3xl shadow-lg">
                <Trophy size={40} />
                {t.viewLeaderboard}
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
                    <div className="text-right mr-3">
                      <div className="font-bold text-blue-600 text-lg">
                        {entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : ''}
                      </div>
                    </div>
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

        <div className="mb-6">
          <h3 className="text-4xl font-bold text-gray-800 mb-4">{t.wordsToFind || 'Words to Find'}:</h3>
          <div className="flex flex-wrap gap-3">
            {words.map((word, index) => (
              <span
                key={index}
                className={`px-6 py-3 rounded-xl text-2xl font-bold ${
                  foundWords.includes(word)
                    ? 'bg-green-200 text-green-800 line-through'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div
          className="grid gap-2 mb-6"
          style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={`aspect-square rounded-xl text-4xl font-bold transition-all transform flex items-center justify-center select-none
                  ${isCellFound(r, c) ? 'bg-green-400 text-white' :
                    isCellSelected(r, c) ? 'bg-indigo-400 text-white scale-105' :
                    'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  cursor: 'pointer',
                  color: isCellFound(r, c) || isCellSelected(r, c) ? 'white' : getLetterColor(r, c, grid.length)
                }}
              >
                {cell}
              </button>
            ))
          )}
        </div>

        {selectedCells.length > 0 && (
          <div className="mb-6 bg-indigo-50 border-2 border-indigo-300 rounded-xl p-6">
            <p className="text-center text-3xl font-bold text-indigo-700 mb-4">
              {t.selected || 'Selected'}: {selectedCells.map(cell => grid[cell.row][cell.col]).join('')}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSubmitWord}
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                ✓ {t.submit || 'Submit'}
              </button>
              <button
                onClick={() => { soundPlayer.playClick(); handleClearSelection(); }}
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                ✗ {t.clear || 'Clear'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-gray-600">
          <p className="text-2xl">{t.tapToSelect || 'Tap letters in order to select a word, then tap Submit!'}</p>
        </div>
      </div>

      {/* Wellness Tips Panel - Positioned on the right side */}
      <div className="absolute -right-[420px] top-1/2 -translate-y-1/2 w-[400px] bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-400 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-500 text-white p-3 rounded-full">
            <Search size={36} />
          </div>
          <h3 className="text-3xl font-bold text-green-800">{t.wellnessTips || 'Wellness Tips'}</h3>
        </div>

        <div className="space-y-4">
          {foundWords.map((word, index) => {
            const tip = wellnessTips[language][word];
            if (!tip) return null;

            return (
              <div key={index} className="bg-white rounded-2xl p-5 shadow-md border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✓</span>
                  <div>
                    <p className="font-bold text-green-700 text-2xl mb-2">{word}</p>
                    <p className="text-gray-800 text-xl font-semibold leading-relaxed">{tip}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {foundWords.length === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-green-200 text-center">
              <p className="text-gray-600 text-xl">
                {t.findWordsToSeeTips || 'Find health words to see wellness tips!'}
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

export default WordSearch;
