import type { AISettings, Message } from '../types';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'pollinations',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  geminiModel: 'gemini-1.5-flash',
  openaiModel: 'gpt-4o-mini',
  systemPrompt: `You are "AskMe", an advanced, helpful, and friendly AI mobile assistant.

CRITICAL LANGUAGE RULES:
1. ALWAYS detect the language of the user's prompt and respond in the EXACT SAME LANGUAGE.
2. If the user asks in Telugu (తెలుగు), respond in natural, polite Telugu script.
3. If the user asks in Telugu written in English alphabet (Manglish e.g., "ela unnaru", "naku help kavali"), respond warmly in Telugu / Manglish.
4. If the user asks in English, respond in English.
5. If the user asks in Hindi, respond in Hindi.
6. Provide concise, clear, well-structured answers using markdown, bullet points, and code blocks where helpful.`,
  temperature: 0.7,
};

export async function sendChatMessage(
  history: Message[],
  userPrompt: string,
  settings: AISettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const provider = settings.provider;

  // If user selected Gemini and provided API key
  if (provider === 'gemini' && settings.geminiApiKey.trim()) {
    try {
      return await callGemini(history, userPrompt, settings, onChunk);
    } catch (err: any) {
      console.warn('Gemini failed, falling back to AskMe Engine:', err);
      return await callAskMeBackend(history, userPrompt, settings, onChunk);
    }
  }

  // If user selected OpenAI and provided API key
  if (provider === 'openai' && settings.openaiApiKey.trim()) {
    try {
      return await callOpenAI(history, userPrompt, settings, onChunk);
    } catch (err: any) {
      console.warn('OpenAI failed, falling back to AskMe Engine:', err);
      return await callAskMeBackend(history, userPrompt, settings, onChunk);
    }
  }

  // Default: Reliable AskMe Engine (No API key required, zero 403 errors!)
  return await callAskMeBackend(history, userPrompt, settings, onChunk);
}

// AskMe Backend Proxy (Guaranteed to bypass CORS and 403 errors on Desktop & Android)
async function callAskMeBackend(
  history: Message[],
  userPrompt: string,
  settings: AISettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const messagesPayload = history.slice(-8).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messagesPayload,
        prompt: userPrompt,
        systemPrompt: settings.systemPrompt || DEFAULT_AI_SETTINGS.systemPrompt,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.reply || 'No response received.';
      if (onChunk) {
        await simulateStream(text, onChunk);
      }
      return text;
    }
  } catch (backendErr) {
    console.warn('Local /api/chat error, attempting direct fallback...', backendErr);
  }

  // Fallback to GET endpoint with encoded query if proxy unreachable
  try {
    const promptEnc = encodeURIComponent(userPrompt);
    const systemEnc = encodeURIComponent(settings.systemPrompt || DEFAULT_AI_SETTINGS.systemPrompt);
    const directRes = await fetch(`https://text.pollinations.ai/${promptEnc}?model=openai&system=${systemEnc}`);
    if (directRes.ok) {
      const text = await directRes.text();
      if (onChunk) {
        await simulateStream(text, onChunk);
      }
      return text;
    }
  } catch (directErr) {
    console.warn('Direct fallback error:', directErr);
  }

  throw new Error('Unable to connect to AskMe AI. Please verify internet connection or add a Gemini API key in Settings.');
}

// Google Gemini API Call
async function callGemini(
  history: Message[],
  userPrompt: string,
  settings: AISettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const model = settings.geminiModel || 'gemini-1.5-flash';
  const apiKey = settings.geminiApiKey.trim();

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }],
  });

  const payload: any = {
    contents,
    generationConfig: {
      temperature: settings.temperature || 0.7,
      maxOutputTokens: 2048,
    },
  };

  const sysInstruction = settings.systemPrompt || DEFAULT_AI_SETTINGS.systemPrompt;
  if (sysInstruction) {
    payload.systemInstruction = {
      parts: [{ text: sysInstruction }],
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

  if (onChunk) {
    await simulateStream(text, onChunk);
  }

  return text;
}

// OpenAI API Call
async function callOpenAI(
  history: Message[],
  userPrompt: string,
  settings: AISettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const model = settings.openaiModel || 'gpt-4o-mini';
  const apiKey = settings.openaiApiKey.trim();

  const messages: any[] = [];
  const sysInstruction = settings.systemPrompt || DEFAULT_AI_SETTINGS.systemPrompt;
  if (sysInstruction) {
    messages.push({
      role: 'system',
      content: sysInstruction,
    });
  }

  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  messages.push({
    role: 'user',
    content: userPrompt,
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: settings.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || 'No response generated.';

  if (onChunk) {
    await simulateStream(text, onChunk);
  }

  return text;
}

// Simulated smooth word-by-word streaming
async function simulateStream(fullText: string, onChunk: (chunk: string) => void): Promise<void> {
  const words = fullText.split(/(\s+)/);
  let accumulated = '';
  
  for (let i = 0; i < words.length; i++) {
    accumulated += words[i];
    onChunk(accumulated);
    const delay = words[i].includes('\n') ? 20 : Math.min(12, Math.max(4, 300 / words.length));
    await new Promise((r) => setTimeout(r, delay));
  }
}
