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