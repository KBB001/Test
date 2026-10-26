/**
 * Audio synthesis helper that uses Gemini TTS endpoint or browser Web Speech API
 */
export async function playTextToSpeech(text: string, languageCode: string = 'en'): Promise<void> {
  if (!text) return;

  // Try server-side Gemini TTS first
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName: 'Kore' }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.base64Audio) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.base64Audio}`);
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('Server TTS failed, falling back to Web Speech API:', err);
  }

  // Graceful browser Web Speech API fallback
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language code to BCP-47
    const langMap: Record<string, string> = {
      ja: 'ja-JP',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      en: 'en-US',
      ru: 'ru-RU',
      zh: 'zh-CN',
      it: 'it-IT',
      ko: 'ko-KR',
    };
    utterance.lang = langMap[languageCode] || 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}
