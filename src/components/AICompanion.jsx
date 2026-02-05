import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Volume2, VolumeX, X, Send, Mic, MicOff } from 'lucide-react';
import ttsPlayer from '../utils/tts';

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

  // Initialize TTS with current language
  useEffect(() => {
    ttsPlayer.init(language);
    ttsPlayer.setLanguage(language);
  }, [language]);

  // Handle external triggers (from games) with debounce
  useEffect(() => {
    if (onTrigger && !isLoading) {
      console.log('AICompanion: Received trigger:', onTrigger);
      handleAIResponse(onTrigger);
    }
  }, [onTrigger]);

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
    const fallbacks = [
      "You doing great lah!",
      "Steady, keep going!",
      "Wah, not bad!",
      "Jia you ah!"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  // Handle AI response (for external triggers)
  const handleAIResponse = async (prompt) => {
    setIsLoading(true);
    const response = await callAI(prompt);
    setLastMessage(response);
    setShowBubble(true);

    // Speak the response
    if (ttsEnabled) {
      setIsSpeaking(true);
      await ttsPlayer.speak(response);
      setIsSpeaking(false);
    }

    // Hide bubble after 5 seconds
    setTimeout(() => setShowBubble(false), 5000);
    setIsLoading(false);
  };

  // Send message from chat
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await callAI(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLastMessage(response);

    if (ttsEnabled) {
      setIsSpeaking(true);
      await ttsPlayer.speak(response);
      setIsSpeaking(false);
    }

    setIsLoading(false);
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

    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
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

  // Speak last message again
  const repeatLastMessage = async () => {
    if (lastMessage && ttsEnabled) {
      setIsSpeaking(true);
      await ttsPlayer.speak(lastMessage);
      setIsSpeaking(false);
    }
  };

  // Greeting messages based on context
  const getGreeting = useCallback(() => {
    const greetings = {
      en: `Hi ${playerName}! Ready to exercise your brain?`,
      zh: `${playerName}你好! 准备好锻炼大脑了吗?`
    };
    return greetings[language] || greetings.en;
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
          <span className="text-5xl">🤖</span>
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
          <span className="text-5xl">🤖</span>
          <div>
            <h3 className="text-white font-bold text-2xl">AI Companion</h3>
            <p className="text-purple-100 text-lg">
              {language === 'zh' ? '我在这里帮助你' : "I'm here to help!"}
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
            onClick={() => setIsOpen(false)}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>

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
            placeholder={language === 'zh' ? '输入信息...' : 'Type a message...'}
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
