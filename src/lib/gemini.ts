import { GoogleGenerativeAI } from '@google/generative-ai'
import * as pdfjsLib from 'pdfjs-dist'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// Debug environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY
console.log('Environment check:', {
  hasGeminiKey: !!apiKey,
  keyLength: apiKey?.length || 0,
  nodeEnv: import.meta.env.MODE,
  viteEnv: import.meta.env.MODE
})

// Only initialize the Gemini API client if we have an API key
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface SpendingAnalysis {
  locations: Array<{
    name: string
    totalSpent: number
    transactions: Array<{
      date: string
      time?: string
      amount: number
      description?: string
    }>
    address?: string
    city?: string
    state?: string
    zip?: string
  }>
  summary: {
    totalSpent: number
    transactionCount: number
    dateRange: {
      start: string
      end: string
    }
  }
}

export const geminiService = {
  async analyzePDF(pdfArrayBuffer: ArrayBuffer): Promise<SpendingAnalysis> {
    if (!genAI) {
      console.error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.')
      throw new Error('Gemini API key not configured')
    }

    try {
      console.log('Starting PDF analysis...')
      
      // Parse the PDF using PDF.js
      console.log('Loading PDF...')
      const pdf = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise
      console.log('PDF loaded, pages:', pdf.numPages)
      
      // Extract text from all pages
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }
      
      console.log('PDF text extracted, length:', fullText.length)
      
      if (!fullText.trim()) {
        throw new Error('No text content extracted from PDF')
      }

      // Initialize Gemini Pro model
      console.log('Initializing Gemini model...')
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      console.log('Gemini model initialized')

      // Create a prompt for spending analysis
      const prompt = `Analyze the following bank statement text and extract all spending information. Group transactions by location and provide a summary.

Format the response as a JSON object with this structure:
{
  "locations": [
    {
      "name": string, // Business/merchant name
      "totalSpent": number, // Total amount spent at this location
      "transactions": [
        {
          "date": string, // YYYY-MM-DD format
          "time": string, // HH:MM format if available
          "amount": number, // Transaction amount
          "description": string // Optional transaction description
        }
      ],
      "address": string, // Optional
      "city": string, // Optional
      "state": string, // Optional
      "zip": string // Optional
    }
  ],
  "summary": {
    "totalSpent": number, // Total amount spent across all locations
    "transactionCount": number, // Total number of transactions
    "dateRange": {
      "start": string, // Earliest transaction date (YYYY-MM-DD)
      "end": string // Latest transaction date (YYYY-MM-DD)
    }
  }
}

Here's the bank statement text to analyze:

${fullText}

Only respond with the JSON object, no other text.`

      // Get response from Gemini
      console.log('Sending request to Gemini...')
      const result = await model.generateContent(prompt)
      console.log('Received response from Gemini')
      
      const response = await result.response
      const text = response.text()
      console.log('Gemini response text length:', text.length)

      if (!text) {
        throw new Error('Empty response from Gemini')
      }

      // Parse the JSON response
      console.log('Parsing JSON response...')
      let analysis: SpendingAnalysis
      try {
        analysis = JSON.parse(text)
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', {
          error: parseError,
          responseText: text
        })
        throw new Error('Invalid JSON response from Gemini')
      }

      // Clean up and validate the data
      analysis.locations = analysis.locations.map(location => ({
        ...location,
        totalSpent: Number(location.totalSpent),
        transactions: location.transactions.map(t => ({
          ...t,
          amount: Number(t.amount),
          date: t.date.split('T')[0] // Ensure date is in YYYY-MM-DD format
        }))
      }))

      analysis.summary = {
        ...analysis.summary,
        totalSpent: Number(analysis.summary.totalSpent),
        transactionCount: Number(analysis.summary.transactionCount),
        dateRange: {
          start: analysis.summary.dateRange.start.split('T')[0],
          end: analysis.summary.dateRange.end.split('T')[0]
        }
      }

      console.log('Successfully parsed spending analysis:', {
        locationCount: analysis.locations.length,
        transactionCount: analysis.summary.transactionCount,
        totalSpent: analysis.summary.totalSpent
      })

      return analysis
    } catch (error) {
      console.error('Error in analyzePDF:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
      throw new Error(`Failed to analyze PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
} 