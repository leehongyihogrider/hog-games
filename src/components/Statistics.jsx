import { BarChart3, Trophy, Clock, TrendingUp, Home, Award } from 'lucide-react';

const Statistics = ({ goHome, language, translations, playerName, isGuestMode, playerStats }) => {
  const t = translations[language];

  const stats = playerStats || {
    totalGamesPlayed: 0,
    totalPlayTime: 0,
    favoriteGame: 'None',
    gamesBreakdown: {
      memory: 0,
      whack: 0,
      sequence: 0,
      math: 0,
      wordsearch: 0,
      numbersorting: 0
    },
    personalBests: {
      memory: { score: 0, difficulty: 'easy', date: '-' },
      whack: { score: 0, difficulty: 'easy', date: '-' },
      sequence: { score: 0, difficulty: 'easy', date: '-' },
      math: { score: 0, difficulty: 'easy', date: '-' },
      wordsearch: { score: 0, difficulty: 'easy', date: '-' },
      numbersorting: { score: 0, difficulty: 'easy', date: '-' }
    },
    recentActivity: []
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const gameNames = {
    memory: t.memoryCard,
    whack: t.whackMole,
    sequence: t.colorSequence,
    math: t.mathGame,
    wordsearch: t.wordSearch || 'Word Search',
    numbersorting: t.numberSorting || 'Number Sorting'
  };

  const gameColors = {
    memory: 'bg-teal-700',
    whack: 'bg-amber-700',
    sequence: 'bg-indigo-700',
    math: 'bg-blue-700',
    wordsearch: 'bg-green-700',
    numbersorting: 'bg-purple-700'
  };

  const getMostPlayedGame = () => {
    const games = stats.gamesBreakdown || {};
    if (Object.keys(games).length === 0) return t.noGamesYet || 'None';
    const maxGame = Object.keys(games).reduce((a, b) => (games[a] || 0) > (games[b] || 0) ? a : b);
    return (games[maxGame] || 0) > 0 ? gameNames[maxGame] : t.noGamesYet || 'None';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-7xl w-full">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-7xl font-bold text-gray-800 flex items-center gap-6">
            <BarChart3 className="text-purple-600" size={80} />
            {t.statistics || 'Statistics'}
          </h1>
          <button
            onClick={goHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold"
          >
            <Home size={48} />
            {t.home}
          </button>
        </div>

        {isGuestMode && (
          <div className="mb-10 bg-gradient-to-r from-red-100 to-orange-100 rounded-3xl p-10 border-4 border-red-500 shadow-2xl">
            <h2 className="text-5xl font-bold text-red-700 mb-4 text-center flex items-center justify-center gap-4">
              {t.guestStatsWarning}
            </h2>
            <p className="text-3xl text-red-600 text-center font-semibold">
              {t.guestStatsDesc}
            </p>
          </div>
        )}

        <div className="mb-10 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-3xl p-8 border-2 border-purple-300">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-4">
            <Award className="text-purple-600" size={48} />
            {t.playerStats || `${playerName}'s Stats`}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="bg-blue-50 rounded-3xl p-8 border-2 border-blue-300">
            <div className="flex items-center gap-4 mb-4">
              <Trophy className="text-blue-600" size={56} />
              <h3 className="text-3xl font-bold text-gray-800">{t.totalGames || 'Total Games'}</h3>
            </div>
            <p className="text-6xl font-bold text-blue-600">{stats.totalGamesPlayed || 0}</p>
          </div>

          <div className="bg-green-50 rounded-3xl p-8 border-2 border-green-300">
            <div className="flex items-center gap-4 mb-4">
              <Clock className="text-green-600" size={56} />
              <h3 className="text-3xl font-bold text-gray-800">{t.playTime || 'Play Time'}</h3>
            </div>
            <p className="text-6xl font-bold text-green-600">{formatTime(stats.totalPlayTime || 0)}</p>
          </div>

          <div className="bg-yellow-50 rounded-3xl p-8 border-2 border-yellow-300 col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="text-yellow-600" size={56} />
              <h3 className="text-3xl font-bold text-gray-800">{t.favoriteGame || 'Most Played Game'}</h3>
            </div>
            <p className="text-5xl font-bold text-yellow-600">{getMostPlayedGame()}</p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">{t.gamesPlayed || 'Games Played'}</h2>
          <div className="grid grid-cols-2 gap-6">
            {Object.keys(gameNames).map((game) => (
              <div key={game} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-gray-700">{gameNames[game]}</span>
                  <div className={`${gameColors[game]} text-white px-6 py-3 rounded-xl text-4xl font-bold`}>
                    {(stats.gamesBreakdown || {})[game] || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">{t.personalBests || 'Personal Best Scores'}</h2>
          <div className="space-y-4">
            {Object.keys(gameNames).map((game) => {
              const best = (stats.personalBests || {})[game] || { score: 0, difficulty: 'easy', date: '-' };
              return (
                <div key={game} className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">{gameNames[game]}</h3>
                      <p className="text-2xl text-gray-600">
                        {t.difficulty || 'Difficulty'}: <span className="font-semibold capitalize">{best.difficulty}</span> {best.date !== '-' && `• ${best.date}`}
                      </p>
                    </div>
                    <div className="text-5xl font-bold text-amber-600">
                      {best.score > 0 ? best.score : '-'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {(stats.recentActivity || []).length > 0 && (
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">{t.recentActivity || 'Recent Activity'}</h2>
            <div className="space-y-3">
              {(stats.recentActivity || []).slice(0, 5).map((activity, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-300 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-700">{gameNames[activity.game]}</span>
                    <span className="text-xl text-gray-600">• {activity.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-bold text-purple-600">{activity.score}</span>
                    <span className="text-xl text-gray-500">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(stats.totalGamesPlayed || 0) === 0 && (
          <div className="text-center bg-gray-50 rounded-3xl p-12 border-2 border-gray-300">
            <p className="text-4xl text-gray-600 mb-4">{t.noStatsYet || 'No statistics yet!'}</p>
            <p className="text-3xl text-gray-500">{t.playGamesToSee || 'Play some games to see your stats here.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
