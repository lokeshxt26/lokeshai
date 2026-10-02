export type AIProvider = 'gemini' | 'openai' | 'pollinations';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelUsed?: string;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
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
}
