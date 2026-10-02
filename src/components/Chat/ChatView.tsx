import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSuggestions } from './ChatSuggestions';
import { SidebarDrawer } from '../Sidebar/SidebarDrawer';
import { SettingsModal } from '../Settings/SettingsModal';
import { ApkDownloadModal } from '../Apk/ApkDownloadModal';
import { ArrowDown, AlertCircle } from 'lucide-react';

interface ChatViewProps {
  isMobileMockup: boolean;
  onToggleMobileMockup: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  isMobileMockup,
  onToggleMobileMockup,
}) => {
  const { currentSession, activeError, clearError } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apkModalOpen, setApkModalOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const messages = currentSession?.messages || [];

  // Capture PWA install prompt on Android
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Scroll to bottom whenever messages update
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(messages.length <= 2 ? 'auto' : 'smooth');
  }, [messages.length, messages[messages.length - 1]?.content]);

  // Track scroll position to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Header */}
      <ChatHeader
        onToggleSidebar={() => setSidebarOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenApkModal={() => setApkModalOpen(true)}
        isMobileMockup={isMobileMockup}
        onToggleMobileMockup={onToggleMobileMockup}
      />

      {/* Main Message Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative"
      >
        {/* Error notification banner if any */}
        {activeError && (
          <div className="sticky top-2 z-10 mx-4 my-2 p-3 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-center justify-between text-xs text-rose-200 backdrop-blur-md shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{activeError}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="px-2 py-1 bg-rose-800/60 hover:bg-rose-700 rounded-lg text-[11px] font-medium transition"
              >
                Settings
              </button>
              <button
                onClick={clearError}
                className="text-neutral-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <ChatSuggestions />
        ) : (
          <div className="py-2 space-y-1">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastAssistant={index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}

        {/* Scroll to bottom floating button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="fixed bottom-24 right-6 p-2.5 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-white shadow-xl border border-neutral-700 transition animate-fade-in z-20"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input Bar */}
      <ChatInput />

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenApkModal={() => setApkModalOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Android APK / App Download Modal */}
      <ApkDownloadModal
        isOpen={apkModalOpen}
        onClose={() => setApkModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </div>
  );
};
