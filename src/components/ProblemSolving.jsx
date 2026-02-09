import { useState, useRef } from 'react';
import { Zap, Trophy, Star, Home, RotateCcw, PlayCircle, X } from 'lucide-react';
import soundPlayer from '../utils/sounds';

const NumberSorting = ({ goHome, language, translations, addToLeaderboard, leaderboard, playerName }) => {
  const t = translations[language];

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-6xl font-bold text-gray-800 flex items-center gap-6">
            <ArrowUpDown className="text-teal-600" size={64} />
            {currentDiff.name}
          </h1>
          <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl transition-colors text-3xl font-bold">{t.levels}</button>
        </div>

        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
            <p className="text-4xl font-bold text-purple-700">
              {sortOrder === 'ascending' ? '📈 ' + (t.sortAscending || 'Sort: Smallest to Largest') : '📉 ' + (t.sortDescending || 'Sort: Largest to Smallest')}
            </p>
          </div>

          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-3xl text-gray-600">{t.time || 'Time'}</p>
              <p className="text-6xl font-bold text-blue-600">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-gray-600">{t.selected || 'Selected'}</p>
              <p className="text-6xl font-bold text-green-600">{selectedNumbers.length}/{numbers.length}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-gray-600">{t.mistakes || 'Mistakes'}</p>
              <p className="text-6xl font-bold text-red-600">{mistakes}</p>
            </div>
          </div>
        </div>

        {gameOver && !showLeaderboard && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 rounded-2xl p-8 mb-8 text-center victory-entrance shadow-2xl">
            <div className="trophy-bounce inline-block mb-4">
              <Trophy size={80} className="text-yellow-500" />
            </div>
            <h2 className="text-5xl font-bold text-green-700 mb-4">🎉 {t.youWon || 'You Won!'} 🎉</h2>
            <div className="bg-white rounded-xl p-6 mb-4">
              <p className="text-3xl text-gray-700 mb-2 font-semibold">{t.completedIn || 'Completed in'}:</p>
              <p className="text-6xl font-bold text-blue-600 mb-4">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-2xl text-gray-600">{t.mistakes || 'Mistakes'}: <span className="font-bold text-red-600">{mistakes}</span></p>
              {mistakes > 0 && (
                <p className="text-xl text-gray-500 mt-2">({t.penalty || 'Penalty'}: +{mistakes * 5}s)</p>
              )}
              <p className="text-2xl text-gray-600 mt-4">{t.fasterIsBetter || 'Faster time is better!'}</p>
            </div>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={64} className={i < getStarRating() ? 'fill-yellow-400 text-yellow-400 star-sparkle' : 'text-gray-300'} />
              ))}
            </div>
            <div className="flex gap-6 justify-center mt-6">
              <button onClick={() => { soundPlayer.playClick(); startGame(difficulty); }} className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 rounded-2xl transition-all transform hover:scale-105 font-bold flex items-center gap-3 text-3xl shadow-lg">
                <RotateCcw size={40} />
                {t.retryLevel || 'Retry Level'}
              </button>
              <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl transition-all transform hover:scale-105 font-bold text-3xl shadow-lg pulse-glow">{t.tryAnother || 'Try Another'}</button>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 mb-8 shadow-lg">
            <h3 className="text-4xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
              <Trophy className="text-amber-500" size={48} />
              {t.leaderboard}
            </h3>
            {leaderboard && leaderboard.length > 0 ? (
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
                      <div className="text-right">
                        <div className="font-bold text-blue-600 text-2xl">
                          {entry.time ? `${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}` : ''}
                        </div>
                      </div>
                      <span className="text-lg text-gray-500 bg-gray-100 px-4 py-2 rounded-lg uppercase font-semibold">{entry.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-2xl">{t.noScores}</p>
            )}
            <button onClick={() => { soundPlayer.playClick(); backToLevelSelect(); }} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl transition-all font-bold text-3xl pulse-glow shadow-lg">{t.tryAnother}</button>
          </div>
        )}

        {!gameOver && (
          <div>
            <div className="grid grid-cols-5 gap-6 mb-8">
              {numbers.map((number) => {
                const position = getNumberPosition(number);
                return (
                  <button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    disabled={isNumberSelected(number)}
                    className={`aspect-square rounded-3xl text-5xl font-bold transition-all transform shadow-xl flex items-center justify-center relative
                      ${isNumberSelected(number)
                        ? 'bg-green-500 text-white scale-95 cursor-not-allowed'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:scale-110 hover:shadow-2xl cursor-pointer'
                      }`}
                  >
                    {number}
                    {position && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold">
                        {position}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 text-center">
              <p className="text-3xl text-gray-700">{t.tapInOrder || 'Tap numbers in the correct order!'}</p>
              <p className="text-2xl text-gray-500 mt-2">{t.mistakesReset || 'Wrong tap resets your selection'}</p>
            </div>
          </div>
        )}
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