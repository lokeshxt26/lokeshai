import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ChatSession, Message, AISettings } from '../types';
import { DEFAULT_AI_SETTINGS, sendChatMessage } from '../services/aiService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  currentSessionId: string;
  isGenerating: boolean;
  settings: AISettings;
  activeError: string | null;
  createNewChat: () => void;
  selectSession: (sessionId: string) => void;
  sendMessage: (content: string, image?: string) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
  clearAllSessions: () => void;
  updateSettings: (newSettings: Partial<AISettings>) => void;
  clearError: () => void;
}

const SETTINGS_STORAGE_KEY = 'askme_app_settings';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const userStorageKey = `askme_sessions_${userId}`;

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions.length > 0 ? sessions[0].id : '';
  });

  // Whenever the user logs in or switches account, reload their specific chat history!
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`askme_sessions_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        setCurrentSessionId(parsed.length > 0 ? parsed[0].id : '');
      } else {
        setSessions([]);
        setCurrentSessionId('');
      }
    } catch (e) {
      console.error('Failed to switch user sessions:', e);
      setSessions([]);
      setCurrentSessionId('');
    }
  }, [userId]);

  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_AI_SETTINGS;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const abortControllerRef = useRef<boolean>(false);

  // Sync current user's sessions to their personal storage key
  useEffect(() => {
    try {
      localStorage.setItem(`askme_sessions_${userId}`, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  }, [sessions, userId]);

  // Sync settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  const createNewChat = () => {
    const newSessionId = 'chat_' + Date.now();
    const newSession: ChatSession = {
      id: newSessionId,
      userId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.provider === 'gemini' ? settings.geminiModel : settings.openaiModel,
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setActiveError(null);
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setActiveError(null);
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : '');
      }
      return remaining;
    });
  };

  const renameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() || 'Untitled Chat' } : s))
    );
  };

  const clearAllSessions = () => {
    setSessions([]);
    setCurrentSessionId('');
    localStorage.removeItem(`askme_sessions_${userId}`);
  };

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const clearError = () => setActiveError(null);

  const sendMessage = async (userPrompt: string, image?: string) => {
    if ((!userPrompt.trim() && !image) || isGenerating) return;

    let targetSessionId = currentSessionId;
    let targetSession = sessions.find((s) => s.id === targetSessionId);

    const promptTitle = userPrompt.trim() || (image ? '📷 Image Doubt' : 'New Chat');
    const firstTitle = promptTitle.length > 28 ? promptTitle.substring(0, 28) + '...' : promptTitle;

    if (!targetSession) {
      const newSessionId = 'chat_' + Date.now();
      targetSession = {
        id: newSessionId,
        userId,
        title: firstTitle,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: settings.provider === 'gemini' ? settings.geminiModel : settings.openaiModel,
      };
      setSessions((prev) => [targetSession!, ...prev]);
      setCurrentSessionId(newSessionId);
      targetSessionId = newSessionId;
    } else if (targetSession.messages.length === 0) {
      targetSession.title = firstTitle;
    }

    const userMessage: Message = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: userPrompt.trim(),
      image,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = 'msg_ai_' + (Date.now() + 1);
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      modelUsed: settings.provider,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? {
              ...s,
              title: s.messages.length === 0 ? firstTitle : s.title,
              messages: [...s.messages, userMessage, assistantMessage],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsGenerating(true);
    setActiveError(null);
    abortControllerRef.current = false;

    try {
      const currentHistory = targetSession ? targetSession.messages : [];

      await sendChatMessage(
        currentHistory,
        userPrompt,
        image,
        settings,
        (partialText) => {
          if (abortControllerRef.current) return;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === targetSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantPlaceholderId
                        ? { ...m, content: partialText, isStreaming: true }
                        : m
                    ),
                  }
                : s
            )
          );
        }
      );

      // Finalize streaming
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId ? { ...m, isStreaming: false } : m
                ),
              }
            : s
        )
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Error occurred while contacting AskMe AI.';
      setActiveError(errorMessage);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content: `⚠️ Error: ${errorMessage}`,
                        error: true,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : s
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateResponse = async (messageId: string) => {
    if (!currentSession || isGenerating) return;

    const messageIndex = currentSession.messages.findIndex((m) => m.id === messageId);
    if (messageIndex <= 0) return;

    const prevUserMessage = currentSession.messages[messageIndex - 1];
    if (prevUserMessage.role !== 'user') return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId ? { ...m, content: '', isStreaming: true, error: false } : m
              ),
            }
          : s
      )
    );

    setIsGenerating(true);
    setActiveError(null);

    try {
      const historyUntilPrompt = currentSession.messages.slice(0, messageIndex - 1);
      await sendChatMessage(
        historyUntilPrompt,
        prevUserMessage.content,
        prevUserMessage.image,
        settings,
        (partialText) => {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === messageId ? { ...m, content: partialText, isStreaming: true } : m
                    ),
                  }
                : s
            )
          );
        }
      );

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId ? { ...m, isStreaming: false } : m
                ),
              }
            : s
        )
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to regenerate response.';
      setActiveError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSession,
        currentSessionId,
        isGenerating,
        settings,
        activeError,
        createNewChat,
        selectSession,
        sendMessage,
        regenerateResponse,
        deleteSession,
        renameSession,
        clearAllSessions,
        updateSettings,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
