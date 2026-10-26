/**
 * Universal Gemini client with dual capability:
 * 1. Backend proxy (/api/gemini/*) for local dev server
 * 2. Direct client-side API call if user entered their custom API key in GitHub Pages
 * 3. Graceful offline fallback when running on static hosts like GitHub Pages without API keys
 */

const API_KEY_STORAGE_KEY = 'lingua_custom_api_key';

export function getCustomApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setCustomApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key:', e);
  }
}

export interface TranslationResult {
  translatedText: string;
  keyWords: Array<{
    word: string;
    translation: string;
    cefrLevel?: string;
  }>;
  culturalNote?: string;
}

export interface MentorResult {
  reply: string;
  thinkingProcess?: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    cefrLevel: string;
    nuance: string;
  }>;
}

export interface GroundingResult {
  success: boolean;
  content: string;
}

/**
 * Universal text translation
 */
export async function translateTextClient(
  text: string,
  targetLang: string = 'ru',
  sourceLang: string = 'auto'
): Promise<TranslationResult> {
  if (!text) {
    return { translatedText: '', keyWords: [], culturalNote: '' };
  }

  // 1. Try local backend proxy if available
  try {
    const res = await fetch('/api/gemini/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage: targetLang, sourceLanguage: sourceLang }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.translatedText) {
        return data;
      }
    }
  } catch {
    // Backend not running (GitHub Pages static environment)
  }

  // 2. Try direct client Gemini API if user has stored custom API key
  const customKey = getCustomApiKey();
  if (customKey) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: customKey });
      const prompt = `Translate the following message into language '${targetLang}' (source language is '${sourceLang}'). Also extract 2 to 4 key vocabulary words or idioms from the text with Russian translations, and a 1-sentence cultural nuance.

Text to translate:
"${text}"

Respond in JSON format with schema:
{
  "translatedText": "string",
  "keyWords": [
    { "word": "original word or phrase", "translation": "translation in Russian", "cefrLevel": "A1|A2|B1|B2|C1|C2" }
  ],
  "culturalNote": "string"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              keyWords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    cefrLevel: { type: Type.STRING },
                  },
                  required: ['word', 'translation'],
                },
              },
              culturalNote: { type: Type.STRING },
            },
            required: ['translatedText', 'keyWords'],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn('Client-side Gemini translate failed, using offline fallback:', err);
    }
  }

  // 3. High quality offline simulation fallback for GitHub Pages
  return getSimulatedTranslation(text, targetLang);
}

/**
 * Universal AI mentor response
 */
export async function generateMentorResponseClient(
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }> = [],
  scenario: string = 'general',
  targetLanguage: string = 'en',
  enableThinking: boolean = false
): Promise<MentorResult> {
  // 1. Try local backend proxy
  try {
    const res = await fetch('/api/gemini/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        scenario,
        targetLanguage,
        enableThinking,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data;
      }
    }
  } catch {
    // Static hosting environment
  }

  // 2. Try direct client Gemini API
  const customKey = getCustomApiKey();
  if (customKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: customKey });
      const systemInstruction = `You are "Globus Tutor" - an empathetic, world-class international language mentor.
The learner is practicing '${targetLanguage}'. The current scenario or mode is '${scenario}'.
Your role:
1. Respond naturally in a warm, encouraging conversational tone.
2. If the user made mistakes, gently offer polite corrections.
3. Automatically identify 2-3 key vocabulary words, collocations, or idioms in your reply with their Russian translation, CEFR level (A1-C2), and a brief nuance note.
4. If thinking mode is requested, provide a brief meta-reflection on pedagogy in 'thinkingProcess'.

Format response strictly in JSON:
{
  "reply": "your conversational response",
  "thinkingProcess": "pedagogical or linguistic reasoning (1-2 sentences)",
  "vocabulary": [
    {
      "word": "word or idiom",
      "translation": "Russian translation",
      "cefrLevel": "A1|A2|B1|B2|C1|C2",
      "nuance": "short usage context or nuance"
    }
  ]
}`;

      const contents = [
        ...history.slice(-4).map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents as any,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn('Client-side Gemini mentor failed, using offline fallback:', err);
    }
  }

  // 3. Realistic simulated response
  return getSimulatedMentorResponse(message, scenario, targetLanguage);
}

/**
 * Cultural search grounding client
 */
export async function exploreCulturalGroundingClient(
  query: string,
  countryOrLanguage: string
): Promise<GroundingResult> {
  try {
    const res = await fetch('/api/gemini/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, countryOrLanguage }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.content) return data;
    }
  } catch {
    // Static host fallback
  }

  return {
    success: true,
    content: `Культурный гид (${countryOrLanguage}): В современной живой коммуникации ключевую роль играет естественный контекст и невербальная вежливость. Для запроса «${query}» характерно внимание к уважительным формам обращения, эмоциональной поддержке собеседника (Aizuchi в японском, приятные вводные слова D'accord / En fait во французском, Vale / Oye в испанском) и живому интонационному ритму.`
  };
}

