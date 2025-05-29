import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs/promises';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import PDFParser from 'pdf2json';
import type { Request, Response } from 'express';
import type { Output } from 'pdf2json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: join(__dirname, 'uploads'),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  })
});

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'uploads');
await fs.mkdir(uploadsDir, { recursive: true });

// Add type definitions for pdf2json
interface PDFInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

interface PDFPage {
  Texts: Array<{
    x: number;
    y: number;
    R: Array<{
      T: string;
      S: number;
      TS: [number, number, number];
    }>;
  }>;
  Info?: PDFInfo;
}

interface PDFData {
  Pages: PDFPage[];
  Info?: PDFInfo;
}

// Helper function to parse PDF
async function parsePDF(filePath: string): Promise<{
  text: string;
  numpages: number;
  info: PDFInfo;
  metadata: Record<string, any>;
}> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData: Output) => {
      try {
        // Extract text from all pages
        const text = pdfParser.getRawTextContent();
        
        // Get metadata from document info
        const info = (pdfData.Info || {}) as PDFInfo;
        const metadata = {
          title: info.Title || 'Untitled',
          author: info.Author || 'Unknown',
          subject: info.Subject || '',
          keywords: info.Keywords || '',
          creator: info.Creator || 'Unknown',
          producer: info.Producer || 'Unknown',
          creationDate: info.CreationDate || new Date(),
          modificationDate: info.ModDate || new Date()
        };

        resolve({
          text,
          numpages: pdfData.Pages.length,
          info,
          metadata
        });
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.on('pdfParser_dataError', (error) => {
      reject(error);
    });

    // Load and parse the PDF
    pdfParser.loadPDF(filePath);
  });
}

// PDF parsing endpoint
app.post('/api/parse-pdf', upload.single('pdf'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    // Parse the PDF
    const { text, numpages, info, metadata } = await parsePDF(req.file.path);

    // Clean up the uploaded file
    await fs.unlink(req.file.path);

    // Return the parsed data
    res.json({
      success: true,
      data: {
        numpages,
        numrender: numpages,
        info,
        metadata,
        version: '1.0',
        text
      }
    });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ 
      error: 'Failed to parse PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 