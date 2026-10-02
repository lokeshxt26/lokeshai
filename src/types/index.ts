export type AIProvider = 'gemini' | 'openai' | 'pollinations';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: string; // Base64 data URL for image doubt/question
  modelUsed?: string;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  userId?: string; // Bound to user account
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface AISettings {
  provider: AIProvider;
  geminiApiKey: string;
  openaiApiKey: string;
  geminiModel: string;
  openaiModel: string;
  systemPrompt: string;
  temperature: number;
  speechLanguage: 'te-IN' | 'en-IN' | 'en-US';
}
