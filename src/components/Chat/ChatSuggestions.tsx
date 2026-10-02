import React from 'react';
import { Bot, Lightbulb, Code2, PenLine, Sparkles, Languages, Utensils } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ChatSuggestions: React.FC = () => {
  const { sendMessage } = useChat();

  const suggestions = [
    {
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
      title: 'Explain simply',
      prompt: 'Explain quantum computing in simple terms with an everyday analogy.',
      tag: 'Learning',
    },
    {
      icon: <Code2 className="w-5 h-5 text-blue-400" />,
      title: 'Write code',
      prompt: 'Write a JavaScript function to fetch weather data from a free API with error handling.',
      tag: 'Coding',
    },
    {
      icon: <Languages className="w-5 h-5 text-emerald-400" />,
      title: 'Telugu Assistant',
      prompt: 'Telugu lo oka manchi motivational quote mariyu daani meaning cheppandi.',
      tag: 'తెలుగు',
    },
    {
      icon: <PenLine className="w-5 h-5 text-purple-400" />,
      title: 'Draft email',
      prompt: 'Write a polite professional email requesting time off for next Monday.',
      tag: 'Writing',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-rose-400" />,
      title: 'Brainstorm ideas',
      prompt: 'Give me 3 innovative mobile app ideas that solve everyday college student problems.',
      tag: 'Ideation',
    },
    {
      icon: <Utensils className="w-5 h-5 text-orange-400" />,
      title: 'Quick Recipe',
      prompt: 'Suggest a quick 15-minute healthy dinner recipe using ingredients found in any kitchen.',
      tag: 'Food',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto text-center animate-fade-in">
      {/* Bot Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-4 animate-pulse-glow">
        <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
          <Bot className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2">
        What can I help with today?
      </h2>
      <p className="text-sm text-neutral-400 mb-6 max-w-md">
        Ask any question in Telugu, English, or any language. I am AskMe, your personal AI mobile assistant.
      </p>

      {/* Suggestion Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(item.prompt)}
            className="p-3.5 bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl transition group text-left flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="p-1.5 rounded-lg bg-neutral-800 group-hover:bg-neutral-700/80 transition">
                {item.icon}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-500 group-hover:text-neutral-400">
                {item.tag}
              </span>
            </div>
            <div className="font-medium text-xs text-neutral-200 group-hover:text-emerald-300 transition">
              {item.title}
            </div>
            <div className="text-xs text-neutral-400 line-clamp-2 mt-0.5">
              {item.prompt}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
