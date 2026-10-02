import type { AISettings, Message } from '../types';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'pollinations',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  geminiModel: 'gemini-1.5-flash',
  openaiModel: 'gpt-4o-mini',
  systemPrompt: `You are "AskMe", an expert, friendly, and highly intelligent multilingual AI mobile assistant.

CRITICAL INSTRUCTION - LANGUAGE & SCRIPT MIRRORING:
1. When user writes in Manglish (Telugu words typed using English/Latin alphabet, e.g. "nuvu ella vunav", "em chestunnav", "nenu em cheyali", "naku help kavali", "bagunava"):
   -> YOU MUST REPLY IN MANGLISH (Telugu in English letters) ONLY!
   Example:
   User: "nuvu ella vunav"
   AskMe: "Nenu chala bagunnanu! Meeru ela unnaru? Ivala meeku nenu ela help cheyagalanu?"
2. When user writes in pure Telugu script (తెలుగు లిపి, e.g. "నువ్వు ఎలా ఉన్నావు?", "నమస్కారం"):
   -> YOU MUST REPLY IN PURE TELUGU SCRIPT!
   Example:
   User: "నువ్వు ఎలా ఉన్నావు?"
   AskMe: "నేను చాలా బాగున్నాను! మీరు ఎలా ఉన్నారు? మీకు నేను ఈరోజు ఎలా సహాయపడగలను?"
3. When user writes in English:
   -> Reply in clear, natural English.
4. When user writes in Hindi:
   -> Reply in Hindi (match Hinglish if typed in Latin letters, or Devanagari if in Hindi script).
5. If the user attaches an image with a doubt, question, or math problem:
   -> Carefully analyze the visual contents, formulas, text, diagrams, or questions in the image and provide a thorough, step-by-step solution and answer in the matching language!`,
  temperature: 0.7,
  speechLanguage: 'te-IN',
};

export async function sendChatMessage(
  history: Message[],
  userPrompt: string,
  image: string | undefined,
  settings: AISettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const provider = settings.provider;

  // 1. If Gemini is selected or if image is provided with Gemini key
  if (provider === 'gemini' && settings.geminiApiKey.trim()) {
    try {
      return await callGemini(history, userPrompt, image, settings, onChunk);
    } catch (err: any) {
      console.warn('Gemini failed, falling back to AskMe Engine:', err);
      return await callAskMeBackend(history, userPrompt, image, settings, onChunk);
    }
  }

  // 2. If OpenAI is selected with API key
  if (provider === 'openai' && settings.openaiApiKey.trim()) {
    try {
      return await callOpenAI(history, userPrompt, image, settings, onChunk);
    } catch (err: any) {
      console.warn('OpenAI failed, falling back to AskMe Engine:', err);
      return await callAskMeBackend(history, userPrompt, image, settings, onChunk);
    }
  }

  // 3. If image is attached but user hasn't added Gemini key, check if we can still analyze via backend
  return await callAskMeBackend(history, userPrompt, image, settings, onChunk);
}

// AskMe Backend Proxy (Guaranteed to bypass CORS and 403 on Android and Web)
async function callAskMeBackend(
  history: Message[],
  userPrompt: string,
  image: string | undefined,
  settings: AISettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const messagesPayload = history.slice(-6).map((m) => ({
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
        prompt: userPrompt || (image ? 'Please analyze this image and explain what is inside it.' : 'Hello'),
        image,
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
    console.warn('Backend proxy error, attempting direct fallback...', backendErr);
  }

  // Direct fallback
  try {
    const promptToSend = userPrompt || 'Hello AskMe';
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: settings.systemPrompt || DEFAULT_AI_SETTINGS.systemPrompt },
          { role: 'user', content: promptToSend }
        ],
        model: 'openai-fast',
        seed: Math.floor(Math.random() * 100000),
      })
    });

    if (res.ok) {
      const text = await res.text();
      if (onChunk) {
        await simulateStream(text, onChunk);
      }
      return text;
    }
  } catch (directErr) {
    console.warn('Direct fallback error:', directErr);
  }

  throw new Error('Unable to connect to AskMe AI. Please check internet connection or configure an API key in Settings (⚙️).');
}

// Google Gemini API Call with Multimodal Vision Support
async function callGemini(
  history: Message[],
  userPrompt: string,
  image: string | undefined,
  settings: AISettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const model = settings.geminiModel || 'gemini-1.5-flash';
  const apiKey = settings.geminiApiKey.trim();

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents: any[] = [];
  const recentHistory = history.slice(-8);

  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  const currentParts: any[] = [];

  // If image is attached (data:image/jpeg;base64,...), extract mimeType and base64
  if (image && image.startsWith('data:')) {
    const [meta, base64Data] = image.split(';base64,');
    const mimeType = meta.replace('data:', '') || 'image/jpeg';
    currentParts.push({
      inlineData: {
        mimeType,
        data: base64Data,
      },
    });
  }

  currentParts.push({
    text: userPrompt || (image ? 'Please analyze this image, solve the question/doubt, and explain step-by-step.' : 'Hello'),
  });

  contents.push({
    role: 'user',
    parts: currentParts,
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

// OpenAI API Call with Vision Support
async function callOpenAI(
  history: Message[],
  userPrompt: string,
  image: string | undefined,
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

  const recentHistory = history.slice(-8);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  const userContent: any[] = [];
  if (userPrompt) {
    userContent.push({ type: 'text', text: userPrompt });
  } else if (image) {
    userContent.push({ type: 'text', text: 'Please analyze this image, solve any question shown, and explain.' });
  }

  if (image) {
    userContent.push({
      type: 'image_url',
      image_url: { url: image },
    });
  }

  messages.push({
    role: 'user',
    content: userContent,
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

// Smooth word-by-word streaming typing effect
async function simulateStream(fullText: string, onChunk: (chunk: string) => void): Promise<void> {
  const words = fullText.split(/(\s+)/);
  let accumulated = '';
  
  for (let i = 0; i < words.length; i++) {
    accumulated += words[i];
    onChunk(accumulated);
    const delay = words[i].includes('\n') ? 20 : Math.min(10, Math.max(3, 200 / words.length));
    await new Promise((r) => setTimeout(r, delay));
  }
}
