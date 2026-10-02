import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../../types';
import { Bot, User, Copy, Check, Volume2, VolumeX, RotateCcw, Maximize2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface ChatMessageProps {
  message: Message;
  isLastAssistant?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastAssistant }) => {
  const { user } = useAuth();
  const { regenerateResponse, isGenerating } = useChat();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters for pleasant speech
    const cleanText = message.content.replace(/[*_#`~\[\]]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect if Telugu script is present
    const hasTelugu = /[\u0C00-\u0C7F]/.test(cleanText);
    utterance.lang = hasTelugu ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <div
        className={`w-full py-4 px-3 sm:px-6 transition-colors ${
          isUser ? 'bg-transparent' : 'bg-neutral-900/60 border-y border-neutral-800/40'
        }`}
      >
        <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0 pt-0.5">
            {isUser ? (
              user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-neutral-700 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-neutral-300">
                {isUser ? user?.name || 'You' : 'AskMe'}
              </span>
              <span className="text-[10px] text-neutral-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {message.modelUsed && !isUser && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                  {message.modelUsed}
                </span>
              )}
            </div>

            {/* If user attached an image, render preview thumbnail */}
            {message.image && (
              <div className="mb-2 relative inline-block group">
                <img
                  src={message.image}
                  alt="Uploaded doubt"
                  onClick={() => setPreviewImage(message.image || null)}
                  className="max-h-48 max-w-xs rounded-xl border border-neutral-700 object-contain bg-neutral-950 cursor-pointer shadow-md group-hover:opacity-90 transition"
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(message.image || null)}
                  className="absolute bottom-2 right-2 p-1 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
                  title="View full image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Body */}
            <div className="text-sm text-neutral-100 leading-relaxed overflow-hidden break-words">
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : message.content === '' && message.isStreaming ? (
                <div className="flex items-center gap-1.5 py-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-neutral-200 prose-p:my-2 prose-headings:my-3 prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeContent = String(children).replace(/\n$/, '');
                        const isInline = !match && !codeContent.includes('\n');

                        if (isInline) {
                          return (
                            <code className="bg-neutral-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                              {children}
                            </code>
                          );
                        }

                        return (
                          <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 my-3 shadow-md">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400 font-mono">
                              <span>{match ? match[1] : 'code'}</span>
                              <button
                                onClick={() => handleCopy(codeContent)}
                                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition px-2 py-0.5 rounded hover:bg-neutral-800"
                              >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <div className="p-3 overflow-x-auto text-xs font-mono text-neutral-200">
                              <code>{children}</code>
                            </div>
                          </div>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Action buttons (Assistant only) */}
            {!isUser && message.content && !message.isStreaming && (
              <div className="flex items-center gap-2 mt-3 pt-2 text-neutral-400 text-xs border-t border-neutral-800/30">
                <button
                  onClick={() => handleCopy(message.content)}
                  title="Copy response"
                  className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSpeech}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud in Telugu / English'}
                  className={`p-1.5 rounded-lg hover:bg-neutral-800 transition flex items-center gap-1 ${
                    isSpeaking ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-neutral-200'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{isSpeaking ? 'Stop' : 'Voice Listen'}</span>
                </button>

                {isLastAssistant && !isGenerating && (
                  <button
                    onClick={() => regenerateResponse(message.id)}
                    title="Regenerate response"
                    className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Retry</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-rose-400"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Zoomed doubt"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border border-neutral-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
