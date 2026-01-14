import { useState } from 'react';
import { Shield, Trash2, Home, AlertTriangle } from 'lucide-react';
import { clearGameLeaderboard } from '../firebase';

const AdminPanel = ({ goHome, leaderboard }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const ADMIN_PASSWORD = 'admin123'; // Simple password for demo

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect Password');
      setPassword('');
    }
  };

  const clearLeaderboard = async (game) => {
    setIsClearing(true);
    try {
      await clearGameLeaderboard(game);
      setShowConfirm(null);
      alert(`${gameNames[game] || game} leaderboard cleared!`);
    } catch (err) {
      console.error('Failed to clear leaderboard:', err);
      alert('Failed to clear leaderboard. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const clearAllLeaderboards = async () => {
    setIsClearing(true);
    try {
      const games = ['memory', 'whack', 'sequence', 'math', 'wordsearch', 'numbersorting'];
      await Promise.all(games.map(game => clearGameLeaderboard(game)));
      setShowConfirm(null);
      alert('All leaderboards cleared!');
    } catch (err) {
      console.error('Failed to clear all leaderboards:', err);
      alert('Failed to clear leaderboards. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const gameNames = {
    memory: 'Memory Cards',
    whack: 'Whack-a-Mole',
    sequence: 'Color Sequence',
    math: 'Math Challenge',
    wordsearch: 'Word Search',
    numbersorting: 'Number Sorting'
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-4xl w-full border-2 border-gray-200">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6 mb-6">
              <Shield className="text-red-600" size={80} />
            </div>
            <h1 className="text-7xl font-bold text-gray-800 mb-6">Admin Panel</h1>
            <p className="text-3xl text-gray-600">Enter admin password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full p-8 text-4xl rounded-2xl border-4 border-red-300 mb-6 text-center focus:border-red-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 mb-6 text-center">
              <p className="text-3xl text-red-700 font-bold">{error}</p>
            </div>
          )}
          <div className="flex gap-6">
            <button
              onClick={handleLogin}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-8 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Login
            </button>
            <button
              onClick={goHome}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-8 rounded-2xl text-4xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-4"
            >
              <Home size={48} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-7xl w-full border-2 border-gray-200">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-7xl font-bold text-gray-800 flex items-center gap-6">
            <Shield className="text-red-600" size={80} />
            Admin Panel
          </h1>
          <button
            onClick={goHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl flex items-center gap-4 transition-colors text-3xl font-bold"
          >
            <Home size={48} />
            Home
          </button>
        </div>

        <div className="mb-10">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">Manage Leaderboards</h2>
          <p className="text-3xl text-gray-600 mb-8">Clear individual game leaderboards or all at once (Firebase)</p>
        </div>

        <div className="space-y-6">
          {Object.keys(gameNames).map((game) => (
            <div key={game} className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-4xl font-bold text-gray-800">{gameNames[game]}</h3>
                  <p className="text-2xl text-gray-600 mt-2">
                    {(leaderboard[game] || []).length} {(leaderboard[game] || []).length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                {showConfirm === game ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => clearLeaderboard(game)}
                      disabled={isClearing}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-8 py-5 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-3"
                    >
                      <AlertTriangle size={36} />
                      {isClearing ? 'Clearing...' : 'Confirm Clear'}
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      disabled={isClearing}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-5 rounded-2xl text-3xl font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(game)}
                    disabled={(leaderboard[game] || []).length === 0}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-10 py-6 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-4"
                  >
                    <Trash2 size={40} />
                    Clear Leaderboard
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-red-50 rounded-3xl p-8 border-2 border-red-300">
          <h3 className="text-4xl font-bold text-red-800 mb-4">Danger Zone</h3>
          <p className="text-2xl text-red-700 mb-6">Clear all leaderboards at once. This action cannot be undone!</p>
          {showConfirm === 'all' ? (
            <div className="flex gap-4">
              <button
                onClick={clearAllLeaderboards}
                disabled={isClearing}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-10 py-6 rounded-2xl text-4xl font-bold transition-colors flex items-center gap-4"
              >
                <AlertTriangle size={48} />
                {isClearing ? 'Clearing...' : 'Confirm Clear All'}
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                disabled={isClearing}
                className="bg-gray-500 hover:bg-gray-600 text-white px-10 py-6 rounded-2xl text-4xl font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm('all')}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 rounded-2xl text-4xl font-bold transition-colors flex items-center gap-4"
            >
              <Trash2 size={48} />
              Clear All Leaderboards
            </button>
          )}
        </div>

        <div className="mt-10 bg-blue-50 rounded-2xl p-6 border-2 border-blue-300">
          <p className="text-blue-900 text-center text-2xl">
            💡 <strong>Tip:</strong> Clearing leaderboards will permanently delete all scores from Firebase. Make sure this is what you want!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