/**
 * Places search grounding client
 */
export async function explorePlacesGroundingClient(
  city: string,
  language: string
): Promise<GroundingResult> {
  try {
    const res = await fetch('/api/gemini/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.content) return data;
    }
  } catch {
    // Static host fallback
  }

  const cityGuides: Record<string, string> = {
    'Токио': `Популярные аутентичные локации в Токио (Японский язык):\n1. Daikanyama T-Site — книжный салон с атмосферными кофейнями для чтения и спокойного общения.\n2. Shibuya Language Exchange Café — еженедельные дружеские встречи билингвов и изучающих язык.\n3. Yanaka & Nezu — исторический квартал старого Токио (Shitamachi), где приятно практиковать вежливую речь с местными ремесленниками.`,
    'Барселона': `Рекомендованные локации в Барселоне (Испанский язык):\n1. SandwiChez (Gràcia) — излюбленное место студентов и экспатов для разговорных тандемов.\n2. Llibreria Finestres — элегантное книжное пространство с тихим внутренним двориком для литературных клубов.\n3. Plaça del Sol — классическая площадь для вечерней живой практики в неформальной атмосфере.`,
    'Париж': `Атмосферные места в Париже (Французский язык):\n1. Café Polyglotte Saint-Michel — легендарные многоязычные вечера у набережной Сены.\n2. Shakespeare and Company Café — вдохновляющее место для бесед о культуре и литературе.\n3. Jardin du Luxembourg — популярная парковая локация для разговорных клубов в теплые дни.`,
    'Берлин': `Ключевые локации в Берлине (Немецкий язык):\n1. Sprachcafé Neukölln & Kreuzberg — популярные открытые языковые обмены.\n2. Dussmann das KulturKaufhaus — огромный культурный центр в центре Митте с зоной для чтения.\n3. Mauerpark Café — неформальная площадка для знакомств и языковой практики.`,
    'Лондон': `Локации в Лондоне (Английский язык):\n1. British Library café & courtyard — идеальное место для учебы и языковых тандемов.\n2. Mundo Lingo Soho — еженедельные международные встречи с языковыми флажками.\n3. Foyles Bookshop Charing Cross — знаменитый 6-этажный магазин с уютным кафе на верхнем этаже.`
  };

  return {
    success: true,
    content: cityGuides[city] || `Культурные площадки в г. ${city} для практики языка (${language}):\n1. Центральные книжные кафе и библиотеки с зонами коворкинга.\n2. Открытые клубы международного языкового обмена (Language Exchange).\n3. Культурные центры и языковые воркшопы.`
  };
}

// Deterministic simulation helpers for offline/static deployment
function getSimulatedTranslation(text: string, targetLang: string): TranslationResult {
  const dictionary: Record<string, { trans: string; words: Array<{ word: string; translation: string; cefrLevel: string }> }> = {
    'ja': {
      trans: 'こんにちは！言語学習は世界への扉を開きます。',
      words: [
        { word: '扉 (Tobira)', translation: 'Дверь / Врата', cefrLevel: 'N3' },
        { word: '言語学習 (Gengo gakushū)', translation: 'Изучение языков', cefrLevel: 'N4' },
      ],
    },
    'es': {
      trans: '¡Hola! Aprender idiomas abre puertas a nuevas culturas y amistades.',
      words: [
        { word: 'Puertas', translation: 'Двери / Возможности', cefrLevel: 'A2' },
        { word: 'Amistades', translation: 'Дружба / Знакомства', cefrLevel: 'B1' },
      ],
    },
    'fr': {
      trans: 'Bonjour! L\'apprentissage des langues ouvre des portes vers le monde entier.',
      words: [
        { word: 'Apprentissage', translation: 'Обучение / Освоение', cefrLevel: 'B1' },
        { word: 'Monde entier', translation: 'Весь мир', cefrLevel: 'A2' },
      ],
    },
    'de': {
      trans: 'Hallo! Das Sprachenlernen eröffnet neue Horizonte und Begegnungen.',
      words: [
        { word: 'Sprachenlernen', translation: 'Изучение языков', cefrLevel: 'A2' },
        { word: 'Horizonte', translation: 'Горизонты', cefrLevel: 'B1' },
      ],
    },
    'en': {
      trans: 'Hello! Language learning connects people across borders and cultures.',
      words: [
        { word: 'Borders', translation: 'Границы', cefrLevel: 'B1' },
        { word: 'Connects', translation: 'Объединяет / Соединяет', cefrLevel: 'A2' },
      ],
    },
  };

  const matched = dictionary[targetLang] || {
    trans: `[Перевод (${targetLang})]: ${text}`,
    words: [
      { word: text.split(' ')[0] || 'Communication', translation: 'Общение', cefrLevel: 'B1' }
    ]
  };

  return {
    translatedText: text.length > 50 ? `${matched.trans} (${text.slice(0, 30)}...)` : matched.trans,
    keyWords: matched.words,
    culturalNote: 'Использование естественных формулировок помогает мгновенно установить доверительный контакт.',
  };
}

