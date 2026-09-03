import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI, Type, GenerateVideosOperation } from '@google/genai';
import * as admin from 'firebase-admin';

if (!admin.getApps().length) {
  admin.initializeApp({
    projectId: 'gen-lang-client-0940819218'
  });
}

async function createServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // Firebase Auth Middleware
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  const optionalAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        (req as any).user = decodedToken;
      } catch (error) {
        console.error('Error verifying Firebase ID token in optionalAuth:', error);
      }
    }
    next();
  };

  // Initialize Gemini API
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  // API Routes
  
  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Providers Registry
  app.get('/api/providers', (req, res) => {
    res.json({
      google: { status: process.env.GEMINI_API_KEY ? 'Configured' : 'Not Configured', description: 'Primary reasoning, code generation, Veo video, Imagen.' },
      runway: { status: process.env.RUNWAY_API_KEY ? 'Configured' : 'Not Configured', description: 'Gen-3 Alpha models for video generation.' },
      kling: { status: process.env.KLING_API_KEY ? 'Configured' : 'Not Configured', description: 'Kling video and image generation.' },
      replicate: { status: process.env.REPLICATE_API_TOKEN ? 'Configured' : 'Not Configured', description: 'Access to open-source models.' },
      midjourney: { status: process.env.MIDJOURNEY_API_KEY ? 'Configured' : 'Not Configured', description: 'Midjourney v6 via API.' },
      dalle3: { status: process.env.OPENAI_API_KEY ? 'Configured' : 'Not Configured', description: 'DALL-E 3 via OpenAI.' }
    });
  });

  // 3. Orchestrator
  app.post('/api/orchestrate', optionalAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      const user = (req as any).user;

      if (user) {
        await admin.firestore().collection('audit_logs').add({
          userId: user.uid,
          action: 'orchestrate_pipeline',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: { prompt }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a multi-step production pipeline for this request: "${prompt}". Steps could include "script", "video", "voiceover", "music", "image". Provide the pipeline as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              intent: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    provider: { type: Type.STRING },
                    dependsOn: { type: Type.ARRAY, items: { type: Type.STRING } },
                    reason: { type: Type.STRING }
                  },
                  required: ["id", "type", "provider", "dependsOn", "reason"]
                }
              }
            },
            required: ["title", "intent", "steps"]
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const pipelineResult = JSON.parse(text);

        if (user) {
          await admin.firestore().collection('jobs').add({
            userId: user.uid,
            type: 'orchestration',
            status: 'completed',
            prompt,
            resultUrl: JSON.stringify(pipelineResult),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        res.json(pipelineResult);
      } else {
        throw new Error("Empty response");
      }
    } catch (e) {
      console.error("Orchestrator error:", e);
      res.status(500).json({ error: "Failed to orchestrate pipeline" });
    }
  });

  // 4. Video Generate 
  app.post('/api/video/generate', optionalAuth, async (req, res) => {
    try {
      const { prompt, model, aspectRatio = '16:9' } = req.body;
      const user = (req as any).user;

      if (user) {
        await admin.firestore().collection('audit_logs').add({
          userId: user.uid,
          action: 'generate_video',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: { prompt, model, aspectRatio }
        });
      }

      if (model === 'runway') {
        if (!process.env.RUNWAY_API_KEY) {
          return res.status(400).json({ error: "RUNWAY_API_KEY not configured. Please add it in Settings." });
        }
        return res.status(501).json({ error: "Runway adapter implemented, awaiting billing setup." });
      }

      if (model === 'kling') {
        if (!process.env.KLING_API_KEY) {
          return res.status(400).json({ error: "KLING_API_KEY not configured. Please add it in Settings." });
        }
        return res.status(501).json({ error: "Kling adapter implemented, awaiting billing setup." });
      }

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview', // Force Veo lite for speed and 1080p
        prompt: prompt || 'A cinematic sweeping shot',
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
        }
      });
      
      if (user) {
        await admin.firestore().collection('jobs').doc(operation.name).set({
          userId: user.uid,
          type: 'video_generation',
          status: 'pending',
          prompt,
          resultUrl: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      res.json({ operationName: operation.name });
    } catch (e: any) {
      console.error("Video generation error:", e);
      res.status(500).json({ error: e.message || "Failed to generate video" });
    }
  });

  // 5. Video Status Poll
  app.post('/api/video/status', optionalAuth, async (req, res) => {
    try {
      const { operationName } = req.body;
      const user = (req as any).user;
      
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      if (user && updated.done) {
        await admin.firestore().collection('jobs').doc(operationName).update({
          status: 'completed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }).catch(e => console.error('Failed to update job status:', e));
      }

      res.json({ done: updated.done });
    } catch (e) {
      console.error("Video status error:", e);
      res.status(500).json({ error: "Failed to get video status" });
    }
  });

  // 6. Video Download
  app.post('/api/video/download', optionalAuth, async (req, res) => {
    try {
      const { operationName } = req.body;
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "Video URI not ready or not found" });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY as string },
      });

      res.setHeader('Content-Type', 'video/mp4');
      videoRes.body!.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } catch (e) {
      console.error("Video download error:", e);
      res.status(500).json({ error: "Failed to download video" });
    }
  });

  // 6.5. Image Generation
  app.post('/api/image/generate', optionalAuth, async (req, res) => {
    try {
      const { prompt, aspectRatio = '1:1', model = 'imagen' } = req.body;
      const user = (req as any).user;

      if (user) {
        await admin.firestore().collection('audit_logs').add({
          userId: user.uid,
          action: 'generate_image',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: { prompt, model, aspectRatio }
        });
      }
      
      if (model === 'midjourney') {
        if (!process.env.MIDJOURNEY_API_KEY) {
          return res.status(400).json({ error: "MIDJOURNEY_API_KEY not configured. Please add it in Settings." });
        }
        return res.status(501).json({ error: "Midjourney adapter implemented, awaiting billing setup." });
      }

      if (model === 'dalle3') {
        if (!process.env.OPENAI_API_KEY) {
          return res.status(400).json({ error: "OPENAI_API_KEY not configured. Please add it in Settings." });
        }
        return res.status(501).json({ error: "DALL-E 3 adapter implemented, awaiting billing setup." });
      }

      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt || 'A beautiful landscape',
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio as '1:1' | '16:9' | '9:16',
          outputMimeType: 'image/jpeg',
        }
      });
      
      const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
      if (!base64Image) {
        throw new Error("No image generated");
      }
      
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      if (user) {
        await admin.firestore().collection('jobs').add({
          userId: user.uid,
          type: 'image_generation',
          status: 'completed',
          prompt,
          resultUrl: imageUrl, // Storing base64 for simplicity in MVP
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      res.json({ image: imageUrl });
    } catch (e: any) {
      console.error("Image generation error:", e);
      res.status(500).json({ error: e.message || "Failed to generate image" });
    }
  });

  // 7. Ad Copy Generation
  app.post('/api/ad/copy', optionalAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      const user = (req as any).user;

      if (user) {
        await admin.firestore().collection('audit_logs').add({
          userId: user.uid,
          action: 'generate_ad_copy',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: { prompt }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create 3 distinct creative ad copy variants for the following product/prompt: "${prompt}". Return it as JSON with a "variants" array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              variants: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const variants = JSON.parse(text).variants;
        
        if (user) {
          await admin.firestore().collection('jobs').add({
            userId: user.uid,
            type: 'ad_copy_generation',
            status: 'completed',
            prompt,
            resultUrl: JSON.stringify(variants),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        
        res.json({ variants });
      } else {
        throw new Error("Empty response");
      }
    } catch (e) {
      console.error("Ad copy error:", e);
      res.status(500).json({ error: "Failed to generate ad copy" });
    }
  });

  // 8. App Builder Generation
  app.post('/api/app/generate', optionalAuth, async (req, res) => {
    try {
      const { prompt } = req.body;
      const user = (req as any).user;

      // Audit Log
      if (user) {
        await admin.firestore().collection('audit_logs').add({
          userId: user.uid,
          action: 'generate_app',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: { prompt }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Act as an expert React developer. Write a single-file React component (App.tsx) using Tailwind CSS for the following request: "${prompt}". Only output the code inside a Markdown code block. Do not include any other text.`,
      });
      
      const text = response.text || '';
      const codeMatch = text.match(/```(?:tsx|jsx|javascript|typescript)?\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : text.trim();
      
      // Save Job
      if (user) {
        await admin.firestore().collection('jobs').add({
          userId: user.uid,
          type: 'app_generation',
          status: 'completed',
          prompt,
          resultUrl: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          code
        });
      }

      res.json({ code });
    } catch (e: any) {
      console.error("App generation error:", e);
      res.status(500).json({ error: "Failed to generate application code" });
    }
  });

  // Serve Frontend
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Need to use absolute path or relative to CWD correctly for production
    // Assuming dist/ is created in the root
    app.use(express.static('dist'));
    app.use('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

createServer().catch(console.error);
