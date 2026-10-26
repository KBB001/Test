import type { Connect } from 'vite';
import {
  translateText,
  generateMentorResponse,
  generateSpeechTTS,
  exploreCulturalGrounding,
  explorePlacesGrounding,
} from './geminiService.ts';

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export function geminiApiPlugin() {
  return {
    name: 'gemini-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: Connect.IncomingMessage, res: any, next: () => void) => {
        const url = req.url || '';

        if (!url.startsWith('/api/gemini/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (url.startsWith('/api/gemini/translate') && req.method === 'POST') {
            const body = await readJsonBody(req);
            const result = await translateText(body.text, body.targetLanguage, body.sourceLanguage);
            res.end(JSON.stringify(result));
            return;
          }

          if (url.startsWith('/api/gemini/mentor') && req.method === 'POST') {
            const body = await readJsonBody(req);
            const result = await generateMentorResponse(
              body.message,
              body.history,
              body.scenario,
              body.targetLanguage,
              body.enableThinking
            );
            res.end(JSON.stringify(result));
            return;
          }

          if (url.startsWith('/api/gemini/tts') && req.method === 'POST') {
            const body = await readJsonBody(req);
            const result = await generateSpeechTTS(body.text, body.voiceName);
            res.end(JSON.stringify(result));
            return;
          }

          if (url.startsWith('/api/gemini/search') && req.method === 'POST') {
            const body = await readJsonBody(req);
            const result = await exploreCulturalGrounding(body.query, body.countryOrLanguage);
            res.end(JSON.stringify(result));
            return;
          }

          if (url.startsWith('/api/gemini/maps') && req.method === 'POST') {
            const body = await readJsonBody(req);
            const result = await explorePlacesGrounding(body.city, body.language);
            res.end(JSON.stringify(result));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          console.error('API Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err?.message || 'Server error' }));
        }
      });
    },
  };
}
