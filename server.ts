import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use(express.json());

// API route
app.post('/api/process-paper', upload.single('file'), async (req, res) => {
  try {
    const { url } = req.body;
    let text = '';

    if (req.file) {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (url) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const data = await pdfParse(Buffer.from(buffer));
      text = data.text;
    } else {
      return res.status(400).json({ error: 'No file or URL provided' });
    }

    // Process with LLM
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this research paper content and return JSON:
    {
      "summary": "...",
      "concepts": ["...", "..."],
      "mathExplainer": "...",
      "mindMapData": { ... },
      "learningCards": ["...", "..."]
    }
    Content: ${text.substring(0, 10000)}`;

    const result = await model.generateContent(prompt);
    const jsonStr = result.response.text();
    const json = JSON.parse(jsonStr.replace(/```json/g, '').replace(/```/g, ''));

    res.json(json);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process paper' });
  }
});

// Vite/Frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
