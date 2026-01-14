import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, getDoc, doc, onSnapshot, query, orderBy, limit, deleteDoc, updateDoc, increment, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============ LEADERBOARD FUNCTIONS ============

export const getLeaderboard = async (game) => {
  const leaderboardRef = collection(db, 'leaderboards', game, 'scores');
  const q = query(leaderboardRef, orderBy('score', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addScore = async (game, playerName, score, difficulty, time = null) => {
  const docId = `${playerName.toLowerCase()}_${difficulty}`;
  const leaderboardRef = doc(db, 'leaderboards', game, 'scores', docId);

  const data = {
    name: playerName,
    score: score,
    difficulty: difficulty,
    date: new Date().toLocaleDateString(),
    timestamp: Date.now()
  };

  if (time !== null) {
    data.time = time;
  }

  await setDoc(leaderboardRef, data, { merge: true });
};

// Subscribe to real-time leaderboard updates
export const subscribeToLeaderboard = (game, callback) => {
  const leaderboardRef = collection(db, 'leaderboards', game, 'scores');
  const q = query(leaderboardRef, limit(50));

  return onSnapshot(q, (snapshot) => {
    const scores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(scores);
  });
};

// Delete a leaderboard entry (admin function)
export const deleteLeaderboardEntry = async (game, docId) => {
  const leaderboardRef = doc(db, 'leaderboards', game, 'scores', docId);
  await deleteDoc(leaderboardRef);
};

// Clear all scores for a game (admin function)
export const clearGameLeaderboard = async (game) => {
  const leaderboardRef = collection(db, 'leaderboards', game, 'scores');
  const snapshot = await getDocs(leaderboardRef);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// ============ PLAYER STATS FUNCTIONS ============

// Get player stats
export const getPlayerStats = async (playerName) => {
  if (!playerName || playerName === 'Guest') return null;

  const statsRef = doc(db, 'playerStats', playerName.toLowerCase());
  const snapshot = await getDoc(statsRef);

  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
};

// Subscribe to player stats (real-time)
export const subscribeToPlayerStats = (playerName, callback) => {
  if (!playerName || playerName === 'Guest') {
    callback(null);
    return () => {};
  }

  const statsRef = doc(db, 'playerStats', playerName.toLowerCase());

  return onSnapshot(statsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback(null);
    }
  });
};

// Update player stats after a game
export const updatePlayerStats = async (playerName, game, score, difficulty) => {
  if (!playerName || playerName === 'Guest') return;

  const statsRef = doc(db, 'playerStats', playerName.toLowerCase());
  const snapshot = await getDoc(statsRef);

  const today = new Date().toDateString();
  const playTimes = { memory: 1, whack: 0.5, sequence: 2, math: 1, wordsearch: 3, numbersorting: 2 };

  if (snapshot.exists()) {
    const existingStats = snapshot.data();
    const lastPlayDate = existingStats.lastPlayDate || '';

    // Calculate streak
    let newStreak = existingStats.currentStreak || 0;
    if (lastPlayDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPlayDate === yesterday.toDateString()) {
        newStreak = newStreak + 1;
      } else if (lastPlayDate) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
    }

    // Update games breakdown
    const gamesBreakdown = existingStats.gamesBreakdown || {};
    gamesBreakdown[game] = (gamesBreakdown[game] || 0) + 1;

    // Update personal bests
    const personalBests = existingStats.personalBests || {};
    const currentBest = personalBests[game] || { score: 0, difficulty: 'easy', date: '-' };

    const difficultyOrder = { 'hard': 3, 'medium': 2, 'easy': 1 };
    const newDiff = difficultyOrder[difficulty] || 0;
    const existingDiff = difficultyOrder[currentBest.difficulty] || 0;

    let shouldUpdateBest = false;
    if (newDiff > existingDiff) {
      shouldUpdateBest = true;
    } else if (newDiff === existingDiff) {
      if (game === 'memory' || game === 'wordsearch' || game === 'numbersorting') {
        shouldUpdateBest = score < currentBest.score || currentBest.score === 0;
      } else {
        shouldUpdateBest = score > currentBest.score;
      }
    }

    if (shouldUpdateBest) {
      personalBests[game] = {
        score,
        difficulty,
        date: new Date().toLocaleDateString()
      };
    }

    // Update recent activity
    const recentActivity = existingStats.recentActivity || [];
    recentActivity.unshift({
      game,
      score,
      difficulty,
      date: new Date().toLocaleDateString()
    });

    await updateDoc(statsRef, {
      totalGamesPlayed: increment(1),
      totalPlayTime: increment(playTimes[game] || 1),
      gamesBreakdown,
      personalBests,
      recentActivity: recentActivity.slice(0, 10),
      lastPlayDate: today,
      currentStreak: newStreak
    });
  } else {
    // Create new stats document
    const gamesBreakdown = { memory: 0, whack: 0, sequence: 0, math: 0, wordsearch: 0, numbersorting: 0 };
    gamesBreakdown[game] = 1;

    const personalBests = {
      memory: { score: 0, difficulty: 'easy', date: '-' },
      whack: { score: 0, difficulty: 'easy', date: '-' },
      sequence: { score: 0, difficulty: 'easy', date: '-' },
      math: { score: 0, difficulty: 'easy', date: '-' },
      wordsearch: { score: 0, difficulty: 'easy', date: '-' },
      numbersorting: { score: 0, difficulty: 'easy', date: '-' }
    };
    personalBests[game] = { score, difficulty, date: new Date().toLocaleDateString() };

    await setDoc(statsRef, {
      playerName: playerName,
      totalGamesPlayed: 1,
      totalPlayTime: playTimes[game] || 1,
      gamesBreakdown,
      personalBests,
      recentActivity: [{
        game,
        score,
        difficulty,
        date: new Date().toLocaleDateString()
      }],
      lastPlayDate: today,
      currentStreak: 1,
      challengesCompleted: 0,
      createdAt: Date.now()
    });
  }
};

// Increment challenges completed
export const incrementChallengesCompleted = async (playerName) => {
  if (!playerName || playerName === 'Guest') return;

  const statsRef = doc(db, 'playerStats', playerName.toLowerCase());
  const snapshot = await getDoc(statsRef);

  if (snapshot.exists()) {
    await updateDoc(statsRef, {
      challengesCompleted: increment(1)
    });
  }
};

// ============ DAILY CHALLENGES FUNCTIONS ============

// Get daily challenges for a player
export const getDailyChallenges = async (playerName) => {
  if (!playerName || playerName === 'Guest') return null;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const challengesRef = doc(db, 'dailyChallenges', `${playerName.toLowerCase()}_${today}`);
  const snapshot = await getDoc(challengesRef);

  if (snapshot.exists()) {
    return snapshot.data().challenges;
  }
  return null;
};

// Save daily challenges for a player
export const saveDailyChallenges = async (playerName, challenges) => {
  if (!playerName || playerName === 'Guest') return;

  const today = new Date().toISOString().split('T')[0];
  const challengesRef = doc(db, 'dailyChallenges', `${playerName.toLowerCase()}_${today}`);

  await setDoc(challengesRef, {
    playerName: playerName.toLowerCase(),
    date: today,
    challenges,
    createdAt: Date.now()
  });
};

// Update challenge completion status
export const updateChallengeCompletion = async (playerName, challengeId) => {
  if (!playerName || playerName === 'Guest') return;

  const today = new Date().toISOString().split('T')[0];
  const challengesRef = doc(db, 'dailyChallenges', `${playerName.toLowerCase()}_${today}`);
  const snapshot = await getDoc(challengesRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    const challenges = data.challenges.map(c =>
      c.id === challengeId ? { ...c, completed: true } : c
    );

    await updateDoc(challengesRef, { challenges });
    return true;
  }
  return false;
};

// ============ QUIZ QUESTIONS FUNCTIONS ============

// Get all quiz questions (for admin)
export const getAllQuizQuestions = async () => {
  const questionsRef = collection(db, 'quizQuestions');
  const q = query(questionsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Subscribe to quiz questions (real-time)
export const subscribeToQuizQuestions = (callback) => {
  const questionsRef = collection(db, 'quizQuestions');
  const q = query(questionsRef, orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(questions);
  });
};

// Get enabled quiz questions only (for players)
export const getEnabledQuizQuestions = async () => {
  const questionsRef = collection(db, 'quizQuestions');
  const q = query(questionsRef, where('enabled', '==', true), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add a new quiz question
export const addQuizQuestion = async (question, answer, order) => {
  const docId = `q_${Date.now()}`;
  const questionRef = doc(db, 'quizQuestions', docId);

  await setDoc(questionRef, {
    question,
    answer,
    order,
    enabled: true,
    createdAt: Date.now()
  });

  return docId;
};

// Update a quiz question
export const updateQuizQuestion = async (questionId, updates) => {
  const questionRef = doc(db, 'quizQuestions', questionId);
  await updateDoc(questionRef, updates);
};

// Delete a quiz question
export const deleteQuizQuestion = async (questionId) => {
  const questionRef = doc(db, 'quizQuestions', questionId);
  await deleteDoc(questionRef);
};

// Toggle quiz question enabled status
export const toggleQuizQuestion = async (questionId, enabled) => {
  const questionRef = doc(db, 'quizQuestions', questionId);
  await updateDoc(questionRef, { enabled });
};

// Reorder quiz questions
export const reorderQuizQuestions = async (questions) => {
  const updatePromises = questions.map((q, index) => {
    const questionRef = doc(db, 'quizQuestions', q.id);
    return updateDoc(questionRef, { order: index + 1 });
  });
  await Promise.all(updatePromises);
};

// ============ ACHIEVEMENTS FUNCTIONS ============

// Get player achievements
export const getPlayerAchievements = async (playerName) => {
  if (!playerName || playerName === 'Guest') return [];

  const achievementsRef = doc(db, 'playerAchievements', playerName.toLowerCase());
  const snapshot = await getDoc(achievementsRef);

  if (snapshot.exists()) {
    return snapshot.data().achievements || [];
  }
  return [];
};

// Subscribe to player achievements (real-time)
export const subscribeToPlayerAchievements = (playerName, callback) => {
  if (!playerName || playerName === 'Guest') {
    callback([]);
    return () => {};
  }

  const achievementsRef = doc(db, 'playerAchievements', playerName.toLowerCase());

  return onSnapshot(achievementsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().achievements || []);
    } else {
      callback([]);
    }
  });
};

// Save player achievements
export const savePlayerAchievements = async (playerName, achievements) => {
  if (!playerName || playerName === 'Guest') return;

  const achievementsRef = doc(db, 'playerAchievements', playerName.toLowerCase());
  await setDoc(achievementsRef, {
    playerName: playerName.toLowerCase(),
    achievements,
    updatedAt: Date.now()
  }, { merge: true });
};

// Add a new achievement to player
export const addPlayerAchievement = async (playerName, achievementId) => {
  if (!playerName || playerName === 'Guest') return;

  const achievementsRef = doc(db, 'playerAchievements', playerName.toLowerCase());
  const snapshot = await getDoc(achievementsRef);

  let achievements = [];
  if (snapshot.exists()) {
    achievements = snapshot.data().achievements || [];
  }

  if (!achievements.includes(achievementId)) {
    achievements.push(achievementId);
    await setDoc(achievementsRef, {
      playerName: playerName.toLowerCase(),
      achievements,
      updatedAt: Date.now()
    }, { merge: true });
  }

  return achievements;
};

export { db };
