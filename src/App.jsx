import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Hammer, Zap, Globe, Calculator, Users, BarChart3, Shield, Columns3, Home, Search, Music, ArrowUpDown, Trophy, Grid3x3, HelpCircle } from 'lucide-react';
import MemoryGame from './components/MemoryGame';
import WhackAMole from './components/WhackAMole';
import ColorSequence from './components/ColourSequence';
import MathGame from './components/MathGame';
import TicTacToe from './components/TicTacToe';
import Connect4 from './components/Connect4';
import WordSearch from './components/WordSearch';
import RhythmGame from './components/RhythmGame';
import NumberSorting from './components/NumberSorting';
import QuizGame from './components/QuizGame';
import Statistics from './components/Statistics';
import Achievements from './components/Achievements';
import AdminPanel from './components/AdminPanel';
import AICompanion from './components/AICompanion';
import soundPlayer from './utils/sounds';
import {
  subscribeToLeaderboard,
  addScore,
  updatePlayerStats,
  subscribeToPlayerStats,
  getDailyChallenges,
  saveDailyChallenges,
  updateChallengeCompletion,
  incrementChallengesCompleted,
} from './firebase';
import './App.css';

// Translations
const translations = {
  en: {
    title: 'Brain Games',
    subtitle: 'Choose a game to play!',
    memoryCard: 'Memory Cards',
    whackMole: 'Whack-a-Mole',
    colorSequence: 'Color Sequence',
    mathGame: 'Math Challenge',
    welcome: 'Welcome!',
    welcomeMsg: 'Tap any game above to start playing and exercising your brain!',
    home: 'Home',
    levels: 'Levels',
    restart: 'Restart',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    crazy: 'Crazy',
    multiMole: 'Multi-Mole',
    insane: 'Insane!',
    pairs: 'Pairs',
    holes: 'Holes',
    slow: 'Slow',
    colors: 'Colors',
    tip: 'Tip',
    memoryTip: 'Match cards to learn important daily safety reminders!',
    howToPlay: 'How to Play',

    // Memory Game - Safety Reminders
    safetyReminders: 'Safety Reminders',
    memoryGameInstruction: 'Tap cards to reveal and match pairs',
    matchCardsToSee: 'Match cards to see important safety reminders!',
    goodJob: 'Great match! Keep going!',
    reminderStove: "Don't forget to turn off the stove!",
    reminderTap: "Remember to turn off the water tap!",
    reminderDoor: "Check if the door is locked before sleeping!",
    reminderLights: "Turn off the lights when leaving the room!",
    reminderMedicine: "Take your medicine on time!",
    reminderKeys: "Always keep your keys in the same place!",
    reminderPhone: "Keep your phone charged and nearby!",
    reminderWallet: "Check you have your wallet before going out!",
    whackTip: 'Tap the moles as they pop up! You have 30 seconds. The faster you tap, the higher your score!',
    sequenceTip: 'Watch the sequence of colors light up, then repeat it by tapping! Each round adds one more color.',
    moves: 'Moves',
    fewerMovesBetter: 'Fewer moves is better!',
    youWon: 'You Won!',
    movesCount: 'moves!',
    tryAnother: 'Try Another Level',
    tapCards: 'Tap cards to flip them and find matching pairs!',
    score: 'Score',
    round: 'Round',
    timeLeft: 'Time Left',
    gameOver: 'Game Over!',
    finalScore: 'Final Score:',
    playAgain: 'Play Again',
    tapMoles: 'Tap the moles when they appear!',
    chooseDifficulty: 'Choose Your Difficulty Level',
    language: 'Language',
    watch: 'Watch...',
    yourTurn: 'Your Turn!',
    wrong: 'Wrong Sequence!',
    reachedRound: 'Reached Round',
    enterName: 'Enter Your Name',
    saveScore: 'Save Score',
    skip: 'Skip',
    leaderboard: 'Leaderboard',
    topScores: 'Top Scores',
    date: 'Date',
    noScores: 'No scores yet! Be the first!',
    viewLeaderboard: 'View Leaderboard',
    welcomeToGames: 'Welcome to Brain Games!',
    enterNamePrompt: 'Please enter your name to track your progress',
    namePlaceholder: 'Enter your name',
    continue: 'Continue',
    changeName: 'Change Name',
    mathTip: 'Solve as many math problems as you can in 60 seconds! The faster you solve, the higher your score!',
    submit: 'Submit',
    turn: 'Turn',
    question: 'Question',
    tie: 'It\'s a Tie!',
    wins: 'Wins',
    statistics: 'Statistics',
    playerStats: 'Player Statistics',
    totalGames: 'Total Games',
    playTime: 'Play Time',
    favoriteGame: 'Most Played Game',
    gamesPlayed: 'Games Played',
    personalBests: 'Personal Best Scores',
    recentActivity: 'Recent Activity',
    noStatsYet: 'No statistics yet!',
    playGamesToSee: 'Play some games to see your stats here.',
    noGamesYet: 'None',
    difficulty: 'Difficulty',
    guestMode: 'Play as Guest',
    guestModeDesc: '(No progress saved)',
    guestStatsWarning: 'You are in Guest Mode',
    guestStatsDesc: 'Statistics and scores are not being saved. Sign in to track your progress!',
    logout: 'Logout',
    switchPlayer: 'Switch Player',
    signIn: 'Sign In',
    chooseMode: 'Choose Your Mode',
    singlePlayer: 'Single Player',
    singlePlayerDesc: 'Play solo with progress tracking',
    multiplayer: 'Multiplayer',
    multiplayerDesc: 'Play with friends - No sign in needed',
    ticTacToe: 'Tic Tac Toe',
    ticTacToeTip: 'Get 3 in a row to win! Take turns placing X or O. Block your opponent while making your own line!',
    connect4: 'Connect 4',
    connect4Tip: 'Drop your colored discs into columns. First to get 4 in a row (horizontal, vertical, or diagonal) wins!',
    startGame: 'Start Game',
    or: 'OR',
    back: 'Back',
    wordSearch: 'Word Search',
    words: 'words',
    wordsToFind: 'Words to Find',
    dragToSelect: 'Drag across letters to select a word!',
    tapToSelect: 'Tap letters in order to select a word, then tap Submit!',
    wordSearchTip: 'Tap letters in order to select a word, then tap Submit!',
    selected: 'Selected',
    time: 'Time',
    fasterIsBetter: 'Faster time is better!',
    rhythmBattle: 'Rhythm Battle',
    rhythmTip: 'Tap the tiles when they reach the GREEN TARGET ZONE at the bottom! Perfect timing = more points!',
    enterPlayerNames: 'Enter player names',
    numberSorting: 'Number Sorting',
    numbers: 'numbers',
    sortAscending: 'Sort: Smallest to Largest',
    sortDescending: 'Sort: Largest to Smallest',
    numberSortingTip: 'Tap numbers in the correct order (ascending or descending)!',
    mistakes: 'Mistakes',
    penalty: 'Penalty',
    tapInOrder: 'Tap numbers in the correct order!',
    mistakesReset: 'Wrong tap resets your selection',

    // Word Search Wellness
    wellnessTips: 'Wellness Tips',
    findWordsToSeeTips: 'Find health words to see wellness tips!',

    // Colour Sequence Nutrition
    nutritionTips: 'Nutrition Tips',
    clickColorsToSeeTips: 'Click colors to learn about nutrition!',
    foods: 'Foods',

    // Math Game Financial Literacy
    financialTips: 'Financial Tips',
    solveProblemsToSeeTips: 'Solve problems to learn money tips!',
    startSolvingForTips: 'Start solving to see tips!',

    // Achievements & Challenges
    achievements: 'Achievements',
    dailyChallenges: 'Daily Challenges',
    unlocked: 'Unlocked',
    progress: 'Progress',
    challengesComplete: 'Challenges Complete',
    todaysChallenges: "Today's Challenges",
    challenge: 'Challenge',
    target: 'Target',
    challengeHint: 'New challenges appear every day! Come back tomorrow for more!',
    completed: 'Done!',
    inProgress: 'In Progress',
    allChallengesComplete: "Amazing! You've completed all today's challenges!",

    // Achievement Categories
    starterCategory: 'First Steps',
    masteryCategory: 'Game Mastery',
    consistencyCategory: 'Consistency',
    varietyCategory: 'Variety',
    challengesCategory: 'Daily Challenges',

    // Individual Achievements
    firstGame: 'First Steps',
    firstGameDesc: 'Complete your first game',
    fiveGames: 'Getting Started',
    fiveGamesDesc: 'Play 5 games',
    tenGames: 'Dedicated Player',
    tenGamesDesc: 'Play 10 games',
    threeStars: 'Perfect Score',
    threeStarsDesc: 'Get 3 stars in any game',
    masterEasy: 'Easy Master',
    masterEasyDesc: 'Get 3 stars in all easy modes',
    masterMedium: 'Medium Master',
    masterMediumDesc: 'Get 3 stars in all medium modes',
    masterHard: 'Hard Master',
    masterHardDesc: 'Get 3 stars in all hard modes',
    streak3: '3 Day Streak',
    streak3Desc: 'Play 3 days in a row',
    streak7: 'Week Warrior',
    streak7Desc: 'Play 7 days in a row',
    streak30: 'Monthly Champion',
    streak30Desc: 'Play 30 days in a row',
    tryAll: 'Explorer',
    tryAllDesc: 'Try all available games',
    allDifficulties: 'Challenge Seeker',
    allDifficultiesDesc: 'Play all difficulty levels',
    firstChallenge: 'Challenge Accepted',
    firstChallengeDesc: 'Complete your first daily challenge',
    fiveChallenges: 'Challenge Hunter',
    fiveChallengesDesc: 'Complete 5 daily challenges',
    tenChallenges: 'Challenge Master',
    tenChallengesDesc: 'Complete 10 daily challenges',

    // Challenge Descriptions
    challengeMemoryEasy: 'Get 3 stars in Memory Easy',
    challengeWhackMedium: 'Score 25+ in Whack-a-Mole Medium',
    challengeSequenceHard: 'Reach round 5+ in Color Sequence Hard',
    challengeWordSearchEasy: 'Complete Word Search Easy under 2 minutes',
    challengeMathMedium: 'Score 15+ in Math Challenge Medium',
    challengeNumberSortingEasy: 'Get 3 stars in Number Sorting Easy',
    conflicts: 'conflicts',
    fixConflicts: 'Red cells have duplicates in their row, column, or box',

    normal: 'Normal',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',

    // Quiz Game
    quiz: 'Quiz',
    quizDesc: 'Answer questions set by admin',
    quizTip: 'Read each question carefully and type your answer. Numbers can be entered with or without currency symbols!',
    noQuizQuestions: 'No Quiz Questions Available',
    noQuizQuestionsDesc: 'Please ask an admin to add some questions.',
    quizComplete: 'Quiz Complete!',
    reviewAnswers: 'Review Your Answers',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    typeYourAnswer: 'Type your answer here...',
    submitAnswer: 'Submit Answer',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    theAnswerWas: 'The answer was',
    nextQuestion: 'Next Question',
    seeResults: 'See Results',
    loading: 'Loading...'
  },
  zh: {
    title: '脑力游戏',
    subtitle: '选择一个游戏开始玩！',
    memoryCard: '记忆翻牌',
    whackMole: '打地鼠',
    colorSequence: '颜色序列',
    mathGame: '数学挑战',
    welcome: '欢迎！',
    welcomeMsg: '点击上面的任何游戏开始玩，锻炼你的大脑！',
    home: '主页',
    levels: '难度',
    restart: '重新开始',
    easy: '简单',
    medium: '中等',
    hard: '困难',
    crazy: '疯狂',
    multiMole: '多鼹鼠',
    insane: '疯狂模式！',
    pairs: '对',
    holes: '洞',
    slow: '慢速',
    fast: '快速',
    colors: '颜色',
    tip: '提示',
    memoryTip: '匹配卡片以学习重要的日常安全提醒！',

    // Memory Game - Safety Reminders
    safetyReminders: '安全提醒',
    memoryGameInstruction: '点击卡片以显示并匹配配对',
    matchCardsToSee: '匹配卡片以查看重要的安全提醒！',
    goodJob: '太好了！继续努力！',
    reminderStove: '别忘了关炉灶！',
    reminderTap: '记得关水龙头！',
    reminderDoor: '睡觉前检查门是否锁好！',
    reminderLights: '离开房间时关灯！',
    reminderMedicine: '按时吃药！',
    reminderKeys: '总是把钥匙放在同一个地方！',
    reminderPhone: '保持手机充电并放在身边！',
    reminderWallet: '出门前检查是否带钱包！',
    howToPlay: '玩法',
    whackTip: '地鼠出现时快速点击！你有30秒时间。点击越快，分数越高！',
    sequenceTip: '观看颜色亮起的顺序，然后点击重复！每轮增加一个颜色。',
    moves: '步数',
    youWon: '你赢了！',
    completedIn: '完成步数：',
    movesCount: '步！',
    tryAnother: '尝试其他难度',
    tapCards: '点击卡片翻转并找到配对！',
    score: '分数',
    round: '回合',
    timeLeft: '剩余时间',
    gameOver: '游戏结束！',
    finalScore: '最终分数：',
    playAgain: '再玩一次',
    tapMoles: '地鼠出现时点击它！',
    chooseDifficulty: '选择难度等级',
    language: '语言',
    watch: '观看中...',
    yourTurn: '你的回合！',
    wrong: '顺序错误！',
    reachedRound: '到达回合',
    enterName: '输入您的名字',
    saveScore: '保存分数',
    skip: '跳过',
    leaderboard: '排行榜',
    topScores: '最高分',
    player: '玩家',
    date: '日期',
    noScores: '还没有分数！成为第一个！',
    viewLeaderboard: '查看排行榜',
    welcomeToGames: '欢迎来到脑力游戏！',
    enterNamePrompt: '请输入您的名字来跟踪您的进度',
    namePlaceholder: '输入您的名字',
    continue: '继续',
    changeName: '更改名字',
    mathTip: '在60秒内解决尽可能多的数学问题！解决得越快，得分越高！',
    submit: '提交',
    turn: '回合',
    question: '问题',
    tie: '平局！',
    wins: '获胜',
    statistics: '统计数据',
    playerStats: '玩家统计',
    totalGames: '总游戏数',
    playTime: '游戏时间',
    favoriteGame: '最常玩的游戏',
    gamesPlayed: '已玩游戏',
    personalBests: '个人最佳分数',
    recentActivity: '最近活动',
    noStatsYet: '还没有统计数据！',
    playGamesToSee: '玩一些游戏来查看您的统计数据。',
    noGamesYet: '无',
    difficulty: '难度',
    guestMode: '访客模式',
    guestModeDesc: '（不保存进度）',
    guestStatsWarning: '您正在访客模式',
    guestStatsDesc: '统计数据和分数不会被保存。请登录以跟踪您的进度！',
    logout: '登出',
    switchPlayer: '切换玩家',
    signIn: '登录',
    chooseMode: '选择您的模式',
    singlePlayer: '单人模式',
    singlePlayerDesc: '单独游玩并跟踪进度',
    multiplayer: '多人模式',
    multiplayerDesc: '与朋友一起玩 - 无需登录',
    ticTacToe: '井字棋',
    ticTacToeTip: '连成3个就赢！轮流放置X或O。阻止对手的同时形成自己的一条线！',
    connect4: '四子棋',
    connect4Tip: '将彩色圆盘放入列中。第一个连成4个（横向、纵向或对角线）的人获胜！',
    startGame: '开始游戏',
    or: '或',
    back: '返回',
    wordSearch: '找字游戏',
    words: '词',
    found: '找到',
    wordsToFind: '要找的词',
    dragToSelect: '拖动选择字母组成单词！',
    tapToSelect: '按顺序点击字母选择单词，然后点击提交！',
    wordSearchTip: '按顺序点击字母选择单词，然后点击提交！',
    selected: '已选择',
    clear: '清除',
    time: '时间',
    fasterIsBetter: '时间越短越好！',
    rhythmBattle: '节奏对战',
    rhythmTip: '当方块到达底部的绿色目标区域时点击！完美时机=更多分数！',
    enterPlayerNames: '输入玩家名字',
    numberSorting: '数字排序',
    numbers: '数字',
    sortAscending: '排序：从小到大',
    sortDescending: '排序：从大到小',
    numberSortingTip: '按正确顺序点击数字（升序或降序）！',
    mistakes: '错误',
    penalty: '惩罚',
    tapInOrder: '按正确顺序点击数字！',
    mistakesReset: '点错会重置您的选择',

    // Word Search Wellness
    wellnessTips: '健康小贴士',
    findWordsToSeeTips: '找到健康词汇以查看健康小贴士！',

    // Colour Sequence Nutrition
    nutritionTips: '营养小贴士',
    clickColorsToSeeTips: '点击颜色了解营养知识！',
    foods: '食物',

    // Math Game Financial Literacy
    financialTips: '理财小贴士',
    solveProblemsToSeeTips: '解答问题学习理财知识！',
    startSolvingForTips: '开始解题查看提示！',

    // Achievements & Challenges
    achievements: '成就',
    dailyChallenges: '每日挑战',
    unlocked: '已解锁',
    progress: '进度',
    challengesComplete: '完成挑战',
    todaysChallenges: '今日挑战',
    challenge: '挑战',
    target: '目标',
    challengeHint: '每天都有新挑战！明天再来吧！',
    completed: '完成！',
    inProgress: '进行中',
    allChallengesComplete: '太棒了！你已完成今天所有挑战！',

    // Achievement Categories
    starterCategory: '初次尝试',
    masteryCategory: '游戏精通',
    consistencyCategory: '持续游玩',
    varietyCategory: '多样化',
    challengesCategory: '每日挑战',

    // Individual Achievements
    firstGame: '初次尝试',
    firstGameDesc: '完成你的第一个游戏',
    fiveGames: '开始上手',
    fiveGamesDesc: '玩5个游戏',
    tenGames: '专注玩家',
    tenGamesDesc: '玩10个游戏',
    threeStars: '完美分数',
    threeStarsDesc: '在任何游戏中获得3颗星',
    masterEasy: '简单模式大师',
    masterEasyDesc: '在所有简单模式中获得3颗星',
    masterMedium: '中等模式大师',
    masterMediumDesc: '在所有中等模式中获得3颗星',
    masterHard: '困难模式大师',
    masterHardDesc: '在所有困难模式中获得3颗星',
    streak3: '3天连续',
    streak3Desc: '连续3天游玩',
    streak7: '一周战士',
    streak7Desc: '连续7天游玩',
    streak30: '月度冠军',
    streak30Desc: '连续30天游玩',
    tryAll: '探索者',
    tryAllDesc: '尝试所有可用游戏',
    allDifficulties: '挑战寻求者',
    allDifficultiesDesc: '玩所有难度等级',
    firstChallenge: '接受挑战',
    firstChallengeDesc: '完成你的第一个每日挑战',
    fiveChallenges: '挑战猎人',
    fiveChallengesDesc: '完成5个每日挑战',
    tenChallenges: '挑战大师',
    tenChallengesDesc: '完成10个每日挑战',

    // Challenge Descriptions
    challengeMemoryEasy: '在记忆翻牌简单模式中获得3颗星',
    challengeWhackMedium: '在打地鼠中等模式中得分25+',
    challengeSequenceHard: '在颜色序列困难模式中到达第5回合+',
    challengeWordSearchEasy: '在2分钟内完成找字游戏简单模式',
    challengeMathMedium: '在数学挑战中等模式中得分15+',
    challengeNumberSortingEasy: '在数字排序简单模式中获得3颗星',

    // Quiz Game
    quiz: '问答',
    quizDesc: '回答管理员设置的问题',
    quizTip: '仔细阅读每个问题并输入答案。数字可以带或不带货币符号输入！',
    noQuizQuestions: '没有可用的问答题',
    noQuizQuestionsDesc: '请联系管理员添加问题。',
    quizComplete: '问答完成！',
    reviewAnswers: '查看您的答案',
    yourAnswer: '您的答案',
    correctAnswer: '正确答案',
    typeYourAnswer: '在此输入您的答案...',
    submitAnswer: '提交答案',
    correct: '正确！',
    incorrect: '错误',
    theAnswerWas: '正确答案是',
    nextQuestion: '下一题',
    seeResults: '查看结果',
    loading: '加载中...'
  }
};

