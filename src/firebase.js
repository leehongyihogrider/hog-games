import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkKT-7q7NAOfk30bzNaYO9_9sbnHcQZ9A",
  authDomain: "hog-games.firebaseapp.com",
  projectId: "hog-games",
  storageBucket: "hog-games.firebasestorage.app",
  messagingSenderId: "122388509250",
  appId: "1:122388509250:web:54730f3ceb761b0f5473db",
  measurementId: "G-EXK6522Q3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Leaderboard functions
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

export { db };