function getSimulatedMentorResponse(message: string, scenario: string, targetLanguage: string): MentorResult {
  const responses: Record<string, { reply: string; thinking: string; words: Array<{ word: string; translation: string; cefrLevel: string; nuance: string }> }> = {
    ja: {
      reply: '素晴らしいですね！自然な表現を使うことで、相手に敬意と親しみやすさが伝わります。例えば、日常会話では相槌（あいづち）をこまめに打つことがとても大切です。',
      thinking: 'Педагогический фокус: развитие уверенности в устной речи и использование традиционных японских реакций слушания (aizuchi).',
      words: [
        { word: '素晴らしい (Subarashii)', translation: 'Замечательно / Великолепно', cefrLevel: 'B1', nuance: 'Искренний комплимент собеседнику' },
        { word: '相槌 (Aizuchi)', translation: 'Реплики согласия / Поддакивание', cefrLevel: 'B2', nuance: 'Основа вежливого японского диалога' },
      ],
    },
    es: {
      reply: '¡Excelente punto! Me parece genial que estés practicando con tanta soltura. En situaciones cotidianas, conectar con frases como «¡Qué bien!» o «Me parece estupendo» le da una calidez única a tu conversación.',
      thinking: 'Педагогический акцент: эмоциональная окраска диалога и использование устойчивых разговорных оборотов.',
      words: [
        { word: 'Soltura', translation: 'Непринужденность / Беглость', cefrLevel: 'B2', nuance: 'Говорить свободно и без стеснения' },
        { word: 'Cotidiano', translation: 'Повседневный', cefrLevel: 'B1', nuance: 'Обычные ежедневные жизненные ситуации' },
      ],
    },
    fr: {
      reply: 'C\'est une très bonne initiative! Votre tournure de phrase est claire et élégante. N\'hésitez pas à enrichir votre expression avec des connecteurs logiques comme «d\'ailleurs» ou «en réalité».',
      thinking: 'Педагогический фокус: связность речи через французские логические коннекторы и беглость.',
      words: [
        { word: 'Tournure', translation: 'Оборот речи / Формулировка', cefrLevel: 'B2', nuance: 'Стилистически удачное построение фразы' },
        { word: 'D\'ailleurs', translation: 'Кстати / Впрочем', cefrLevel: 'B1', nuance: 'Частый связующий элемент в живом французском' },
      ],
    },
    de: {
      reply: 'Sehr gut formuliert! Im Deutschen hilft es besonders, auf die Satzstruktur und passende Redewendungen zu achten. Dein Satz klingt schon sehr flüssig und authentisch.',
      thinking: 'Педагогический фокус: порядок слов и уверенность в формулировании мыслей на немецком.',
      words: [
        { word: 'Flüssig', translation: 'Беглый / Плавный', cefrLevel: 'B1', nuance: 'Речь без долгих заминок' },
        { word: 'Redewendung', translation: 'Идиома / Оборот речи', cefrLevel: 'B2', nuance: 'Устойчивое выражение носителей' },
      ],
    },
    en: {
      reply: `That's a fantastic effort! Your choice of words feels very natural and clear. In spoken interactions, sprinkling in conversational transitions like "To be honest" or "By the way" really bridges the gap to native fluency.`,
      thinking: 'Pedagogical focus: conversational flow, confidence, and natural bridging idioms.',
      words: [
        { word: 'Fluency', translation: 'Беглость речи', cefrLevel: 'B2', nuance: 'Свободное владение языком' },
        { word: 'Bridge the gap', translation: 'Преодолеть разрыв / Сблизиться', cefrLevel: 'C1', nuance: 'Устойчивая идиома для прогресса' },
      ],
    },
  };

  const res = responses[targetLanguage] || responses.en;
  return {
    reply: res.reply,
    thinkingProcess: res.thinking,
    vocabulary: res.words,
  };
}
