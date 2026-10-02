import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square, X, Image as ImageIcon, Sparkles, Globe } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ChatInput: React.FC = () => {
  const { sendMessage, isGenerating } = useChat();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'te-IN' | 'en-IN'>('te-IN');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 130)}px`;
    }
  }, [input]);

  // Setup Speech Recognition
  const initSpeech = (lang: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

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

    return recognition;
  };

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari on your Android phone or PC.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = initSpeech(voiceLang);
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be chosen again if needed
    e.target.value = '';
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || isGenerating) return;

    sendMessage(input.trim(), selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
    setImageName('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-800/60 p-2.5 sm:p-4 select-none">
      <div className="max-w-3xl mx-auto">
        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="mb-2 p-2 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={selectedImage}
                alt="Selected doubt"
                className="w-12 h-12 rounded-xl object-cover border border-neutral-700 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Image Attached (Ask your doubt!)
                </span>
                <p className="text-[11px] text-neutral-400 truncate">{imageName || 'Selected photo'}</p>
              </div>
            </div>
            <button
              onClick={removeImage}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Controls Bar */}
        <div className="relative flex items-end bg-neutral-900 border border-neutral-700/80 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/30 rounded-2xl p-1.5 transition-all shadow-lg">
          
          {/* Hidden File Input for Images */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Add Image / Camera Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image or photo to solve doubts"
            className="p-2.5 rounded-xl text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition flex items-center justify-center"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : `Voice input (${voiceLang === 'te-IN' ? 'Telugu' : 'English'})`}
            className={`p-2.5 rounded-xl transition ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Voice Language Switcher */}
          <button
            type="button"
            onClick={() => setVoiceLang((prev) => (prev === 'te-IN' ? 'en-IN' : 'te-IN'))}
            title="Toggle Voice input language: Telugu / English"
            className="px-1.5 py-1 my-auto text-[10px] font-semibold text-neutral-400 hover:text-emerald-300 bg-neutral-800/80 rounded-lg transition border border-neutral-700/50 flex items-center gap-0.5"
          >
            <Globe className="w-2.5 h-2.5" />
            <span>{voiceLang === 'te-IN' ? 'తెలుగు' : 'Eng'}</span>
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? `Listening (${voiceLang === 'te-IN' ? 'మాట్లాడండి...' : 'Speak now...'})`
                : selectedImage
                ? 'Ee image lo unna doubt adagandi (Ask your question)...'
                : 'Ask in Telugu, Manglish ("nuvu ella vunav"), or English...'
            }
            className="flex-1 max-h-32 py-2 px-2.5 bg-transparent text-white text-sm placeholder-neutral-500 resize-none focus:outline-none"
          />

          {/* Clear text button */}
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
            disabled={(!input.trim() && !selectedImage) && !isGenerating}
            className={`p-2.5 rounded-xl transition-all ${
              isGenerating
                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                : input.trim() || selectedImage
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
          AskMe can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
};
