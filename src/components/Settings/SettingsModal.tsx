import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import type { AIProvider } from '../../types';
import { X, Key, Cpu, Sliders, Check, ExternalLink, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useChat();

  const [provider, setProvider] = useState<AIProvider>(settings.provider);
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(settings.geminiModel || 'gemini-1.5-flash');
  const [openaiModel, setOpenaiModel] = useState(settings.openaiModel || 'gpt-4o-mini');
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt || '');
  const [temperature, setTemperature] = useState(settings.temperature || 0.7);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      provider,
      geminiApiKey: geminiApiKey.trim(),
      openaiApiKey: openaiApiKey.trim(),
      geminiModel,
      openaiModel,
      systemPrompt,
      temperature,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">AI Configuration & Keys</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {savedSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Settings saved successfully!
            </div>
          )}

          {/* AI Provider Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Preferred AI Engine
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-3 rounded-2xl border text-xs font-medium transition text-left flex flex-col gap-1 ${
                  provider === 'gemini'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-semibold text-white">Google Gemini</div>
                <div className="text-[10px] text-neutral-400">Fast & Free tier available</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-3 rounded-2xl border text-xs font-medium transition text-left flex flex-col gap-1 ${
                  provider === 'openai'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-semibold text-white">OpenAI</div>
                <div className="text-[10px] text-neutral-400">GPT-4o & GPT-4o Mini</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('pollinations')}
                className={`p-3 rounded-2xl border text-xs font-medium transition text-left flex flex-col gap-1 ${
                  provider === 'pollinations'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1">
                  <span>Free AI</span>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[10px] text-neutral-400">No key required</div>
              </button>
            </div>
          </div>

          {/* Google Gemini API Key */}
          {provider === 'gemini' && (
            <div className="space-y-3 p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
              />

              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-400">Model</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Recommended, ultra-fast)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (High intelligence)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                </select>
              </div>
            </div>
          )}

          {/* OpenAI API Key */}
          {provider === 'openai' && (
            <div className="space-y-3 p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  OpenAI API Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                >
                  <span>Get Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
              />

              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-400">Model</label>
                <select
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Cost-effective & quick)</option>
                  <option value="gpt-4o">gpt-4o (Most capable flagship)</option>
                </select>
              </div>
            </div>
          )}

          {/* System Instruction / Persona */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              Custom Instructions / Persona
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. You are a helpful AI assistant that explains concepts concisely and supports Telugu and English..."
              className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Creativity (Temperature): {temperature}</span>
              <span className="text-neutral-500 text-[10px]">
                {temperature < 0.4 ? 'Precise' : temperature > 0.8 ? 'Creative' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-medium rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