function App() {
  const [gameMode, setGameMode] = useState(null); // null, 'single', 'multiplayer'
  const [currentGame, setCurrentGame] = useState(null);
  const [language, setLanguage] = useState('en');
  const [fontSize] = useState(() => {
    return localStorage.getItem('hogGamesFontSize') || 'medium';
  });
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('hogGamesPlayerName') || '';
  });
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [aiTrigger, setAiTrigger] = useState(null);

  // Inactivity auto-return to menu
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [warningStartTime, setWarningStartTime] = useState(null);
  const INACTIVITY_WARNING_TIME = 3 * 60 * 1000; // 3 minutes before warning
  const INACTIVITY_RETURN_TIME = 30 * 1000; // 30 seconds after warning to return

  // Track user activity (clicks, touches, key presses)
  useEffect(() => {
    const updateActivity = () => {
      setLastActivityTime(Date.now());
      // If warning is showing and user interacts, dismiss it
      if (showInactivityWarning) {
        setShowInactivityWarning(false);
        setWarningStartTime(null);
      }
    };

    // Add event listeners for various user interactions
    window.addEventListener('click', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousemove', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
    };
  }, [showInactivityWarning]);

  // Check for inactivity and show warning / return to menu
  useEffect(() => {
    // Only check inactivity when in a game (not on main menu or mode selection)
    if (!gameMode || !currentGame || currentGame === 'admin') {
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTime;

      // If warning is showing, check if we should return to menu
      if (showInactivityWarning && warningStartTime) {
        const timeSinceWarning = now - warningStartTime;
        if (timeSinceWarning >= INACTIVITY_RETURN_TIME) {
          // Return to main menu
          setCurrentGame(null);
          setShowInactivityWarning(false);
          setWarningStartTime(null);
          setLastActivityTime(Date.now());
        }
      } else if (timeSinceActivity >= INACTIVITY_WARNING_TIME) {
        // Show warning
        setShowInactivityWarning(true);
        setWarningStartTime(Date.now());
      }
    };

    // Check every 5 seconds
    const intervalId = setInterval(checkInactivity, 5000);

    return () => clearInterval(intervalId);
  }, [gameMode, currentGame, lastActivityTime, showInactivityWarning, warningStartTime]);

  // Function to trigger AI companion with a prompt
  const triggerAI = (prompt) => {
    setAiTrigger(prompt);
    // Clear trigger after a short delay so it can be triggered again
    setTimeout(() => setAiTrigger(null), 100);
  };

  // Get time-of-day greeting context
  const getTimeOfDayContext = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { period: 'morning', greeting: 'Good morning', greetingZh: '早上好' };
    } else if (hour >= 12 && hour < 17) {
      return { period: 'afternoon', greeting: 'Good afternoon', greetingZh: '下午好' };
    } else if (hour >= 17 && hour < 21) {
      return { period: 'evening', greeting: 'Good evening', greetingZh: '晚上好' };
    } else {
      return { period: 'night', greeting: 'Hello', greetingZh: '你好' };
    }
  };

  // Main menu greeting with random game suggestion and time-of-day awareness
  const [hasGreetedMenu, setHasGreetedMenu] = useState(false);
  useEffect(() => {
    if (gameMode === 'single' && !currentGame && !hasGreetedMenu && playerName) {
      const gameNames = ['Memory Card', 'Whack-a-Mole', 'Color Sequence', 'Word Search', 'Number Sorting', 'Quiz'];
      const randomGame = gameNames[Math.floor(Math.random() * gameNames.length)];
      const timeContext = getTimeOfDayContext();

      // Delay the greeting slightly so the component is mounted
      setTimeout(() => {
        const isChineseMode = language === 'zh' || language === 'yue';
        const prompt = isChineseMode
          ? `用"${timeContext.greetingZh}"问候${playerName || '玩家'}，这是${timeContext.period === 'morning' ? '早上' : timeContext.period === 'afternoon' ? '下午' : timeContext.period === 'evening' ? '晚上' : '夜里'}。问他们今天想玩什么游戏，可以建议试试"${randomGame}"。要简短、温暖。`
          : `Greet ${playerName || 'the player'} with "${timeContext.greeting}" since it's ${timeContext.period}. Ask what game they want to play today. Maybe suggest trying "${randomGame}" - make it sound fun and casual in Singlish! Keep it brief.`;
        triggerAI(prompt);
        setHasGreetedMenu(true);
      }, 1500);
    }
    // Reset greeting flag when entering a game
    if (currentGame) {
      setHasGreetedMenu(false);
    }
  }, [currentGame, gameMode, playerName, hasGreetedMenu, language]);

  // Generate daily challenges
  const generateDailyChallenges = () => {
    const allChallenges = [
      // Memory Game Challenges
      { id: 'memory_easy_3star', game: 'memory', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Memory Easy', icon: '🌟' },
      { id: 'memory_medium_3star', game: 'memory', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Memory Medium', icon: '⭐' },
      { id: 'memory_hard_complete', game: 'memory', difficulty: 'hard', target: 'Complete', desc: 'Complete Memory Hard mode', icon: '💫' },
      { id: 'memory_easy_10moves', game: 'memory', difficulty: 'easy', target: 'Under 10 moves', desc: 'Beat Memory Easy in under 10 moves', icon: '🎮' },
      { id: 'memory_medium_20moves', game: 'memory', difficulty: 'medium', target: 'Under 20 moves', desc: 'Beat Memory Medium in under 20 moves', icon: '🎯' },

      // Whack-a-Mole Challenges
      { id: 'whack_easy_15', game: 'whack', difficulty: 'easy', target: 'Score 15+', desc: 'Score 15+ in Whack-a-Mole Easy', icon: '🔨' },
      { id: 'whack_medium_25', game: 'whack', difficulty: 'medium', target: 'Score 25+', desc: 'Score 25+ in Whack-a-Mole Medium', icon: '⚡' },
      { id: 'whack_hard_30', game: 'whack', difficulty: 'hard', target: 'Score 30+', desc: 'Score 30+ in Whack-a-Mole Hard', icon: '🔥' },
      { id: 'whack_crazy_40', game: 'whack', difficulty: 'crazy', target: 'Score 40+', desc: 'Score 40+ in Whack-a-Mole Crazy', icon: '💥' },
      { id: 'whack_easy_3star', game: 'whack', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Whack-a-Mole Easy', icon: '🌟' },

      // Color Sequence Challenges
      { id: 'sequence_easy_round5', game: 'sequence', difficulty: 'easy', target: 'Round 5+', desc: 'Reach round 5+ in Color Sequence Easy', icon: '🎨' },
      { id: 'sequence_medium_round5', game: 'sequence', difficulty: 'medium', target: 'Round 5+', desc: 'Reach round 5+ in Color Sequence Medium', icon: '🌈' },
      { id: 'sequence_hard_round3', game: 'sequence', difficulty: 'hard', target: 'Round 3+', desc: 'Reach round 3+ in Color Sequence Hard', icon: '⚡' },
      { id: 'sequence_easy_3star', game: 'sequence', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Color Sequence Easy', icon: '⭐' },
      { id: 'sequence_medium_3star', game: 'sequence', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Color Sequence Medium', icon: '💫' },

      // Word Search Challenges
      { id: 'wordsearch_easy_3min', game: 'wordsearch', difficulty: 'easy', target: 'Under 3 min', desc: 'Complete Word Search Easy under 3 minutes', icon: '🔍' },
      { id: 'wordsearch_medium_5min', game: 'wordsearch', difficulty: 'medium', target: 'Under 5 min', desc: 'Complete Word Search Medium under 5 minutes', icon: '📝' },
      { id: 'wordsearch_hard_complete', game: 'wordsearch', difficulty: 'hard', target: 'Complete', desc: 'Complete Word Search Hard mode', icon: '🎓' },
      { id: 'wordsearch_easy_2min', game: 'wordsearch', difficulty: 'easy', target: 'Under 2 min', desc: 'Complete Word Search Easy under 2 minutes', icon: '⚡' },
      { id: 'wordsearch_medium_3star', game: 'wordsearch', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Word Search Medium', icon: '🌟' },

      // Math Game Challenges
      { id: 'math_easy_10', game: 'math', difficulty: 'easy', target: 'Score 10+', desc: 'Score 10+ in Math Challenge Easy', icon: '🧮' },
      { id: 'math_medium_15', game: 'math', difficulty: 'medium', target: 'Score 15+', desc: 'Score 15+ in Math Challenge Medium', icon: '➕' },
      { id: 'math_hard_20', game: 'math', difficulty: 'hard', target: 'Score 20+', desc: 'Score 20+ in Math Challenge Hard', icon: '✖️' },
      { id: 'math_easy_3star', game: 'math', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Math Challenge Easy', icon: '⭐' },
      { id: 'math_medium_3star', game: 'math', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Math Challenge Medium', icon: '🌟' },

      // Number Sorting Challenges
      { id: 'numbersorting_easy_3star', game: 'numbersorting', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Number Sorting Easy', icon: '🔢' },
      { id: 'numbersorting_medium_3star', game: 'numbersorting', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Number Sorting Medium', icon: '💯' },
      { id: 'numbersorting_hard_complete', game: 'numbersorting', difficulty: 'hard', target: 'Complete', desc: 'Complete Number Sorting Hard mode', icon: '🎯' },
      { id: 'numbersorting_easy_nomistakes', game: 'numbersorting', difficulty: 'easy', target: 'No mistakes', desc: 'Complete Number Sorting Easy with no mistakes', icon: '✨' },
      { id: 'numbersorting_medium_2min', game: 'numbersorting', difficulty: 'medium', target: 'Under 2 min', desc: 'Complete Number Sorting Medium under 2 minutes', icon: '⏱️' },

      // General/Mixed Challenges
      { id: 'play_3games', game: 'any', difficulty: 'any', target: '3 games', desc: 'Play any 3 games today', icon: '🎮' },
      { id: 'win_2games', game: 'any', difficulty: 'any', target: 'Win 2', desc: 'Win any 2 games today', icon: '🏆' },
      { id: 'try_newgame', game: 'any', difficulty: 'any', target: 'Try new', desc: 'Try a game you haven\'t played today', icon: '🎲' },
      { id: 'perfect_score', game: 'any', difficulty: 'any', target: '3 stars', desc: 'Get 3 stars in any game', icon: '⭐' },
    ];
    const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  // Load daily challenges from Firebase
  useEffect(() => {
    const loadChallenges = async () => {
      if (!isGuestMode && playerName && playerName !== 'Guest') {
        try {
          const savedChallenges = await getDailyChallenges(playerName);

          if (savedChallenges) {
            setDailyChallenges(savedChallenges);
          } else {
            const challenges = generateDailyChallenges();
            setDailyChallenges(challenges);
            await saveDailyChallenges(playerName, challenges);
          }
        } catch (error) {
          console.error('Failed to load daily challenges:', error);
        }
      }
    };

    loadChallenges();
  }, [isGuestMode, playerName]);

  // Subscribe to player stats from Firebase
  useEffect(() => {
    if (!isGuestMode && playerName && playerName !== 'Guest') {
      const unsubscribe = subscribeToPlayerStats(playerName, (stats) => {
        setPlayerStats(stats);
      });
      return () => unsubscribe();
    } else {
      setPlayerStats(null);
    }
  }, [isGuestMode, playerName]);

  // Leaderboard state - now synced with Firebase
  const [leaderboard, setLeaderboard] = useState({
    memory: [],
    whack: [],
    sequence: [],
    math: [],
    wordsearch: [],
    numbersorting: []
  });

  // Subscribe to Firebase leaderboards on mount
  useEffect(() => {
    const games = ['memory', 'whack', 'sequence', 'math', 'wordsearch', 'numbersorting'];
    const unsubscribes = [];

    games.forEach(game => {
      const unsubscribe = subscribeToLeaderboard(game, (scores) => {
        // Sort scores: by difficulty first (hard > medium > easy), then by score
        const sortedScores = scores.sort((a, b) => {
          const difficultyOrder = { 'hard': 3, 'medium': 2, 'easy': 1 };
          const aDiff = difficultyOrder[a.difficulty] || 0;
          const bDiff = difficultyOrder[b.difficulty] || 0;

          if (aDiff !== bDiff) return bDiff - aDiff;

          // For memory, wordsearch, numbersorting: lower is better
          if (game === 'memory' || game === 'wordsearch' || game === 'numbersorting') {
            return a.score - b.score;
          }
          // For others: higher is better
          return b.score - a.score;
        }).slice(0, 10);

        setLeaderboard(prev => ({ ...prev, [game]: sortedScores }));
      });
      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);
  
  const handleSaveName = () => {
    if (playerName.trim()) {
      localStorage.setItem('hogGamesPlayerName', playerName.trim());
      setShowNameEntry(false);
    }
  };

  const handleGuestMode = () => {
    setPlayerName('Guest');
    setIsGuestMode(true);
    setShowNameEntry(false);
  };

  const handleLogout = () => {
    // Clear the saved player name from localStorage
    localStorage.removeItem('hogGamesPlayerName');
    setPlayerName('');
    setIsGuestMode(false);
    setShowNameEntry(false);
    setGameMode(null);
    setCurrentGame(null);
  };

  const handleSelectSinglePlayer = () => {
    soundPlayer.playClick();
    setGameMode('single');
    // Check if we already have a saved player
    const savedPlayer = localStorage.getItem('hogGamesPlayerName');
    if (savedPlayer) {
      setPlayerName(savedPlayer);
      setShowNameEntry(false);
    } else {
      setShowNameEntry(true);
    }
  };

  const handleSelectMultiplayer = () => {
    soundPlayer.playClick();
    setGameMode('multiplayer');
    setPlayerName('Multiplayer');
    setShowNameEntry(false);
  };

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };

  const getAchievementStats = () => {
    // Return empty stats for guest mode or no stats loaded
    if (isGuestMode || playerName === 'Guest' || !playerName || !playerStats) {
      return {
        gamesPlayed: 0,
        threeStarGames: 0,
        currentStreak: 0,
        gamesTriedCount: 0,
        challengesCompleted: 0,
        easyMastered: false,
        mediumMastered: false,
        hardMastered: false,
        allDifficultiesTried: false
      };
    }

    // Count games tried (games with at least 1 play)
    const gamesTriedCount = Object.values(playerStats.gamesBreakdown || {}).filter(count => count > 0).length;

    // Count 3-star games from leaderboard
    let threeStarGames = 0;
    Object.values(leaderboard).forEach(gameLeaderboard => {
      const playerEntry = gameLeaderboard.find(entry =>
        entry.name.toLowerCase() === playerName.toLowerCase()
      );
      if (playerEntry && playerEntry.score >= 3) {
        threeStarGames++;
      }
    });

    // Check difficulty mastery from leaderboard
    const games = ['memory', 'whack', 'sequence', 'math', 'wordsearch', 'numbersorting'];
    const difficulties = ['easy', 'medium', 'hard'];

    const checkMastery = (difficulty) => {
      return games.every(game => {
        const gameLeaderboard = leaderboard[game] || [];
        const playerEntry = gameLeaderboard.find(entry =>
          entry.name.toLowerCase() === playerName.toLowerCase() &&
          entry.difficulty === difficulty
        );
        return playerEntry && playerEntry.score >= 3;
      });
    };

    const easyMastered = checkMastery('easy');
    const mediumMastered = checkMastery('medium');
    const hardMastered = checkMastery('hard');

    // Check if all difficulties tried
    const allDifficultiesTried = difficulties.every(difficulty => {
      return games.some(game => {
        const gameLeaderboard = leaderboard[game] || [];
        return gameLeaderboard.some(entry =>
          entry.name.toLowerCase() === playerName.toLowerCase() &&
          entry.difficulty === difficulty
        );
      });
    });

    return {
      gamesPlayed: playerStats.totalGamesPlayed || 0,
      threeStarGames,
      currentStreak: playerStats.currentStreak || 0,
      gamesTriedCount,
      challengesCompleted: playerStats.challengesCompleted || 0,
      easyMastered,
      mediumMastered,
      hardMastered,
      allDifficultiesTried
    };
  };

  const trackGameStats = async (game, score, difficulty) => {
    // Skip saving for guest mode
    if (isGuestMode || playerName === 'Guest') return;

    try {
      await updatePlayerStats(playerName, game, score, difficulty);
    } catch (error) {
      console.error('Failed to update player stats:', error);
    }
  };

  const checkChallengeCompletion = async (game, score, difficulty, time = null) => {
    // Skip for guest mode
    if (isGuestMode || playerName === 'Guest') return;

    // Check each daily challenge
    for (const challenge of dailyChallenges) {
      // Skip if already completed
      if (challenge.completed) continue;

      // Check if this game matches the challenge
      if (challenge.game !== game && challenge.game !== 'any') continue;
      if (challenge.difficulty !== difficulty && challenge.difficulty !== 'any') continue;

      // Check completion criteria based on challenge type
      let isCompleted = false;

      switch (challenge.id) {
        case 'memory_easy_3star':
        case 'memory_medium_3star':
        case 'numbersorting_easy_3star':
        case 'numbersorting_medium_3star':
        case 'sequence_easy_3star':
        case 'sequence_medium_3star':
        case 'math_easy_3star':
        case 'math_medium_3star':
        case 'wordsearch_medium_3star':
        case 'whack_easy_3star':
        case 'perfect_score':
          isCompleted = score >= 3;
          break;
        case 'whack_easy_15':
          isCompleted = score >= 15;
          break;
        case 'whack_medium_25':
          isCompleted = score >= 25;
          break;
        case 'whack_hard_30':
          isCompleted = score >= 30;
          break;
        case 'whack_crazy_40':
          isCompleted = score >= 40;
          break;
        case 'math_easy_10':
          isCompleted = score >= 10;
          break;
        case 'math_medium_15':
          isCompleted = score >= 15;
          break;
        case 'math_hard_20':
          isCompleted = score >= 20;
          break;
        case 'sequence_easy_round5':
        case 'sequence_medium_round5':
          isCompleted = score >= 5;
          break;
        case 'sequence_hard_round3':
          isCompleted = score >= 3;
          break;
        case 'wordsearch_easy_3min':
          isCompleted = time !== null && time <= 180;
          break;
        case 'wordsearch_easy_2min':
          isCompleted = time !== null && time <= 120;
          break;
        case 'wordsearch_medium_5min':
          isCompleted = time !== null && time <= 300;
          break;
        case 'numbersorting_medium_2min':
          isCompleted = time !== null && time <= 120;
          break;
        case 'memory_hard_complete':
        case 'wordsearch_hard_complete':
        case 'numbersorting_hard_complete':
          isCompleted = true; // Just completing hard mode counts
          break;
        case 'memory_easy_10moves':
          isCompleted = score <= 10;
          break;
        case 'memory_medium_20moves':
          isCompleted = score <= 20;
          break;
        case 'numbersorting_easy_nomistakes':
          isCompleted = score === 0; // 0 mistakes
          break;
        default:
          break;
      }

      if (isCompleted) {
        try {
          const updated = await updateChallengeCompletion(playerName, challenge.id);
          if (updated) {
            await incrementChallengesCompleted(playerName);
            // Update local state
            setDailyChallenges(prev =>
              prev.map(c => c.id === challenge.id ? { ...c, completed: true } : c)
            );
          }
        } catch (error) {
          console.error('Failed to update challenge completion:', error);
        }
      }
    }
  };

  const addToLeaderboard = async (game, playerNameParam, score, difficulty, time = null) => {
    // Track statistics (skips for guest mode)
    trackGameStats(game, score, difficulty);

    // Check challenge completion (skips for guest mode)
    checkChallengeCompletion(game, score, difficulty, time);

    // Skip saving to leaderboard for guest mode
    if (isGuestMode || playerNameParam === 'Guest') return;

    // Save to Firebase - the real-time subscription will update the local state
    try {
      await addScore(game, playerNameParam, score, difficulty, time);
    } catch (error) {
      console.error('Failed to save score to Firebase:', error);
    }
  };

  // Cantonese ('yue') uses same written Chinese as Mandarin ('zh'), just different TTS voice
  const t = translations[language === 'yue' ? 'zh' : language];

  return (
    <div className={`min-h-screen bg-slate-100 p-8 ${fontSizeClasses[fontSize]}`}>
      {/* Mode Selection Screen - First Screen */}
      {!gameMode && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-5xl w-full border-2 border-gray-200">
            <div className="flex justify-end items-center mb-10">
              <div className="flex items-center gap-4 bg-gray-100 rounded-2xl p-4">
                <Globe className="text-gray-600" size={40} />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent border-none text-3xl font-bold text-gray-700 cursor-pointer outline-none"
                >
                  <option value="en">English</option>
                  <option value="zh">华语</option>
                  <option value="yue">粤语</option>
                </select>
              </div>
            </div>
            <div className="text-center mb-12">
              <h1 className="text-8xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-6">
                <Brain className="text-purple-600" size={100} />
                {t.welcomeToGames}
              </h1>
              <p className="text-4xl text-gray-600 mb-12">{t.chooseMode}</p>
            </div>

            <div className="space-y-8">
              <button
                onClick={handleSelectSinglePlayer}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-16 rounded-3xl text-6xl font-bold transition-all transform hover:scale-105 shadow-2xl pulse-glow"
              >
                <div className="flex flex-col items-center gap-4">
                  <Users size={96} className="mb-4" />
                  <span>{t.singlePlayer}</span>
                  <p className="text-3xl font-normal">{t.singlePlayerDesc}</p>
                </div>
              </button>

              <button
                onClick={handleSelectMultiplayer}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white p-16 rounded-3xl text-6xl font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                <div className="flex flex-col items-center gap-4">
                  <Users size={96} className="mb-4" />
                  <span>{t.multiplayer}</span>
                  <p className="text-3xl font-normal">{t.multiplayerDesc}</p>
                </div>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setGameMode('quiz'); setCurrentGame('quiz'); }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-16 rounded-3xl text-6xl font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                <div className="flex flex-col items-center gap-4">
                  <HelpCircle size={96} className="mb-4" />
                  <span>{t.quiz}</span>
                  <p className="text-3xl font-normal">{t.quizDesc}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name Entry Screen - After Single Player Selected */}
      {gameMode === 'single' && showNameEntry && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-4xl w-full border-2 border-gray-200">
            <div className="flex justify-end items-center mb-10">
              <div className="flex items-center gap-4 bg-gray-100 rounded-2xl p-4">
                <Globe className="text-gray-600" size={40} />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent border-none text-3xl font-bold text-gray-700 cursor-pointer outline-none"
                >
                  <option value="en">English</option>
                  <option value="zh">华语</option>
                  <option value="yue">粤语</option>
                </select>
              </div>
            </div>
            <div className="text-center mb-12">
              <h1 className="text-7xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-6">
                <Brain className="text-purple-600" size={80} />
                {t.welcomeToGames}
              </h1>
              <p className="text-3xl text-gray-600">{t.enterNamePrompt}</p>
            </div>
            <input
              type="text"
              inputMode="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full p-8 text-4xl rounded-2xl border-4 border-purple-300 mb-10 text-center focus:border-purple-500 focus:outline-none"
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoComplete="off"
            />
            <button
              onClick={handleSaveName}
              disabled={!playerName.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white p-8 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg mb-6"
            >
              {t.continue}
            </button>
            <div className="text-center mb-4">
              <p className="text-2xl text-gray-500">{t.or || 'OR'}</p>
            </div>
            <button
              onClick={handleGuestMode}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white p-8 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg guest-sway"
            >
              {t.guestMode}
              <p className="text-2xl font-normal mt-2">{t.guestModeDesc}</p>
            </button>
          </div>
        </div>
      )}

      {/* Single Player Game Menu */}
      {gameMode === 'single' && !showNameEntry && currentGame === null && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-6xl w-full border-2 border-gray-200">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-7xl font-bold text-gray-800 flex items-center gap-6">
                <Brain className="text-purple-600" size={80} />
                {t.title}
              </h1>
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-5 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-3"
                >
                  <span>{playerName}</span>
                  <span className="text-2xl">
                    ({isGuestMode || playerName === 'Guest' ? t.signIn : t.logout})
                  </span>
                </button>
                <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-4">
                  <Globe className="text-gray-600" size={36} />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent border-none text-3xl font-bold text-gray-700 cursor-pointer outline-none"
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-3xl">{t.subtitle}</p>

            {/* Daily Challenges Section - Only for logged-in users */}
            {!isGuestMode && dailyChallenges.length > 0 && (
              <div className="mb-8 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-2 border-purple-200 rounded-3xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                    🎯 {t.todaysChallenges}
                  </h3>
                  <div className="bg-purple-100 px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-purple-700">
                      {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length} ✓
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {dailyChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`rounded-2xl p-5 transition-all ${
                        challenge.completed
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300'
                          : 'bg-white/80 border-2 border-purple-100 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-5xl p-2 rounded-xl ${challenge.completed ? 'bg-green-200' : 'bg-purple-100'}`}>
                            {challenge.icon}
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${challenge.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                              {challenge.desc}
                            </p>
                            <p className={`text-xl ${challenge.completed ? 'text-green-600' : 'text-purple-600'}`}>
                              {t.target}: {challenge.target}
                            </p>
                          </div>
                        </div>
                        {challenge.completed ? (
                          <div className="bg-green-500 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md">
                            <span className="text-3xl">✓</span>
                            <span className="text-xl font-bold">{t.completed || 'Done!'}</span>
                          </div>
                        ) : (
                          <div className="bg-purple-200 text-purple-700 px-5 py-3 rounded-xl">
                            <span className="text-xl font-medium">{t.inProgress || 'In Progress'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {dailyChallenges.every(c => c.completed) ? (
                  <p className="text-center text-green-600 text-2xl mt-6 font-bold">
                    🎉 {t.allChallengesComplete || "Amazing! You've completed all today's challenges!"}
                  </p>
                ) : (
                  <p className="text-center text-purple-600 text-xl mt-6 opacity-80">
                    💡 {t.challengeHint}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-6">
              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('memory'); }}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Sparkles size={72} />
                  <span>{t.memoryCard}</span>
                </div>
                <span className="text-5xl">→</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('whack'); }}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Hammer size={72} />
                  <span>{t.whackMole}</span>
                </div>
                <span className="text-5xl">→</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('sequence'); }}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Zap size={72} />
                  <span>{t.colorSequence}</span>
                </div>
                <span className="text-5xl">→</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('math'); }}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Calculator size={72} />
                  <span>{t.mathGame}</span>
                </div>
                <span className="text-5xl">→</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('wordsearch'); }}
                className="w-full bg-rose-700 hover:bg-rose-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Search size={72} />
                  <span>{t.wordSearch}</span>
                </div>
                <span className="text-5xl">→</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('numbersorting'); }}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <ArrowUpDown size={72} />
                  <span>{t.numberSorting}</span>
                </div>
                <span className="text-5xl">→</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('statistics'); }}
                className="w-full bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <BarChart3 size={72} />
                  <span>{t.statistics}</span>
                </div>
                <span className="text-5xl">→</span>
              </button>

              {/* Only show Achievements for logged-in users */}
              {!isGuestMode && (
                <button
                  onClick={() => { soundPlayer.playClick(); setCurrentGame('achievements'); }}
                  className="w-full bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-8">
                    <Trophy size={72} />
                    <span>{t.achievements}</span>
                  </div>
                  <span className="text-5xl">→</span>
                </button>
              )}
            </div>

            <div className="mt-10 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <p className="text-blue-900 text-center font-bold text-3xl">✨ {t.welcome}</p>
              <p className="text-blue-700 text-center text-2xl mt-2">{t.welcomeMsg}</p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentGame('admin')}
                className="text-gray-400 hover:text-gray-600 text-xl underline flex items-center justify-center gap-2 mx-auto"
              >
                <Shield size={20} />
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiplayer Game Menu */}
      {gameMode === 'multiplayer' && currentGame === null && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-6xl w-full border-2 border-gray-200">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-7xl font-bold text-gray-800 flex items-center gap-6">
                <Users className="text-green-600" size={80} />
                {t.multiplayer}
              </h1>
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-5 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-3"
                >
                  <Home size={48} />
                  {t.home}
                </button>
                <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-4">
                  <Globe className="text-gray-600" size={36} />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent border-none text-3xl font-bold text-gray-700 cursor-pointer outline-none"
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-3xl">{t.multiplayerDesc}</p>

            <div className="space-y-6">
              <div>
                <button
                  onClick={() => { soundPlayer.playClick(); setCurrentGame('tictactoe'); }}
                  className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-8">
                    <Grid3x3 size={72} />
                    <span>{t.ticTacToe}</span>
                  </div>
                  <span className="text-5xl">→</span>
                </button>
                <div className="mt-3 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 text-center text-2xl">💡 {t.ticTacToeTip}</p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => { soundPlayer.playClick(); setCurrentGame('connect4'); }}
                  className="w-full bg-gradient-to-br from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-8">
                    <Columns3 size={72} />
                    <span>{t.connect4}</span>
                  </div>
                  <span className="text-5xl">→</span>
                </button>
                <div className="mt-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-800 text-center text-2xl">💡 {t.connect4Tip}</p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => { soundPlayer.playClick(); setCurrentGame('rhythm'); }}
                  className="w-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-8">
                    <Music size={72} />
                    <span>{t.rhythmBattle}</span>
                  </div>
                  <span className="text-5xl">→</span>
                </button>
                <div className="mt-3 bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-purple-800 text-center text-2xl">💡 {t.rhythmTip}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <p className="text-green-900 text-center font-bold text-3xl">🎮 {t.welcome}</p>
              <p className="text-green-700 text-center text-2xl mt-2">No sign in needed - just play and have fun!</p>
            </div>
          </div>
        </div>
      )}

      {currentGame === 'memory' && (
        <MemoryGame
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          addToLeaderboard={addToLeaderboard}
          leaderboard={leaderboard.memory}
          playerName={playerName}
          onAITrigger={triggerAI}
        />
      )}

      {currentGame === 'whack' && (
        <WhackAMole
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          addToLeaderboard={addToLeaderboard}
          leaderboard={leaderboard.whack}
          playerName={playerName}
          onAITrigger={triggerAI}
        />
      )}

      {currentGame === 'sequence' && (
        <ColorSequence
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          addToLeaderboard={addToLeaderboard}
          leaderboard={leaderboard.sequence}
          playerName={playerName}
          onAITrigger={triggerAI}
        />
      )}

      {currentGame === 'math' && (
        <MathGame
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          addToLeaderboard={addToLeaderboard}
          leaderboard={leaderboard.math}
          playerName={playerName}
          onAITrigger={triggerAI}
        />
      )}

      {currentGame === 'tictactoe' && (
        <TicTacToe
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
        />
      )}

      {currentGame === 'connect4' && (
        <Connect4
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
        />
      )}

      {currentGame === 'wordsearch' && (
        <WordSearch
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          addToLeaderboard={addToLeaderboard}
          leaderboard={leaderboard.wordsearch}
          playerName={playerName}
          onAITrigger={triggerAI}
        />
      )}

      {currentGame === 'numbersorting' && (
        <NumberSorting
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          addToLeaderboard={addToLeaderboard}
          leaderboard={leaderboard.numbersorting}
          playerName={playerName}
          onAITrigger={triggerAI}
        />
      )}

      {currentGame === 'rhythm' && (
        <RhythmGame
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
        />
      )}

      {currentGame === 'quiz' && (
        <QuizGame
          goHome={() => { setCurrentGame(null); setGameMode(null); }}
          language={language}
          translations={translations}
          playerName={playerName}
          onAITrigger={triggerAI}
        />
      )}

      {currentGame === 'statistics' && (
        <Statistics
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          playerName={playerName}
          isGuestMode={isGuestMode}
          playerStats={playerStats}
        />
      )}

      {currentGame === 'achievements' && (
        <Achievements
          goHome={() => setCurrentGame(null)}
          language={language}
          translations={translations}
          playerName={playerName}
          stats={getAchievementStats()}
          dailyChallenges={dailyChallenges}
        />
      )}

      {currentGame === 'admin' && (
        <AdminPanel
          goHome={() => setCurrentGame(null)}
          leaderboard={leaderboard}
        />
      )}

      {/* Persistent Admin Button - Bottom Left Corner */}
      {currentGame !== 'admin' && (
        <button
          onClick={() => { soundPlayer.playClick(); setCurrentGame('admin'); }}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 z-50 opacity-80 hover:opacity-100"
          title="Admin Panel"
        >
          <Shield size={28} />
          <span className="text-xl font-bold hidden sm:inline">Admin</span>
        </button>
      )}

      {/* AI Companion - appears on main menu AND during games */}
      {gameMode === 'single' && !['admin', 'statistics', 'achievements'].includes(currentGame) && (
        <AICompanion
          playerName={playerName}
          currentGame={currentGame || 'menu'}
          language={language}
          minimized={true}
          onTrigger={aiTrigger}
        />
      )}

      {/* Inactivity Warning Modal */}
      {showInactivityWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full mx-6 text-center border-4 border-yellow-400 animate-pulse">
            <div className="text-8xl mb-6">👋</div>
            <h2 className="text-5xl font-bold text-gray-800 mb-4">
              {language === 'zh' || language === 'yue' ? '你还在吗？' : 'Are you still there?'}
            </h2>
            <p className="text-3xl text-gray-600 mb-8">
              {language === 'zh' || language === 'yue'
                ? '点击任何地方继续玩游戏'
                : 'Tap anywhere to continue playing'}
            </p>
            <p className="text-2xl text-yellow-600 mb-8">
              {language === 'zh' || language === 'yue'
                ? '如果没有反应，将自动返回主菜单...'
                : 'Returning to main menu soon if no response...'}
            </p>
            <button
              onClick={() => {
                setShowInactivityWarning(false);
                setWarningStartTime(null);
                setLastActivityTime(Date.now());
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-xl"
            >
              {language === 'zh' || language === 'yue' ? '我还在！继续玩' : "I'm here! Keep playing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

