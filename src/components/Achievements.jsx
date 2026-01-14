import { useState, useEffect } from 'react';
import { Trophy, Award, Star, Target, Calendar, Zap, Home } from 'lucide-react';
import { subscribeToPlayerAchievements, savePlayerAchievements } from '../firebase';

const Achievements = ({ goHome, language, translations, playerName, stats, dailyChallenges: propChallenges }) => {
  const t = translations[language];
  const [achievements, setAchievements] = useState([]);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('achievements'); // 'achievements' or 'challenges'

  // Achievement definitions
  const achievementList = [
    // First Steps
    { id: 'first_game', name: t.firstGame || 'First Steps', desc: t.firstGameDesc || 'Complete your first game', icon: '🎮', category: 'starter', checkFn: (stats) => stats.gamesPlayed >= 1 },
    { id: 'five_games', name: t.fiveGames || 'Getting Started', desc: t.fiveGamesDesc || 'Play 5 games', icon: '🎯', category: 'starter', checkFn: (stats) => stats.gamesPlayed >= 5 },
    { id: 'ten_games', name: t.tenGames || 'Dedicated Player', desc: t.tenGamesDesc || 'Play 10 games', icon: '⭐', category: 'starter', checkFn: (stats) => stats.gamesPlayed >= 10 },

    // Game Mastery
    { id: 'three_stars', name: t.threeStars || 'Perfect Score', desc: t.threeStarsDesc || 'Get 3 stars in any game', icon: '🌟', category: 'mastery', checkFn: (stats) => stats.threeStarGames >= 1 },
    { id: 'master_easy', name: t.masterEasy || 'Easy Master', desc: t.masterEasyDesc || 'Get 3 stars in all easy modes', icon: '🥉', category: 'mastery', checkFn: (stats) => stats.easyMastered || false },
    { id: 'master_medium', name: t.masterMedium || 'Medium Master', desc: t.masterMediumDesc || 'Get 3 stars in all medium modes', icon: '🥈', category: 'mastery', checkFn: (stats) => stats.mediumMastered || false },
    { id: 'master_hard', name: t.masterHard || 'Hard Master', desc: t.masterHardDesc || 'Get 3 stars in all hard modes', icon: '🥇', category: 'mastery', checkFn: (stats) => stats.hardMastered || false },

    // Consistency
    { id: 'streak_3', name: t.streak3 || '3 Day Streak', desc: t.streak3Desc || 'Play 3 days in a row', icon: '🔥', category: 'consistency', checkFn: (stats) => stats.currentStreak >= 3 },
    { id: 'streak_7', name: t.streak7 || 'Week Warrior', desc: t.streak7Desc || 'Play 7 days in a row', icon: '🔥🔥', category: 'consistency', checkFn: (stats) => stats.currentStreak >= 7 },
    { id: 'streak_30', name: t.streak30 || 'Monthly Champion', desc: t.streak30Desc || 'Play 30 days in a row', icon: '🔥🔥🔥', category: 'consistency', checkFn: (stats) => stats.currentStreak >= 30 },

    // Variety
    { id: 'try_all', name: t.tryAll || 'Explorer', desc: t.tryAllDesc || 'Try all available games', icon: '🎲', category: 'variety', checkFn: (stats) => stats.gamesTriedCount >= 7 },
    { id: 'all_difficulties', name: t.allDifficulties || 'Challenge Seeker', desc: t.allDifficultiesDesc || 'Play all difficulty levels', icon: '🎖️', category: 'variety', checkFn: (stats) => stats.allDifficultiesTried || false },

    // Daily Challenges
    { id: 'first_challenge', name: t.firstChallenge || 'Challenge Accepted', desc: t.firstChallengeDesc || 'Complete your first daily challenge', icon: '✅', category: 'challenges', checkFn: (stats) => stats.challengesCompleted >= 1 },
    { id: 'five_challenges', name: t.fiveChallenges || 'Challenge Hunter', desc: t.fiveChallengesDesc || 'Complete 5 daily challenges', icon: '🎯', category: 'challenges', checkFn: (stats) => stats.challengesCompleted >= 5 },
    { id: 'ten_challenges', name: t.tenChallenges || 'Challenge Master', desc: t.tenChallengesDesc || 'Complete 10 daily challenges', icon: '🏆', category: 'challenges', checkFn: (stats) => stats.challengesCompleted >= 10 },
  ];

  // Subscribe to achievements from Firebase
  useEffect(() => {
    if (!playerName || playerName === 'Guest') {
      setAchievements([]);
      return;
    }

    const unsubscribe = subscribeToPlayerAchievements(playerName, (firebaseAchievements) => {
      setAchievements(firebaseAchievements);
    });

    return () => unsubscribe();
  }, [playerName]);

  // Check and update achievements - save to Firebase
  useEffect(() => {
    if (!stats || !playerName || playerName === 'Guest') return;

    const unlockedAchievements = [];
    achievementList.forEach(achievement => {
      if (achievement.checkFn(stats) && !achievements.includes(achievement.id)) {
        unlockedAchievements.push(achievement.id);
      }
    });

    if (unlockedAchievements.length > 0) {
      const newAchievements = [...achievements, ...unlockedAchievements];
      // Save to Firebase
      savePlayerAchievements(playerName, newAchievements).catch(err => {
        console.error('Failed to save achievements to Firebase:', err);
      });
    }
  }, [stats, playerName, achievements]);

  // Use daily challenges from props (already managed by App.jsx via Firebase)
  useEffect(() => {
    if (propChallenges && propChallenges.length > 0) {
      setDailyChallenges(propChallenges);
    }
  }, [propChallenges]);

  const generateDailyChallenges = () => {
    const allChallenges = [
      { id: 'memory_easy_3star', game: 'memory', difficulty: 'easy', target: '3 stars', desc: t.challengeMemoryEasy || 'Get 3 stars in Memory Easy', difficulty_level: 'easy' },
      { id: 'whack_medium_25', game: 'whack', difficulty: 'medium', target: 'Score 25+', desc: t.challengeWhackMedium || 'Score 25+ in Whack-a-Mole Medium', difficulty_level: 'medium' },
      { id: 'sequence_hard_complete', game: 'sequence', difficulty: 'hard', target: 'Round 5+', desc: t.challengeSequenceHard || 'Reach round 5+ in Color Sequence Hard', difficulty_level: 'hard' },
      { id: 'wordsearch_easy_2min', game: 'wordsearch', difficulty: 'easy', target: 'Under 2 min', desc: t.challengeWordSearchEasy || 'Complete Word Search Easy under 2 minutes', difficulty_level: 'easy' },
      { id: 'math_medium_15', game: 'math', difficulty: 'medium', target: 'Score 15+', desc: t.challengeMathMedium || 'Score 15+ in Math Challenge Medium', difficulty_level: 'medium' },
      { id: 'numbersorting_easy_3star', game: 'numbersorting', difficulty: 'easy', target: '3 stars', desc: t.challengeNumberSortingEasy || 'Get 3 stars in Number Sorting Easy', difficulty_level: 'easy' },
    ];

    // Pick 3 random challenges
    const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((challenge, index) => ({
      ...challenge,
      completed: false,
      index: index
    }));
  };

  const categoryColors = {
    starter: 'from-green-500 to-emerald-600',
    mastery: 'from-purple-500 to-indigo-600',
    consistency: 'from-orange-500 to-red-600',
    variety: 'from-blue-500 to-cyan-600',
    challenges: 'from-pink-500 to-rose-600'
  };

  const renderAchievements = () => {
    const categories = ['starter', 'mastery', 'consistency', 'variety', 'challenges'];

    return categories.map(category => {
      const categoryAchievements = achievementList.filter(a => a.category === category);
      const categoryName = {
        starter: t.starterCategory || 'First Steps',
        mastery: t.masteryCategory || 'Game Mastery',
        consistency: t.consistencyCategory || 'Consistency',
        variety: t.varietyCategory || 'Variety',
        challenges: t.challengesCategory || 'Daily Challenges'
      };

      return (
        <div key={category} className="mb-8">
          <h3 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Award className={`bg-gradient-to-r ${categoryColors[category]} text-white rounded-full p-2`} size={48} />
            {categoryName[category]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryAchievements.map(achievement => {
              const isUnlocked = achievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-2xl border-4 transition-all ${
                    isUnlocked
                      ? `bg-gradient-to-br ${categoryColors[category]} border-yellow-400 text-white shadow-lg`
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-3xl font-bold mb-1">{achievement.name}</h4>
                      <p className="text-2xl opacity-90">{achievement.desc}</p>
                    </div>
                    {isUnlocked && <Trophy className="text-yellow-300" size={48} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  const renderDailyChallenges = () => {
    const difficultyColors = {
      easy: 'from-green-500 to-emerald-600',
      medium: 'from-orange-500 to-amber-600',
      hard: 'from-red-500 to-rose-600'
    };

    return (
      <div>
        <div className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-300 rounded-2xl p-8">
          <h3 className="text-5xl font-bold text-purple-800 mb-3 flex items-center gap-4">
            <Calendar size={56} />
            {t.todaysChallenges || "Today's Challenges"}
          </h3>
          <p className="text-3xl text-purple-700">{new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-6">
          {dailyChallenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className={`p-8 rounded-2xl border-4 ${
                challenge.completed
                  ? 'bg-green-100 border-green-400'
                  : 'bg-white border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`bg-gradient-to-r ${difficultyColors[challenge.difficulty_level]} text-white rounded-full p-4`}>
                    <Target size={48} />
                  </div>
                  <div>
                    <h4 className="text-4xl font-bold text-gray-800 mb-2">
                      {t.challenge || 'Challenge'} {index + 1}
                    </h4>
                    <p className="text-3xl text-gray-700">{challenge.desc}</p>
                    <p className="text-2xl text-gray-500 mt-2">
                      🎯 {t.target || 'Target'}: {challenge.target}
                    </p>
                  </div>
                </div>
                {challenge.completed && (
                  <div className="bg-green-500 text-white rounded-full p-4">
                    <Star size={56} className="fill-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <p className="text-blue-800 text-center text-3xl">
            💡 {t.challengeHint || 'New challenges appear every day! Come back tomorrow for more!'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-6xl w-full">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <Trophy className="text-yellow-500" size={72} />
            {t.achievements || 'Achievements'}
          </h1>
          <button
            onClick={goHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold"
          >
            <Home size={48} />
            {t.home}
          </button>
        </div>

        {/* Progress Overview */}
        <div className="mb-10 bg-gradient-to-r from-yellow-100 to-amber-100 border-4 border-yellow-400 rounded-2xl p-6">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-700">{achievements.length}/{achievementList.length}</p>
              <p className="text-2xl text-yellow-600">{t.unlocked || 'Unlocked'}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-700">{Math.round((achievements.length / achievementList.length) * 100)}%</p>
              <p className="text-2xl text-yellow-600">{t.progress || 'Progress'}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-700">{stats?.challengesCompleted || 0}</p>
              <p className="text-2xl text-yellow-600">{t.challengesComplete || 'Challenges'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-6 px-8 rounded-2xl text-4xl font-bold transition-all ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Award size={40} className="inline mr-3" />
            {t.achievements || 'Achievements'}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-6 px-8 rounded-2xl text-4xl font-bold transition-all ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Zap size={40} className="inline mr-3" />
            {t.dailyChallenges || 'Daily Challenges'}
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[600px] overflow-y-auto pr-4">
          {activeTab === 'achievements' ? renderAchievements() : renderDailyChallenges()}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
