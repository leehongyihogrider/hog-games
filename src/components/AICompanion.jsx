import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Volume2, VolumeX, X, Send, Mic, MicOff, Settings } from 'lucide-react';
import ttsPlayer from '../utils/tts';
import soundPlayer from '../utils/sounds';

const AICompanion = ({
  playerName = 'friend',
  currentGame = null,
  gameState = 'idle',
  score = null,
  language = 'en',
  onTrigger = null, // External trigger for AI to speak
  minimized = false,
  showChat = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [mood, setMood] = useState('idle'); // idle, thinking, speaking, celebrating, comforting
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [hasOfferedHelp, setHasOfferedHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsVolume, setTtsVolume] = useState(() => ttsPlayer.getVolume());
  const [soundVolume, setSoundVolume] = useState(() => soundPlayer.getVolume());
  const [sessionStartTime] = useState(Date.now());
  const [lastBreakReminder, setLastBreakReminder] = useState(Date.now());

  // Determine emoji and animation based on current mood/state
  const getEmojiAndAnimation = () => {
    if (isLoading) {
      return { emoji: '🤔', animation: 'ai-thinking' };
    }
    if (isSpeaking) {
      return { emoji: '😊', animation: 'ai-wave' };
    }
    if (mood === 'celebrating') {
      return { emoji: '🎉', animation: 'ai-happy-bounce' };
    }
    if (mood === 'comforting') {
      return { emoji: '🤗', animation: 'ai-wiggle' };
    }
    // Default idle state
    return { emoji: '😊', animation: 'ai-idle-float' };
  };

  // Check if message is celebratory or comforting
  const detectMood = (message) => {
    const celebrationWords = ['well done', 'amazing', 'great', 'fantastic', 'excellent', 'congratulations', 'perfect', 'nice one', 'good job', 'completed', 'finished', 'won', 'winner', 'proud', 'brilliant'];
    const comfortWords = ['okay', 'no worries', 'try again', 'no rush', 'take your time', 'it\'s alright', 'don\'t worry', 'next time', 'keep going', 'no problem', 'happens'];

    const lowerMessage = message.toLowerCase();

    if (celebrationWords.some(word => lowerMessage.includes(word))) {
      return 'celebrating';
    }
    if (comfortWords.some(word => lowerMessage.includes(word))) {
      return 'comforting';
    }
    return 'idle';
  };

  // Initialize TTS with current language
  useEffect(() => {
    ttsPlayer.init(language);
    ttsPlayer.setLanguage(language);
  }, [language]);

  // Handle external triggers (from games) with debounce
  useEffect(() => {
    if (onTrigger && !isLoading) {
      console.log('AICompanion: Received trigger:', onTrigger);
      // Reset activity timer and help flag when there's new activity
      setLastActivityTime(Date.now());
      setHasOfferedHelp(false);
      handleAIResponse(onTrigger);
    }
  }, [onTrigger]);

  // Idle detection - offer help if no activity for 45 seconds during a game
  useEffect(() => {
    // Only run idle detection when in a game (not menu) and not already loading
    if (!currentGame || currentGame === 'menu' || isLoading || hasOfferedHelp) {
      return;
    }

    const idleCheckInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityTime;
      const IDLE_THRESHOLD = 45000; // 45 seconds

      if (idleTime >= IDLE_THRESHOLD && !hasOfferedHelp) {
        setHasOfferedHelp(true);
        const isChineseMode = language === 'zh' || language === 'yue';
        const idlePrompt = isChineseMode
          ? `玩家${playerName}在玩${currentGame}时已经有一段时间没有动作了。轻轻地问问他们是否需要帮助，或者是否想休息一下。要温柔、简短。`
          : `Player ${playerName} has been idle for a while playing ${currentGame}. Gently ask if they need help or want to take a break. Be warm and brief.`;
        handleAIResponse(idlePrompt);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(idleCheckInterval);
  }, [currentGame, lastActivityTime, hasOfferedHelp, isLoading, language, playerName]);

  // Reset idle state when game changes
  useEffect(() => {
    setLastActivityTime(Date.now());
    setHasOfferedHelp(false);
  }, [currentGame]);

  // Break reminder - suggest rest after 15 minutes of continuous play
  useEffect(() => {
    const BREAK_INTERVAL = 15 * 60 * 1000; // 15 minutes

    const breakCheckInterval = setInterval(() => {
      const timeSinceLastBreak = Date.now() - lastBreakReminder;
      const totalSessionTime = Date.now() - sessionStartTime;

      // Only remind if playing for more than 15 minutes since last reminder
      if (timeSinceLastBreak >= BREAK_INTERVAL && totalSessionTime >= BREAK_INTERVAL && !isLoading) {
        setLastBreakReminder(Date.now());
        const isChineseMode = language === 'zh' || language === 'yue';
        const breakPrompt = isChineseMode
          ? `玩家${playerName}已经玩了一段时间了。温柔地建议他们休息一下，喝点水，活动活动眼睛。要简短、关心。`
          : `Player ${playerName} has been playing for a while now. Gently suggest they take a short break, drink some water, or rest their eyes. Be caring and brief.`;
        handleAIResponse(breakPrompt);
      }
    }, 60000); // Check every minute

    return () => clearInterval(breakCheckInterval);
  }, [lastBreakReminder, sessionStartTime, isLoading, language, playerName]);

  // Call the AI API with timeout
  const callAI = async (userMessage, context = {}) => {
    const requestBody = {
      messages: [
        ...messages.slice(-6).map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: userMessage }
      ],
      context: {
        game: currentGame,
        playerName,
        state: gameState,
        score,
        language,
        trigger: userMessage, // Include trigger in context as fallback
        ...context
      }
    };

    console.log('AICompanion: Calling API with:', JSON.stringify(requestBody, null, 2));

    try {
      // Add 15 second timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('AICompanion: API response:', data);
      return data.message || data.fallback || "Steady lah!";
    } catch (error) {
      console.error('AI API error:', error);
      return getLocalFallback();
    }
  };

  // Local fallback if API fails
  const getLocalFallback = () => {
    const isChineseMode = language === 'zh' || language === 'yue';
    const fallbacksEn = [
      "You doing great lah!",
      "Steady, keep going!",
      "Wah, not bad!",
      "Jia you ah!"
    ];
    const fallbacksZh = [
      "做得很好！",
      "继续加油！",
      "不错哦！",
      "加油！"
    ];
    const fallbacks = isChineseMode ? fallbacksZh : fallbacksEn;
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  // Handle AI response (for external triggers)
  const handleAIResponse = async (prompt) => {
    setIsLoading(true);
    setMood('thinking');
    const response = await callAI(prompt);

    // Show text immediately once API responds
    setIsLoading(false);
    setLastMessage(response);
    setShowBubble(true);

    // Set mood based on response content
    const detectedMood = detectMood(response);
    setMood(detectedMood);

    // Speak the response (text is already visible)
    if (ttsEnabled) {
      setIsSpeaking(true);
      await ttsPlayer.speak(response);
      setIsSpeaking(false);
    }

    // Hide bubble after 10 seconds and reset mood
    setTimeout(() => {
      setShowBubble(false);
      setMood('idle');
    }, 10000);
  };

  // Send message from chat
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setMood('thinking');

    const response = await callAI(userMessage);

    // Show text immediately once API responds
    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLastMessage(response);

    // Set mood based on response
    const detectedMood = detectMood(response);
    setMood(detectedMood);

    if (ttsEnabled) {
      setIsSpeaking(true);
      await ttsPlayer.speak(response);
      setIsSpeaking(false);
    }

    // Reset mood after a delay
    setTimeout(() => setMood('idle'), 5000);
  };

  // Voice input using Web Speech API
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Map language to speech recognition locale
    const langMap = { 'zh': 'zh-CN', 'yue': 'zh-HK', 'en': 'en-US' };
    recognition.lang = langMap[language] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.start();
  };

  // Toggle TTS
  const toggleTTS = () => {
    const newState = ttsPlayer.toggle();
    setTtsEnabled(newState);
  };

  // Handle TTS volume change
  const handleTtsVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setTtsVolume(volume);
    ttsPlayer.setVolume(volume);
  };

  // Handle game sound volume change
  const handleSoundVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setSoundVolume(volume);
    soundPlayer.setVolume(volume);
  };

  // Speak last message again
  const repeatLastMessage = async () => {
    if (lastMessage && ttsEnabled) {
      setIsSpeaking(true);
      await ttsPlayer.speak(lastMessage);
      setIsSpeaking(false);
    }
  };

  // Greeting messages based on context
  // Cantonese ('yue') uses same written Chinese as Mandarin ('zh'), just spoken differently
  const getGreeting = useCallback(() => {
    const effectiveLang = language === 'yue' ? 'zh' : language;
    const greetings = {
      en: `Hi ${playerName}! Ready to exercise your brain?`,
      zh: `${playerName}你好! 准备好锻炼大脑了吗?`
    };
    return greetings[effectiveLang] || greetings.en;
  }, [playerName, language]);

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getGreeting();
      setMessages([{ role: 'assistant', content: greeting }]);
      if (ttsEnabled) {
        ttsPlayer.speak(greeting);
      }
    }
  }, [isOpen, getGreeting, ttsEnabled, messages.length]);

  // If minimized mode and chat is NOT open, just show floating bubble
  if (minimized && !isOpen) {
    return (
      <>
        {/* Loading/thinking bubble */}
        {isLoading && (
          <div className="fixed bottom-32 right-6 z-50 max-w-sm animate-bounce-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <span className="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xl text-gray-500">Thinking...</span>
              </div>
            </div>
            <div className="absolute -bottom-3 right-12 w-6 h-6 bg-white border-r-4 border-b-4 border-purple-300 transform rotate-45" />
          </div>
        )}

        {/* Floating speech bubble - BIGGER */}
        {!isLoading && showBubble && lastMessage && (
          <div className="fixed bottom-32 right-6 z-50 max-w-sm animate-bounce-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
              <p className="text-2xl text-gray-700 leading-relaxed">{lastMessage}</p>
              {ttsEnabled && (
                <button
                  onClick={repeatLastMessage}
                  className="mt-3 text-purple-500 hover:text-purple-700 p-2"
                >
                  <Volume2 className="w-7 h-7" />
                </button>
              )}
            </div>
            <div className="absolute -bottom-3 right-12 w-6 h-6 bg-white border-r-4 border-b-4 border-purple-300 transform rotate-45" />
          </div>
        )}

        {/* Companion avatar button - BIGGER */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white"
        >
          <span className={`text-5xl ${getEmojiAndAnimation().animation}`}>
            {getEmojiAndAnimation().emoji}
          </span>
        </button>
      </>
    );
  }

  // Full chat interface - show button only if not open
  if (!showChat && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white"
      >
        <MessageCircle className="w-12 h-12 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 sm:w-[28rem] bg-white rounded-3xl shadow-2xl border-4 border-purple-300 overflow-hidden">
      {/* Header - BIGGER */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={`text-5xl ${getEmojiAndAnimation().animation}`}>
            {getEmojiAndAnimation().emoji}
          </span>
          <div>
            <h3 className="text-white font-bold text-2xl">AI Companion</h3>
            <p className="text-purple-100 text-lg">
              {['zh', 'yue'].includes(language) ? '我在这里帮助你' : "I'm here to help!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTTS}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {ttsEnabled ? (
              <Volume2 className="w-7 h-7 text-white" />
            ) : (
              <VolumeX className="w-7 h-7 text-white" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-full transition-colors ${showSettings ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <Settings className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-purple-50 p-5 border-b-2 border-purple-200">
          <h4 className="text-xl font-bold text-purple-800 mb-4">
            {['zh', 'yue'].includes(language) ? '音量设置' : 'Volume Settings'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-lg text-gray-700 mb-2">
                <span>{['zh', 'yue'].includes(language) ? '语音音量' : 'Voice Volume'}</span>
                <span className="text-purple-600 font-bold">{Math.round(ttsVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={ttsVolume}
                onChange={handleTtsVolumeChange}
                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-lg text-gray-700 mb-2">
                <span>{['zh', 'yue'].includes(language) ? '游戏音效' : 'Game Sounds'}</span>
                <span className="text-purple-600 font-bold">{Math.round(soundVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={soundVolume}
                onChange={handleSoundVolumeChange}
                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages - BIGGER */}
      <div className="h-80 overflow-y-auto p-5 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-purple-500 text-white rounded-br-none'
                  : 'bg-white text-gray-700 rounded-bl-none shadow-lg border-2 border-gray-100'
              }`}
            >
              <p className="text-xl leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-lg border-2 border-gray-100">
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input - BIGGER */}
      <div className="p-5 border-t-2 border-gray-200 bg-white">
        <div className="flex gap-3">
          <button
            onClick={toggleVoiceInput}
            className={`p-4 rounded-xl transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={['zh', 'yue'].includes(language) ? '输入信息...' : 'Type a message...'}
            className="flex-1 p-4 text-xl border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
