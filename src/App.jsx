import React, { useState, useEffect, useRef } from 'react';
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
    title: 'è„‘åŠ›æ¸¸æˆ',
    subtitle: 'é€‰æ‹©ä¸€ä¸ªæ¸¸æˆå¼€å§‹çŽ©ï¼',
    memoryCard: 'è®°å¿†ç¿»ç‰Œ',
    whackMole: 'æ‰“åœ°é¼ ',
    colorSequence: 'é¢œè‰²åºåˆ—',
    mathGame: 'æ•°å­¦æŒ‘æˆ˜',
    welcome: 'æ¬¢è¿Žï¼',
    welcomeMsg: 'ç‚¹å‡»ä¸Šé¢çš„ä»»ä½•æ¸¸æˆå¼€å§‹çŽ©ï¼Œé”»ç‚¼ä½ çš„å¤§è„‘ï¼',
    home: 'ä¸»é¡µ',
    levels: 'éš¾åº¦',
    restart: 'é‡æ–°å¼€å§‹',
    easy: 'ç®€å•',
    medium: 'ä¸­ç­‰',
    hard: 'å›°éš¾',
    crazy: 'ç–¯ç‹‚',
    multiMole: 'å¤šé¼¹é¼ ',
    insane: 'ç–¯ç‹‚æ¨¡å¼ï¼',
    pairs: 'å¯¹',
    holes: 'æ´ž',
    slow: 'æ…¢é€Ÿ',
    fast: 'å¿«é€Ÿ',
    colors: 'é¢œè‰²',
    tip: 'æç¤º',
    memoryTip: 'åŒ¹é…å¡ç‰‡ä»¥å­¦ä¹ é‡è¦çš„æ—¥å¸¸å®‰å…¨æé†’ï¼',

    // Memory Game - Safety Reminders
    safetyReminders: 'å®‰å…¨æé†’',
    memoryGameInstruction: 'ç‚¹å‡»å¡ç‰‡ä»¥æ˜¾ç¤ºå¹¶åŒ¹é…é…å¯¹',
    matchCardsToSee: 'åŒ¹é…å¡ç‰‡ä»¥æŸ¥çœ‹é‡è¦çš„å®‰å…¨æé†’ï¼',
    goodJob: 'å¤ªå¥½äº†ï¼ç»§ç»­åŠªåŠ›ï¼',
    reminderStove: 'åˆ«å¿˜äº†å…³ç‚‰ç¶ï¼',
    reminderTap: 'è®°å¾—å…³æ°´é¾™å¤´ï¼',
    reminderDoor: 'ç¡è§‰å‰æ£€æŸ¥é—¨æ˜¯å¦é”å¥½ï¼',
    reminderLights: 'ç¦»å¼€æˆ¿é—´æ—¶å…³ç¯ï¼',
    reminderMedicine: 'æŒ‰æ—¶åƒè¯ï¼',
    reminderKeys: 'æ€»æ˜¯æŠŠé’¥åŒ™æ”¾åœ¨åŒä¸€ä¸ªåœ°æ–¹ï¼',
    reminderPhone: 'ä¿æŒæ‰‹æœºå……ç”µå¹¶æ”¾åœ¨èº«è¾¹ï¼',
    reminderWallet: 'å‡ºé—¨å‰æ£€æŸ¥æ˜¯å¦å¸¦é’±åŒ…ï¼',
    howToPlay: 'çŽ©æ³•',
    whackTip: 'åœ°é¼ å‡ºçŽ°æ—¶å¿«é€Ÿç‚¹å‡»ï¼ä½ æœ‰30ç§’æ—¶é—´ã€‚ç‚¹å‡»è¶Šå¿«ï¼Œåˆ†æ•°è¶Šé«˜ï¼',
    sequenceTip: 'è§‚çœ‹é¢œè‰²äº®èµ·çš„é¡ºåºï¼Œç„¶åŽç‚¹å‡»é‡å¤ï¼æ¯è½®å¢žåŠ ä¸€ä¸ªé¢œè‰²ã€‚',
    moves: 'æ­¥æ•°',
    youWon: 'ä½ èµ¢äº†ï¼',
    completedIn: 'å®Œæˆæ­¥æ•°ï¼š',
    movesCount: 'æ­¥ï¼',
    tryAnother: 'å°è¯•å…¶ä»–éš¾åº¦',
    tapCards: 'ç‚¹å‡»å¡ç‰‡ç¿»è½¬å¹¶æ‰¾åˆ°é…å¯¹ï¼',
    score: 'åˆ†æ•°',
    round: 'å›žåˆ',
    timeLeft: 'å‰©ä½™æ—¶é—´',
    gameOver: 'æ¸¸æˆç»“æŸï¼',
    finalScore: 'æœ€ç»ˆåˆ†æ•°ï¼š',
    playAgain: 'å†çŽ©ä¸€æ¬¡',
    tapMoles: 'åœ°é¼ å‡ºçŽ°æ—¶ç‚¹å‡»å®ƒï¼',
    chooseDifficulty: 'é€‰æ‹©éš¾åº¦ç­‰çº§',
    language: 'è¯­è¨€',
    watch: 'è§‚çœ‹ä¸­...',
    yourTurn: 'ä½ çš„å›žåˆï¼',
    wrong: 'é¡ºåºé”™è¯¯ï¼',
    reachedRound: 'åˆ°è¾¾å›žåˆ',
    enterName: 'è¾“å…¥æ‚¨çš„åå­—',
    saveScore: 'ä¿å­˜åˆ†æ•°',
    skip: 'è·³è¿‡',
    leaderboard: 'æŽ’è¡Œæ¦œ',
    topScores: 'æœ€é«˜åˆ†',
    player: 'çŽ©å®¶',
    date: 'æ—¥æœŸ',
    noScores: 'è¿˜æ²¡æœ‰åˆ†æ•°ï¼æˆä¸ºç¬¬ä¸€ä¸ªï¼',
    viewLeaderboard: 'æŸ¥çœ‹æŽ’è¡Œæ¦œ',
    welcomeToGames: 'æ¬¢è¿Žæ¥åˆ°è„‘åŠ›æ¸¸æˆï¼',
    enterNamePrompt: 'è¯·è¾“å…¥æ‚¨çš„åå­—æ¥è·Ÿè¸ªæ‚¨çš„è¿›åº¦',
    namePlaceholder: 'è¾“å…¥æ‚¨çš„åå­—',
    continue: 'ç»§ç»­',
    changeName: 'æ›´æ”¹åå­—',
    mathTip: 'åœ¨60ç§’å†…è§£å†³å°½å¯èƒ½å¤šçš„æ•°å­¦é—®é¢˜ï¼è§£å†³å¾—è¶Šå¿«ï¼Œå¾—åˆ†è¶Šé«˜ï¼',
    submit: 'æäº¤',
    turn: 'å›žåˆ',
    question: 'é—®é¢˜',
    tie: 'å¹³å±€ï¼',
    wins: 'èŽ·èƒœ',
    statistics: 'ç»Ÿè®¡æ•°æ®',
    playerStats: 'çŽ©å®¶ç»Ÿè®¡',
    totalGames: 'æ€»æ¸¸æˆæ•°',
    playTime: 'æ¸¸æˆæ—¶é—´',
    favoriteGame: 'æœ€å¸¸çŽ©çš„æ¸¸æˆ',
    gamesPlayed: 'å·²çŽ©æ¸¸æˆ',
    personalBests: 'ä¸ªäººæœ€ä½³åˆ†æ•°',
    recentActivity: 'æœ€è¿‘æ´»åŠ¨',
    noStatsYet: 'è¿˜æ²¡æœ‰ç»Ÿè®¡æ•°æ®ï¼',
    playGamesToSee: 'çŽ©ä¸€äº›æ¸¸æˆæ¥æŸ¥çœ‹æ‚¨çš„ç»Ÿè®¡æ•°æ®ã€‚',
    noGamesYet: 'æ— ',
    difficulty: 'éš¾åº¦',
    guestMode: 'è®¿å®¢æ¨¡å¼',
    guestModeDesc: 'ï¼ˆä¸ä¿å­˜è¿›åº¦ï¼‰',
    guestStatsWarning: 'æ‚¨æ­£åœ¨è®¿å®¢æ¨¡å¼',
    guestStatsDesc: 'ç»Ÿè®¡æ•°æ®å’Œåˆ†æ•°ä¸ä¼šè¢«ä¿å­˜ã€‚è¯·ç™»å½•ä»¥è·Ÿè¸ªæ‚¨çš„è¿›åº¦ï¼',
    logout: 'ç™»å‡º',
    switchPlayer: 'åˆ‡æ¢çŽ©å®¶',
    signIn: 'ç™»å½•',
    chooseMode: 'é€‰æ‹©æ‚¨çš„æ¨¡å¼',
    singlePlayer: 'å•äººæ¨¡å¼',
    singlePlayerDesc: 'å•ç‹¬æ¸¸çŽ©å¹¶è·Ÿè¸ªè¿›åº¦',
    multiplayer: 'å¤šäººæ¨¡å¼',
    multiplayerDesc: 'ä¸Žæœ‹å‹ä¸€èµ·çŽ© - æ— éœ€ç™»å½•',
    ticTacToe: 'äº•å­—æ£‹',
    ticTacToeTip: 'è¿žæˆ3ä¸ªå°±èµ¢ï¼è½®æµæ”¾ç½®Xæˆ–Oã€‚é˜»æ­¢å¯¹æ‰‹çš„åŒæ—¶å½¢æˆè‡ªå·±çš„ä¸€æ¡çº¿ï¼',
    connect4: 'å››å­æ£‹',
    connect4Tip: 'å°†å½©è‰²åœ†ç›˜æ”¾å…¥åˆ—ä¸­ã€‚ç¬¬ä¸€ä¸ªè¿žæˆ4ä¸ªï¼ˆæ¨ªå‘ã€çºµå‘æˆ–å¯¹è§’çº¿ï¼‰çš„äººèŽ·èƒœï¼',
    startGame: 'å¼€å§‹æ¸¸æˆ',
    or: 'æˆ–',
    back: 'è¿”å›ž',
    wordSearch: 'æ‰¾å­—æ¸¸æˆ',
    words: 'è¯',
    found: 'æ‰¾åˆ°',
    wordsToFind: 'è¦æ‰¾çš„è¯',
    dragToSelect: 'æ‹–åŠ¨é€‰æ‹©å­—æ¯ç»„æˆå•è¯ï¼',
    tapToSelect: 'æŒ‰é¡ºåºç‚¹å‡»å­—æ¯é€‰æ‹©å•è¯ï¼Œç„¶åŽç‚¹å‡»æäº¤ï¼',
    wordSearchTip: 'æŒ‰é¡ºåºç‚¹å‡»å­—æ¯é€‰æ‹©å•è¯ï¼Œç„¶åŽç‚¹å‡»æäº¤ï¼',
    selected: 'å·²é€‰æ‹©',
    clear: 'æ¸…é™¤',
    time: 'æ—¶é—´',
    fasterIsBetter: 'æ—¶é—´è¶ŠçŸ­è¶Šå¥½ï¼',
    rhythmBattle: 'èŠ‚å¥å¯¹æˆ˜',
    rhythmTip: 'å½“æ–¹å—åˆ°è¾¾åº•éƒ¨çš„ç»¿è‰²ç›®æ ‡åŒºåŸŸæ—¶ç‚¹å‡»ï¼å®Œç¾Žæ—¶æœº=æ›´å¤šåˆ†æ•°ï¼',
    enterPlayerNames: 'è¾“å…¥çŽ©å®¶åå­—',
    numberSorting: 'æ•°å­—æŽ’åº',
    numbers: 'æ•°å­—',
    sortAscending: 'æŽ’åºï¼šä»Žå°åˆ°å¤§',
    sortDescending: 'æŽ’åºï¼šä»Žå¤§åˆ°å°',
    numberSortingTip: 'æŒ‰æ­£ç¡®é¡ºåºç‚¹å‡»æ•°å­—ï¼ˆå‡åºæˆ–é™åºï¼‰ï¼',
    mistakes: 'é”™è¯¯',
    penalty: 'æƒ©ç½š',
    tapInOrder: 'æŒ‰æ­£ç¡®é¡ºåºç‚¹å‡»æ•°å­—ï¼',
    mistakesReset: 'ç‚¹é”™ä¼šé‡ç½®æ‚¨çš„é€‰æ‹©',

    // Word Search Wellness
    wellnessTips: 'å¥åº·å°è´´å£«',
    findWordsToSeeTips: 'æ‰¾åˆ°å¥åº·è¯æ±‡ä»¥æŸ¥çœ‹å¥åº·å°è´´å£«ï¼',

    // Colour Sequence Nutrition
    nutritionTips: 'è¥å…»å°è´´å£«',
    clickColorsToSeeTips: 'ç‚¹å‡»é¢œè‰²äº†è§£è¥å…»çŸ¥è¯†ï¼',
    foods: 'é£Ÿç‰©',

    // Math Game Financial Literacy
    financialTips: 'ç†è´¢å°è´´å£«',
    solveProblemsToSeeTips: 'è§£ç­”é—®é¢˜å­¦ä¹ ç†è´¢çŸ¥è¯†ï¼',
    startSolvingForTips: 'å¼€å§‹è§£é¢˜æŸ¥çœ‹æç¤ºï¼',

    // Achievements & Challenges
    achievements: 'æˆå°±',
    dailyChallenges: 'æ¯æ—¥æŒ‘æˆ˜',
    unlocked: 'å·²è§£é”',
    progress: 'è¿›åº¦',
    challengesComplete: 'å®ŒæˆæŒ‘æˆ˜',
    todaysChallenges: 'ä»Šæ—¥æŒ‘æˆ˜',
    challenge: 'æŒ‘æˆ˜',
    target: 'ç›®æ ‡',
    challengeHint: 'æ¯å¤©éƒ½æœ‰æ–°æŒ‘æˆ˜ï¼æ˜Žå¤©å†æ¥å§ï¼',
    completed: 'å®Œæˆï¼',
    inProgress: 'è¿›è¡Œä¸­',
    allChallengesComplete: 'å¤ªæ£’äº†ï¼ä½ å·²å®Œæˆä»Šå¤©æ‰€æœ‰æŒ‘æˆ˜ï¼',

    // Achievement Categories
    starterCategory: 'åˆæ¬¡å°è¯•',
    masteryCategory: 'æ¸¸æˆç²¾é€š',
    consistencyCategory: 'æŒç»­æ¸¸çŽ©',
    varietyCategory: 'å¤šæ ·åŒ–',
    challengesCategory: 'æ¯æ—¥æŒ‘æˆ˜',

    // Individual Achievements
    firstGame: 'åˆæ¬¡å°è¯•',
    firstGameDesc: 'å®Œæˆä½ çš„ç¬¬ä¸€ä¸ªæ¸¸æˆ',
    fiveGames: 'å¼€å§‹ä¸Šæ‰‹',
    fiveGamesDesc: 'çŽ©5ä¸ªæ¸¸æˆ',
    tenGames: 'ä¸“æ³¨çŽ©å®¶',
    tenGamesDesc: 'çŽ©10ä¸ªæ¸¸æˆ',
    threeStars: 'å®Œç¾Žåˆ†æ•°',
    threeStarsDesc: 'åœ¨ä»»ä½•æ¸¸æˆä¸­èŽ·å¾—3é¢—æ˜Ÿ',
    masterEasy: 'ç®€å•æ¨¡å¼å¤§å¸ˆ',
    masterEasyDesc: 'åœ¨æ‰€æœ‰ç®€å•æ¨¡å¼ä¸­èŽ·å¾—3é¢—æ˜Ÿ',
    masterMedium: 'ä¸­ç­‰æ¨¡å¼å¤§å¸ˆ',
    masterMediumDesc: 'åœ¨æ‰€æœ‰ä¸­ç­‰æ¨¡å¼ä¸­èŽ·å¾—3é¢—æ˜Ÿ',
    masterHard: 'å›°éš¾æ¨¡å¼å¤§å¸ˆ',
    masterHardDesc: 'åœ¨æ‰€æœ‰å›°éš¾æ¨¡å¼ä¸­èŽ·å¾—3é¢—æ˜Ÿ',
    streak3: '3å¤©è¿žç»­',
    streak3Desc: 'è¿žç»­3å¤©æ¸¸çŽ©',
    streak7: 'ä¸€å‘¨æˆ˜å£«',
    streak7Desc: 'è¿žç»­7å¤©æ¸¸çŽ©',
    streak30: 'æœˆåº¦å† å†›',
    streak30Desc: 'è¿žç»­30å¤©æ¸¸çŽ©',
    tryAll: 'æŽ¢ç´¢è€…',
    tryAllDesc: 'å°è¯•æ‰€æœ‰å¯ç”¨æ¸¸æˆ',
    allDifficulties: 'æŒ‘æˆ˜å¯»æ±‚è€…',
    allDifficultiesDesc: 'çŽ©æ‰€æœ‰éš¾åº¦ç­‰çº§',
    firstChallenge: 'æŽ¥å—æŒ‘æˆ˜',
    firstChallengeDesc: 'å®Œæˆä½ çš„ç¬¬ä¸€ä¸ªæ¯æ—¥æŒ‘æˆ˜',
    fiveChallenges: 'æŒ‘æˆ˜çŒŽäºº',
    fiveChallengesDesc: 'å®Œæˆ5ä¸ªæ¯æ—¥æŒ‘æˆ˜',
    tenChallenges: 'æŒ‘æˆ˜å¤§å¸ˆ',
    tenChallengesDesc: 'å®Œæˆ10ä¸ªæ¯æ—¥æŒ‘æˆ˜',

    // Challenge Descriptions
    challengeMemoryEasy: 'åœ¨è®°å¿†ç¿»ç‰Œç®€å•æ¨¡å¼ä¸­èŽ·å¾—3é¢—æ˜Ÿ',
    challengeWhackMedium: 'åœ¨æ‰“åœ°é¼ ä¸­ç­‰æ¨¡å¼ä¸­å¾—åˆ†25+',
    challengeSequenceHard: 'åœ¨é¢œè‰²åºåˆ—å›°éš¾æ¨¡å¼ä¸­åˆ°è¾¾ç¬¬5å›žåˆ+',
    challengeWordSearchEasy: 'åœ¨2åˆ†é’Ÿå†…å®Œæˆæ‰¾å­—æ¸¸æˆç®€å•æ¨¡å¼',
    challengeMathMedium: 'åœ¨æ•°å­¦æŒ‘æˆ˜ä¸­ç­‰æ¨¡å¼ä¸­å¾—åˆ†15+',
    challengeNumberSortingEasy: 'åœ¨æ•°å­—æŽ’åºç®€å•æ¨¡å¼ä¸­èŽ·å¾—3é¢—æ˜Ÿ',

    // Quiz Game
    quiz: 'é—®ç­”',
    quizDesc: 'å›žç­”ç®¡ç†å‘˜è®¾ç½®çš„é—®é¢˜',
    quizTip: 'ä»”ç»†é˜…è¯»æ¯ä¸ªé—®é¢˜å¹¶è¾“å…¥ç­”æ¡ˆã€‚æ•°å­—å¯ä»¥å¸¦æˆ–ä¸å¸¦è´§å¸ç¬¦å·è¾“å…¥ï¼',
    noQuizQuestions: 'æ²¡æœ‰å¯ç”¨çš„é—®ç­”é¢˜',
    noQuizQuestionsDesc: 'è¯·è”ç³»ç®¡ç†å‘˜æ·»åŠ é—®é¢˜ã€‚',
    quizComplete: 'é—®ç­”å®Œæˆï¼',
    reviewAnswers: 'æŸ¥çœ‹æ‚¨çš„ç­”æ¡ˆ',
    yourAnswer: 'æ‚¨çš„ç­”æ¡ˆ',
    correctAnswer: 'æ­£ç¡®ç­”æ¡ˆ',
    typeYourAnswer: 'åœ¨æ­¤è¾“å…¥æ‚¨çš„ç­”æ¡ˆ...',
    submitAnswer: 'æäº¤ç­”æ¡ˆ',
    correct: 'æ­£ç¡®ï¼',
    incorrect: 'é”™è¯¯',
    theAnswerWas: 'æ­£ç¡®ç­”æ¡ˆæ˜¯',
    nextQuestion: 'ä¸‹ä¸€é¢˜',
    seeResults: 'æŸ¥çœ‹ç»“æžœ',
    loading: 'åŠ è½½ä¸­...'
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
  const [menuGreetingReason, setMenuGreetingReason] = useState(null);
  const [hasGreetedMenu, setHasGreetedMenu] = useState(false);
  const prevCurrentGameRef = useRef(null);
  const lastPlayedGameRef = useRef(null);
  const aiQueueRef = useRef([]);
  const aiQueueTimerRef = useRef(null);
  const aiQueueStateRef = useRef({ processing: false, lastSentAt: 0 });

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

  // Function to trigger AI companion with prioritized queue and cooldown
  const AI_TRIGGER_COOLDOWN_MS = 9000;

  const inferAIPriority = (prompt) => {
    const text = (prompt || '').toLowerCase();
    if (text.includes('completed') || text.includes('you won') || text.includes('celebrate')) return 'high';
    if (text.includes('mistake') || text.includes('wrong') || text.includes('mismatch')) return 'medium';
    return 'low';
  };

  const inferAIKey = (prompt) => {
    const text = (prompt || '').toLowerCase();
    if (text.includes('completed') || text.includes('you won') || text.includes('celebrate')) return 'completion';
    if (text.includes('mistake') || text.includes('wrong') || text.includes('mismatch')) return 'mistake';
    if (text.includes('found') || text.includes('selected') || text.includes('progress')) return 'progress';
    return 'generic';
  };

  const processAIQueue = () => {
    if (aiQueueStateRef.current.processing) return;
    if (aiQueueRef.current.length === 0) return;

    const now = Date.now();
    const elapsed = now - aiQueueStateRef.current.lastSentAt;

    if (elapsed < AI_TRIGGER_COOLDOWN_MS) {
      const waitMs = AI_TRIGGER_COOLDOWN_MS - elapsed;
      if (aiQueueTimerRef.current) clearTimeout(aiQueueTimerRef.current);
      aiQueueTimerRef.current = setTimeout(() => {
        aiQueueTimerRef.current = null;
        processAIQueue();
      }, waitMs);
      return;
    }

    aiQueueStateRef.current.processing = true;
    const next = aiQueueRef.current.shift();

    if (next) {
      setAiTrigger(next.prompt);
      setTimeout(() => setAiTrigger(null), 100);
      aiQueueStateRef.current.lastSentAt = Date.now();
    }

    aiQueueStateRef.current.processing = false;

    if (aiQueueRef.current.length > 0) {
      if (aiQueueTimerRef.current) clearTimeout(aiQueueTimerRef.current);
      aiQueueTimerRef.current = setTimeout(() => {
        aiQueueTimerRef.current = null;
        processAIQueue();
      }, AI_TRIGGER_COOLDOWN_MS);
    }
  };

  const triggerAI = (prompt) => {
    if (!prompt) return;

    const priority = inferAIPriority(prompt);
    const key = inferAIKey(prompt);
    const queue = aiQueueRef.current;

    if (priority === 'low') {
      const existingIndex = queue.findIndex((item) => item.key === key && item.priority === 'low');
      if (existingIndex >= 0) {
        queue[existingIndex] = { prompt, priority, key };
      } else {
        queue.push({ prompt, priority, key });
      }
    } else if (priority === 'medium') {
      queue.push({ prompt, priority, key });
    } else {
      queue.unshift({ prompt, priority, key });
    }

    if (queue.length > 8) {
      aiQueueRef.current = queue.slice(0, 8);
    }

    processAIQueue();
  };

  // Get time-of-day greeting context
  const getTimeOfDayContext = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { period: 'morning', greeting: 'Good morning' };
    if (hour >= 12 && hour < 17) return { period: 'afternoon', greeting: 'Good afternoon' };
    if (hour >= 17 && hour < 21) return { period: 'evening', greeting: 'Good evening' };
    return { period: 'night', greeting: 'Hello' };
  };

  const getGameDisplayName = (gameId) => {
    const names = {
      memory: 'Memory Card',
      whack: 'Whack-a-Mole',
      sequence: 'Color Sequence',
      math: 'Math Challenge',
      wordsearch: 'Word Search',
      numbersorting: 'Number Sorting',
      quiz: 'Quiz',
      rhythm: 'Rhythm Battle',
      tictactoe: 'Tic Tac Toe',
      connect4: 'Connect 4'
    };
    return names[gameId] || 'the previous game';
  };

  // Detect when user returns from a game to menu in single-player mode.
  useEffect(() => {
    const prevGame = prevCurrentGameRef.current;
    if (gameMode === 'single' && prevGame && !currentGame) {
      lastPlayedGameRef.current = prevGame;
      setMenuGreetingReason('return_from_game');
      setHasGreetedMenu(false);
    }
    prevCurrentGameRef.current = currentGame;
  }, [currentGame, gameMode]);

  // Main menu greeting with session awareness
  useEffect(() => {
    if (gameMode === 'single' && !currentGame && !hasGreetedMenu && playerName && menuGreetingReason) {
      const gameNames = ['Memory Card', 'Whack-a-Mole', 'Color Sequence', 'Word Search', 'Number Sorting', 'Quiz'];
      const randomGame = gameNames[Math.floor(Math.random() * gameNames.length)];
      const timeContext = getTimeOfDayContext();
      const lastGame = getGameDisplayName(lastPlayedGameRef.current);

      setTimeout(() => {
        const isChineseMode = language === 'zh' || language === 'yue';

        let prompt = '';
        if (menuGreetingReason === 'new_session') {
          prompt = isChineseMode
            ? `Greet ${playerName || 'the player'} in Chinese with a ${timeContext.period} greeting. Ask what game they want to play and suggest "${randomGame}". Keep it warm and brief.`
            : `Greet ${playerName || 'the player'} with "${timeContext.greeting}" since it's ${timeContext.period}. Ask what game they want to play today. Maybe suggest trying "${randomGame}" in warm Singlish. Keep it brief.`;
        } else {
          prompt = isChineseMode
            ? `The player just returned to the game menu after "${lastGame}". In Chinese, suggest another game naturally, like "Looking for other games ah, can try ${randomGame}." Do not repeat time-of-day greeting. Keep it brief.`
            : `The player just returned to the game menu after "${lastGame}". Suggest another game naturally, like "Looking for other games ah, can try ${randomGame}." Do not repeat time-of-day greeting. Keep it brief.`;
        }

        triggerAI(prompt);
        setHasGreetedMenu(true);
        setMenuGreetingReason(null);
      }, 1200);
    }
  }, [currentGame, gameMode, playerName, hasGreetedMenu, language, menuGreetingReason]);

  useEffect(() => {
    return () => {
      if (aiQueueTimerRef.current) clearTimeout(aiQueueTimerRef.current);
    };
  }, []);

  // Generate daily challenges
  const generateDailyChallenges = () => {
    const allChallenges = [
      // Memory Game Challenges
      { id: 'memory_easy_3star', game: 'memory', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Memory Easy', icon: 'ðŸŒŸ' },
      { id: 'memory_medium_3star', game: 'memory', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Memory Medium', icon: 'â­' },
      { id: 'memory_hard_complete', game: 'memory', difficulty: 'hard', target: 'Complete', desc: 'Complete Memory Hard mode', icon: 'ðŸ’«' },
      { id: 'memory_easy_10moves', game: 'memory', difficulty: 'easy', target: 'Under 10 moves', desc: 'Beat Memory Easy in under 10 moves', icon: 'ðŸŽ®' },
      { id: 'memory_medium_20moves', game: 'memory', difficulty: 'medium', target: 'Under 20 moves', desc: 'Beat Memory Medium in under 20 moves', icon: 'ðŸŽ¯' },

      // Whack-a-Mole Challenges
      { id: 'whack_easy_15', game: 'whack', difficulty: 'easy', target: 'Score 15+', desc: 'Score 15+ in Whack-a-Mole Easy', icon: 'ðŸ”¨' },
      { id: 'whack_medium_25', game: 'whack', difficulty: 'medium', target: 'Score 25+', desc: 'Score 25+ in Whack-a-Mole Medium', icon: 'âš¡' },
      { id: 'whack_hard_30', game: 'whack', difficulty: 'hard', target: 'Score 30+', desc: 'Score 30+ in Whack-a-Mole Hard', icon: 'ðŸ”¥' },
      { id: 'whack_crazy_40', game: 'whack', difficulty: 'crazy', target: 'Score 40+', desc: 'Score 40+ in Whack-a-Mole Crazy', icon: 'ðŸ’¥' },
      { id: 'whack_easy_3star', game: 'whack', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Whack-a-Mole Easy', icon: 'ðŸŒŸ' },

      // Color Sequence Challenges
      { id: 'sequence_easy_round5', game: 'sequence', difficulty: 'easy', target: 'Round 5+', desc: 'Reach round 5+ in Color Sequence Easy', icon: 'ðŸŽ¨' },
      { id: 'sequence_medium_round5', game: 'sequence', difficulty: 'medium', target: 'Round 5+', desc: 'Reach round 5+ in Color Sequence Medium', icon: 'ðŸŒˆ' },
      { id: 'sequence_hard_round3', game: 'sequence', difficulty: 'hard', target: 'Round 3+', desc: 'Reach round 3+ in Color Sequence Hard', icon: 'âš¡' },
      { id: 'sequence_easy_3star', game: 'sequence', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Color Sequence Easy', icon: 'â­' },
      { id: 'sequence_medium_3star', game: 'sequence', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Color Sequence Medium', icon: 'ðŸ’«' },

      // Word Search Challenges
      { id: 'wordsearch_easy_3min', game: 'wordsearch', difficulty: 'easy', target: 'Under 3 min', desc: 'Complete Word Search Easy under 3 minutes', icon: 'ðŸ”' },
      { id: 'wordsearch_medium_5min', game: 'wordsearch', difficulty: 'medium', target: 'Under 5 min', desc: 'Complete Word Search Medium under 5 minutes', icon: 'ðŸ“' },
      { id: 'wordsearch_hard_complete', game: 'wordsearch', difficulty: 'hard', target: 'Complete', desc: 'Complete Word Search Hard mode', icon: 'ðŸŽ“' },
      { id: 'wordsearch_easy_2min', game: 'wordsearch', difficulty: 'easy', target: 'Under 2 min', desc: 'Complete Word Search Easy under 2 minutes', icon: 'âš¡' },
      { id: 'wordsearch_medium_3star', game: 'wordsearch', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Word Search Medium', icon: 'ðŸŒŸ' },

      // Math Game Challenges
      { id: 'math_easy_10', game: 'math', difficulty: 'easy', target: 'Score 10+', desc: 'Score 10+ in Math Challenge Easy', icon: 'ðŸ§®' },
      { id: 'math_medium_15', game: 'math', difficulty: 'medium', target: 'Score 15+', desc: 'Score 15+ in Math Challenge Medium', icon: 'âž•' },
      { id: 'math_hard_20', game: 'math', difficulty: 'hard', target: 'Score 20+', desc: 'Score 20+ in Math Challenge Hard', icon: 'âœ–ï¸' },
      { id: 'math_easy_3star', game: 'math', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Math Challenge Easy', icon: 'â­' },
      { id: 'math_medium_3star', game: 'math', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Math Challenge Medium', icon: 'ðŸŒŸ' },

      // Number Sorting Challenges
      { id: 'numbersorting_easy_3star', game: 'numbersorting', difficulty: 'easy', target: '3 stars', desc: 'Get 3 stars in Number Sorting Easy', icon: 'ðŸ”¢' },
      { id: 'numbersorting_medium_3star', game: 'numbersorting', difficulty: 'medium', target: '3 stars', desc: 'Get 3 stars in Number Sorting Medium', icon: 'ðŸ’¯' },
      { id: 'numbersorting_hard_complete', game: 'numbersorting', difficulty: 'hard', target: 'Complete', desc: 'Complete Number Sorting Hard mode', icon: 'ðŸŽ¯' },
      { id: 'numbersorting_easy_nomistakes', game: 'numbersorting', difficulty: 'easy', target: 'No mistakes', desc: 'Complete Number Sorting Easy with no mistakes', icon: 'âœ¨' },
      { id: 'numbersorting_medium_2min', game: 'numbersorting', difficulty: 'medium', target: 'Under 2 min', desc: 'Complete Number Sorting Medium under 2 minutes', icon: 'â±ï¸' },

      // General/Mixed Challenges
      { id: 'play_3games', game: 'any', difficulty: 'any', target: '3 games', desc: 'Play any 3 games today', icon: 'ðŸŽ®' },
      { id: 'win_2games', game: 'any', difficulty: 'any', target: 'Win 2', desc: 'Win any 2 games today', icon: 'ðŸ†' },
      { id: 'try_newgame', game: 'any', difficulty: 'any', target: 'Try new', desc: 'Try a game you haven\'t played today', icon: 'ðŸŽ²' },
      { id: 'perfect_score', game: 'any', difficulty: 'any', target: '3 stars', desc: 'Get 3 stars in any game', icon: 'â­' },
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
      setMenuGreetingReason('new_session');
      setHasGreetedMenu(false);
    }
  };

  const handleGuestMode = () => {
    setPlayerName('Guest');
    setIsGuestMode(true);
    setShowNameEntry(false);
    setMenuGreetingReason('new_session');
    setHasGreetedMenu(false);
  };

  const handleLogout = () => {
    // Clear the saved player name from localStorage
    localStorage.removeItem('hogGamesPlayerName');
    setPlayerName('');
    setIsGuestMode(false);
    setShowNameEntry(false);
    setGameMode(null);
    setCurrentGame(null);
    setMenuGreetingReason(null);
    setHasGreetedMenu(false);
  };

  const handleSelectSinglePlayer = () => {
    soundPlayer.playClick();
    setGameMode('single');
    setMenuGreetingReason('new_session');
    setHasGreetedMenu(false);
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
                  <option value="zh">åŽè¯­</option>
                  <option value="yue">ç²¤è¯­</option>
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
                  <option value="zh">åŽè¯­</option>
                  <option value="yue">ç²¤è¯­</option>
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
                    <option value="zh">ä¸­æ–‡</option>
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
                    ðŸŽ¯ {t.todaysChallenges}
                  </h3>
                  <div className="bg-purple-100 px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-purple-700">
                      {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length} âœ“
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
                            <span className="text-3xl">âœ“</span>
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
                    ðŸŽ‰ {t.allChallengesComplete || "Amazing! You've completed all today's challenges!"}
                  </p>
                ) : (
                  <p className="text-center text-purple-600 text-xl mt-6 opacity-80">
                    ðŸ’¡ {t.challengeHint}
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
                <span className="text-5xl">â†’</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('whack'); }}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Hammer size={72} />
                  <span>{t.whackMole}</span>
                </div>
                <span className="text-5xl">â†’</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('sequence'); }}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Zap size={72} />
                  <span>{t.colorSequence}</span>
                </div>
                <span className="text-5xl">â†’</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('math'); }}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Calculator size={72} />
                  <span>{t.mathGame}</span>
                </div>
                <span className="text-5xl">â†’</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('wordsearch'); }}
                className="w-full bg-rose-700 hover:bg-rose-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <Search size={72} />
                  <span>{t.wordSearch}</span>
                </div>
                <span className="text-5xl">â†’</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('numbersorting'); }}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <ArrowUpDown size={72} />
                  <span>{t.numberSorting}</span>
                </div>
                <span className="text-5xl">â†’</span>
              </button>

              <button
                onClick={() => { soundPlayer.playClick(); setCurrentGame('statistics'); }}
                className="w-full bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white p-12 rounded-3xl text-5xl font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <BarChart3 size={72} />
                  <span>{t.statistics}</span>
                </div>
                <span className="text-5xl">â†’</span>
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
                  <span className="text-5xl">â†’</span>
                </button>
              )}
            </div>

            <div className="mt-10 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <p className="text-blue-900 text-center font-bold text-3xl">âœ¨ {t.welcome}</p>
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
                    <option value="zh">ä¸­æ–‡</option>
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
                  <span className="text-5xl">â†’</span>
                </button>
                <div className="mt-3 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 text-center text-2xl">ðŸ’¡ {t.ticTacToeTip}</p>
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
                  <span className="text-5xl">â†’</span>
                </button>
                <div className="mt-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-800 text-center text-2xl">ðŸ’¡ {t.connect4Tip}</p>
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
                  <span className="text-5xl">â†’</span>
                </button>
                <div className="mt-3 bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-purple-800 text-center text-2xl">ðŸ’¡ {t.rhythmTip}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <p className="text-green-900 text-center font-bold text-3xl">ðŸŽ® {t.welcome}</p>
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
            <div className="text-8xl mb-6">ðŸ‘‹</div>
            <h2 className="text-5xl font-bold text-gray-800 mb-4">
              {language === 'zh' || language === 'yue' ? 'ä½ è¿˜åœ¨å—ï¼Ÿ' : 'Are you still there?'}
            </h2>
            <p className="text-3xl text-gray-600 mb-8">
              {language === 'zh' || language === 'yue'
                ? 'ç‚¹å‡»ä»»ä½•åœ°æ–¹ç»§ç»­çŽ©æ¸¸æˆ'
                : 'Tap anywhere to continue playing'}
            </p>
            <p className="text-2xl text-yellow-600 mb-8">
              {language === 'zh' || language === 'yue'
                ? 'å¦‚æžœæ²¡æœ‰ååº”ï¼Œå°†è‡ªåŠ¨è¿”å›žä¸»èœå•...'
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
              {language === 'zh' || language === 'yue' ? 'æˆ‘è¿˜åœ¨ï¼ç»§ç»­çŽ©' : "I'm here! Keep playing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


