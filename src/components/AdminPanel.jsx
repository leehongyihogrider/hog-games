import { useState, useEffect } from 'react';
import { Shield, Trash2, Home, AlertTriangle, Plus, Edit2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Save, X, HelpCircle } from 'lucide-react';
import { clearGameLeaderboard, subscribeToQuizQuestions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion, toggleQuizQuestion, reorderQuizQuestions } from '../firebase';

const AdminPanel = ({ goHome, leaderboard }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [activeTab, setActiveTab] = useState('leaderboards'); // 'leaderboards' or 'quiz'

  // Quiz management state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const ADMIN_PASSWORD = 'admin123'; // Simple password for demo

  // Subscribe to quiz questions
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = subscribeToQuizQuestions((questions) => {
        setQuizQuestions(questions);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

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

  // Quiz management functions
  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setIsSaving(true);
    try {
      const nextOrder = quizQuestions.length + 1;
      await addQuizQuestion(newQuestion.trim(), newAnswer.trim(), nextOrder);
      setNewQuestion('');
      setNewAnswer('');
      setShowAddQuestion(false);
    } catch (err) {
      console.error('Failed to add question:', err);
      alert('Failed to add question. Please try again.');
    }
    setIsSaving(false);
  };

  const handleUpdateQuestion = async (questionId) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    setIsSaving(true);
    try {
      await updateQuizQuestion(questionId, {
        question: editQuestion.trim(),
        answer: editAnswer.trim()
      });
      setEditingQuestion(null);
    } catch (err) {
      console.error('Failed to update question:', err);
      alert('Failed to update question. Please try again.');
    }
    setIsSaving(false);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuizQuestion(questionId);
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert('Failed to delete question. Please try again.');
    }
  };

  const handleToggleQuestion = async (questionId, currentEnabled) => {
    try {
      await toggleQuizQuestion(questionId, !currentEnabled);
    } catch (err) {
      console.error('Failed to toggle question:', err);
      alert('Failed to toggle question. Please try again.');
    }
  };

  const handleMoveQuestion = async (index, direction) => {
    const newQuestions = [...quizQuestions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];

    try {
      await reorderQuizQuestions(newQuestions);
    } catch (err) {
      console.error('Failed to reorder questions:', err);
      alert('Failed to reorder questions. Please try again.');
    }
  };

  const startEditing = (q) => {
    setEditingQuestion(q.id);
    setEditQuestion(q.question);
    setEditAnswer(q.answer);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-8 z-40">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full border-2 border-gray-200">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Shield className="text-red-600" size={64} />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Admin Panel</h1>
            <p className="text-2xl text-gray-600">Enter admin password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full p-6 text-3xl rounded-2xl border-4 border-red-300 mb-6 text-center focus:border-red-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 mb-6 text-center">
              <p className="text-2xl text-red-700 font-bold">{error}</p>
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-6 rounded-2xl text-3xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Login
            </button>
            <button
              onClick={goHome}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-6 rounded-2xl text-3xl font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <Home size={36} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 overflow-y-auto p-8 z-40 flex justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-7xl w-full border-2 border-gray-200 h-fit">
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

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={() => setActiveTab('leaderboards')}
            className={`px-8 py-4 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-3 ${
              activeTab === 'leaderboards'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Trash2 size={32} />
            Leaderboards
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-8 py-4 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-3 ${
              activeTab === 'quiz'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <HelpCircle size={32} />
            Quiz Questions
          </button>
        </div>

        {/* Leaderboards Tab */}
        {activeTab === 'leaderboards' && (
          <>
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
          </>
        )}

        {/* Quiz Questions Tab */}
        {activeTab === 'quiz' && (
          <>
            <div className="mb-10">
              <h2 className="text-5xl font-bold text-gray-800 mb-6">Manage Quiz Questions</h2>
              <p className="text-3xl text-gray-600 mb-8">Add, edit, reorder, and toggle questions for the quiz game</p>
            </div>

            {/* Add New Question Button */}
            {!showAddQuestion ? (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-2xl text-3xl font-bold transition-colors flex items-center justify-center gap-4 mb-8"
              >
                <Plus size={40} />
                Add New Question
              </button>
            ) : (
              <div className="bg-purple-50 rounded-3xl p-8 border-2 border-purple-300 mb-8">
                <h3 className="text-3xl font-bold text-purple-800 mb-6">Add New Question</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-2xl font-bold text-gray-700 mb-2">Question:</label>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter the question..."
                      className="w-full p-4 text-2xl rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none min-h-32"
                    />
                  </div>
                  <div>
                    <label className="block text-2xl font-bold text-gray-700 mb-2">Answer:</label>
                    <input
                      type="text"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Enter the correct answer..."
                      className="w-full p-4 text-2xl rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleAddQuestion}
                      disabled={isSaving || !newQuestion.trim() || !newAnswer.trim()}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-4 rounded-xl text-2xl font-bold transition-colors flex items-center justify-center gap-3"
                    >
                      <Save size={28} />
                      {isSaving ? 'Saving...' : 'Save Question'}
                    </button>
                    <button
                      onClick={() => { setShowAddQuestion(false); setNewQuestion(''); setNewAnswer(''); }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-xl text-2xl font-bold transition-colors flex items-center justify-center gap-3"
                    >
                      <X size={28} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-5">
              {quizQuestions.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 text-center shadow-inner">
                  <HelpCircle className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-3xl text-gray-500">No questions yet. Add your first question above!</p>
                </div>
              ) : (
                quizQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`rounded-3xl p-8 border-2 shadow-sm transition-all hover:shadow-md ${
                      q.enabled
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        : 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 opacity-75'
                    }`}
                  >
                    {editingQuestion === q.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xl font-bold text-gray-700 mb-2">Question:</label>
                          <textarea
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                            className="w-full p-4 text-xl rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none min-h-28"
                          />
                        </div>
                        <div>
                          <label className="block text-xl font-bold text-gray-700 mb-2">Answer:</label>
                          <input
                            type="text"
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                            className="w-full p-4 text-xl rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleUpdateQuestion(q.id)}
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-xl font-bold transition-colors flex items-center gap-2"
                          >
                            <Save size={24} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingQuestion(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl text-xl font-bold transition-colors flex items-center gap-2"
                          >
                            <X size={24} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode - Clean card layout
                      <div className="flex flex-col">
                        {/* Header row with number and status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white w-12 h-12 rounded-full text-xl font-bold flex items-center justify-center shadow-md">
                              {index + 1}
                            </span>
                            {!q.enabled && (
                              <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-lg font-medium">
                                Hidden
                              </span>
                            )}
                          </div>

                          {/* Action buttons - horizontal row */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMoveQuestion(index, 'up')}
                              disabled={index === 0}
                              className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-300 text-slate-600 p-2.5 rounded-xl transition-all"
                              title="Move Up"
                            >
                              <ChevronUp size={22} />
                            </button>
                            <button
                              onClick={() => handleMoveQuestion(index, 'down')}
                              disabled={index === quizQuestions.length - 1}
                              className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-300 text-slate-600 p-2.5 rounded-xl transition-all"
                              title="Move Down"
                            >
                              <ChevronDown size={22} />
                            </button>
                            <div className="w-px h-8 bg-gray-300 mx-1" />
                            <button
                              onClick={() => handleToggleQuestion(q.id, q.enabled)}
                              className={`p-2.5 rounded-xl transition-all ${
                                q.enabled
                                  ? 'bg-green-100 hover:bg-green-200 text-green-600'
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
                              }`}
                              title={q.enabled ? 'Hide from players' : 'Show to players'}
                            >
                              {q.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            </button>
                            <button
                              onClick={() => startEditing(q)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-600 p-2.5 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit2 size={22} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-500 p-2.5 rounded-xl transition-all"
                              title="Delete"
                            >
                              <Trash2 size={22} />
                            </button>
                          </div>
                        </div>

                        {/* Question text */}
                        <p className="text-2xl text-gray-800 mb-3 leading-relaxed">{q.question}</p>

                        {/* Answer with nice styling */}
                        <div className="bg-white/60 rounded-xl px-5 py-3 inline-flex items-center gap-2">
                          <span className="text-xl text-gray-500">Answer:</span>
                          <span className="text-xl font-semibold text-purple-700">{q.answer}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 bg-purple-50 rounded-2xl p-6 border-2 border-purple-300">
              <p className="text-purple-900 text-center text-2xl">
                💡 <strong>Tip:</strong> Toggle questions off to hide them from players without deleting. Use arrows to change the order questions appear.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
