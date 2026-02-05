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

  // Handle external triggers (from games)
  useEffect(() => {
    if (onTrigger) {
      handleAIResponse(onTrigger);
    }
  }, [onTrigger]);

  // Call the AI API
  const callAI = async (userMessage, context = {}) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
            ...context
          }
        })
      });

      const data = await response.json();
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

  // If minimized mode, just show floating bubble
  if (minimized) {
    return (
      <>
        {/* Floating speech bubble */}
        {showBubble && lastMessage && (
          <div className="fixed bottom-24 right-6 z-50 max-w-xs animate-bounce-in">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200">
              <p className="text-lg text-gray-700">{lastMessage}</p>
              {ttsEnabled && (
                <button
                  onClick={repeatLastMessage}
                  className="mt-2 text-purple-500 hover:text-purple-700"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-purple-200 transform rotate-45" />
          </div>
        )}

        {/* Companion avatar button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <span className="text-3xl">🤖</span>
        </button>
      </>
    );
  }

  // Full chat interface
  if (!showChat && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="text-white font-bold text-lg">AI Companion</h3>
            <p className="text-purple-100 text-sm">
              {language === 'zh' ? '我在这里帮助你' : "I'm here to help!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTTS}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {ttsEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-purple-500 text-white rounded-br-none'
                  : 'bg-white text-gray-700 rounded-bl-none shadow border border-gray-100'
              }`}
            >
              <p className="text-lg">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow border border-gray-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <button
            onClick={toggleVoiceInput}
            className={`p-3 rounded-xl transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={language === 'zh' ? '输入信息...' : 'Type a message...'}
            className="flex-1 p-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
