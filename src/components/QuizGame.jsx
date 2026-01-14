import { useState, useEffect } from 'react';
import { HelpCircle, ArrowLeft, Check, X, Trophy, RefreshCw } from 'lucide-react';
import { getEnabledQuizQuestions } from '../firebase';
import soundPlayer from '../utils/sounds';

const QuizGame = ({ goHome, language, translations, playerName }) => {
  const t = translations[language];
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noQuestions, setNoQuestions] = useState(false);
  const [answers, setAnswers] = useState([]); // Track all answers for review

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const enabledQuestions = await getEnabledQuizQuestions();
      if (enabledQuestions.length === 0) {
        setNoQuestions(true);
      } else {
        setQuestions(enabledQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setNoQuestions(true);
    }
    setLoading(false);
  };

  // Normalize answer for flexible comparison
  const normalizeAnswer = (answer) => {
    if (!answer) return '';
    // Remove currency symbols, spaces, and convert to lowercase
    let normalized = answer.toString().toLowerCase().trim();
    // Remove $ and other currency symbols
    normalized = normalized.replace(/[$€£¥]/g, '');
    // Remove commas from numbers
    normalized = normalized.replace(/,/g, '');
    // Trim whitespace again
    normalized = normalized.trim();
    // Try to parse as number for flexible decimal comparison
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      return num.toString();
    }
    return normalized;
  };

  const checkAnswer = () => {
    const currentQuestion = questions[currentIndex];
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(currentQuestion.answer);

    const correct = normalizedUser === normalizedCorrect;
    setIsCorrect(correct);
    setShowResult(true);

    // Track this answer
    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer: userAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect: correct
    }]);

    if (correct) {
      setScore(prev => prev + 1);
      soundPlayer.playCorrect();
    } else {
      soundPlayer.playWrong();
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameComplete(true);
      if (score + (isCorrect ? 0 : 0) >= questions.length * 0.7) {
        soundPlayer.playLevelVictory();
      }
    } else {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setGameComplete(false);
    setAnswers([]);
    loadQuestions();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
      checkAnswer();
    } else if (e.key === 'Enter' && showResult) {
      nextQuestion();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl w-full text-center">
          <div className="animate-spin text-8xl mb-6">🎯</div>
          <p className="text-4xl text-gray-600">{t.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (noQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl w-full text-center">
          <HelpCircle className="mx-auto text-gray-400 mb-6" size={100} />
          <h2 className="text-5xl font-bold text-gray-700 mb-6">{t.noQuizQuestions || 'No Quiz Questions Available'}</h2>
          <p className="text-3xl text-gray-500 mb-8">{t.noQuizQuestionsDesc || 'Please ask an admin to add some questions.'}</p>
          <button
            onClick={goHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-12 py-6 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-4 mx-auto"
          >
            <ArrowLeft size={40} />
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
          <div className="text-center mb-8">
            <Trophy className="mx-auto text-yellow-500 mb-4" size={100} />
            <h2 className="text-6xl font-bold text-gray-800 mb-4">{t.quizComplete || 'Quiz Complete!'}</h2>
            <p className="text-5xl font-bold text-purple-600 mb-2">
              {score} / {questions.length}
            </p>
            <p className="text-3xl text-gray-600">({percentage}%)</p>
          </div>

          {/* Results Review */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-h-96 overflow-y-auto">
            <h3 className="text-3xl font-bold text-gray-700 mb-4">{t.reviewAnswers || 'Review Your Answers'}</h3>
            {answers.map((ans, idx) => (
              <div key={idx} className={`p-4 rounded-xl mb-3 ${ans.isCorrect ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'}`}>
                <p className="text-2xl font-bold text-gray-800 mb-2">Q{idx + 1}: {ans.question}</p>
                <p className="text-xl text-gray-600">
                  {t.yourAnswer || 'Your answer'}: <span className={ans.isCorrect ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{ans.userAnswer || '(no answer)'}</span>
                </p>
                {!ans.isCorrect && (
                  <p className="text-xl text-gray-600">
                    {t.correctAnswer || 'Correct answer'}: <span className="text-green-700 font-bold">{ans.correctAnswer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-6 justify-center">
            <button
              onClick={restartQuiz}
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-4"
            >
              <RefreshCw size={40} />
              {t.playAgain}
            </button>
            <button
              onClick={goHome}
              className="bg-gray-500 hover:bg-gray-600 text-white px-12 py-6 rounded-2xl text-3xl font-bold transition-colors flex items-center gap-4"
            >
              <ArrowLeft size={40} />
              {t.back}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 flex items-center gap-4">
            <HelpCircle className="text-purple-600" size={60} />
            {t.quiz || 'Quiz'}
          </h1>
          <button
            onClick={goHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl text-2xl font-bold transition-colors flex items-center gap-3"
          >
            <ArrowLeft size={32} />
            {t.back}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-2xl text-gray-600 mb-2">
            <span>{t.question || 'Question'} {currentIndex + 1} / {questions.length}</span>
            <span>{t.score || 'Score'}: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-purple-600 h-6 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-purple-50 border-4 border-purple-200 rounded-2xl p-8 mb-8">
          <p className="text-4xl text-gray-800 leading-relaxed">{currentQuestion.question}</p>
        </div>

        {/* Answer Input */}
        {!showResult ? (
          <div className="space-y-6">
            <input
              type="text"
              inputMode="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.typeYourAnswer || 'Type your answer here...'}
              className="w-full p-6 text-4xl rounded-2xl border-4 border-purple-300 focus:border-purple-500 focus:outline-none"
              autoFocus
              autoComplete="off"
            />
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className={`w-full p-8 rounded-2xl text-4xl font-bold transition-all ${
                userAnswer.trim()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t.submitAnswer || 'Submit Answer'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Result Display */}
            <div className={`p-8 rounded-2xl text-center ${isCorrect ? 'bg-green-100 border-4 border-green-400' : 'bg-red-100 border-4 border-red-400'}`}>
              <div className="flex items-center justify-center gap-4 mb-4">
                {isCorrect ? (
                  <Check className="text-green-600" size={60} />
                ) : (
                  <X className="text-red-600" size={60} />
                )}
                <span className={`text-5xl font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? (t.correct || 'Correct!') : (t.incorrect || 'Incorrect')}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-3xl text-gray-700">
                  {t.theAnswerWas || 'The answer was'}: <span className="font-bold text-green-700">{currentQuestion.answer}</span>
                </p>
              )}
            </div>

            <button
              onClick={nextQuestion}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-2xl text-4xl font-bold transition-colors"
            >
              {currentIndex + 1 >= questions.length ? (t.seeResults || 'See Results') : (t.nextQuestion || 'Next Question')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
