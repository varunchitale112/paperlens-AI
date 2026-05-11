import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use(express.json());

// API route
app.post('/api/process-paper', upload.single('file'), async (req: any, res) => {
  try {
    const { url, text: inputText } = req.body;
    let text = '';

    if (req.file) {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (url) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const data = await pdfParse(Buffer.from(buffer));
      text = data.text;
    } else if (inputText) {
      text = inputText;
    } else {
      return res.status(400).json({ error: 'No file, URL or text provided' });
    }

    // Process with LLM
    const model = (ai as any).getGenerativeModel({ model: 'gemini-1.5-flash' });
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

export default app;
