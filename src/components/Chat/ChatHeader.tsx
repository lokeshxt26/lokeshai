import React, { useState } from 'react';
import { Menu, Plus, Settings, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenApkModal: () => void;
  isMobileMockup: boolean;
  onToggleMobileMockup: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleSidebar,
  onOpenSettings,
  onOpenApkModal,
  isMobileMockup,
  onToggleMobileMockup,
}) => {
  const { createNewChat, settings, updateSettings } = useChat();
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const models = [
    { id: 'pollinations', model: 'free', name: 'AskMe Engine (Fast & Free)' },
    { id: 'gemini', model: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Vision & Speed)' },
    { id: 'gemini', model: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep reasoning)' },
    { id: 'openai', model: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'openai', model: 'gpt-4o', name: 'GPT-4o' },
  ];

  const currentModelLabel = () => {
    if (settings.provider === 'pollinations') return 'AskMe Free';
    if (settings.provider === 'gemini') {
      return settings.geminiModel.includes('flash') ? 'Gemini Flash' : 'Gemini Pro';
    }
    return settings.openaiModel.includes('mini') ? 'GPT-4o Mini' : 'GPT-4o';
  };

  return (
    <header className="h-14 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between select-none z-20">
      {/* Left: Sidebar Menu button & Title */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-bold text-sm tracking-tight text-white flex items-center gap-0.5 mr-1">
          Ask<span className="text-emerald-400">Me</span>
        </span>

        {/* Model Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{currentModelLabel()}</span>
            <span className="text-neutral-500 text-[10px]">▼</span>
          </button>

          {modelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setModelDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl py-1.5 z-40 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Select AI Engine
                </div>
                {models.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      updateSettings({
                        provider: m.id as any,
                        ...(m.id === 'gemini' ? { geminiModel: m.model } : {}),
                        ...(m.id === 'openai' ? { openaiModel: m.model } : {}),
                      });
                      setModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition flex items-center justify-between"
                  >
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-1">
        {/* Android APK Download / Install Button */}
        <button
          onClick={onOpenApkModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium transition shadow-sm"
          title="Download APK / Install on Android"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold">APK</span>
        </button>

        {/* Toggle Mobile Phone Frame Mockup on Desktop screens */}
        <button
          onClick={onToggleMobileMockup}
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 text-xs transition"
          title="Toggle Mobile Screen Preview"
        >
          {isMobileMockup ? (
            <Monitor className="w-4 h-4 text-neutral-400" />
          ) : (
            <Smartphone className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          title="API Keys & Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
