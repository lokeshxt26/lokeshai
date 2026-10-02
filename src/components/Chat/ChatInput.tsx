import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ChatInput: React.FC = () => {
  const { sendMessage, isGenerating } = useChat();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [input]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop: Enter sends, Shift+Enter for new line.
    // On mobile screens, user can press the send button or enter.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-800/60 p-2.5 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Input box container */}
        <div className="relative flex items-end bg-neutral-900 border border-neutral-700/80 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/30 rounded-2xl p-1.5 transition-all shadow-lg">
          
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Voice input'}
            className={`p-2.5 rounded-xl transition ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening... Speak now' : 'Ask anything in Telugu, English, or any language...'}
            className="flex-1 max-h-36 py-2 px-2 bg-transparent text-white text-sm placeholder-neutral-500 resize-none focus:outline-none"
          />

          {/* Clear text button if input exists */}
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="p-2 text-neutral-500 hover:text-neutral-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Send / Stop Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() && !isGenerating}
            className={`p-2.5 rounded-xl transition-all ${
              isGenerating
                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                : input.trim()
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <Square className="w-4 h-4 fill-current animate-pulse text-amber-400" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-[11px] text-center text-neutral-500 mt-2 select-none">
          AskMe can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};
