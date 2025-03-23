// app/api/analyze-sentiment/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Invalid text input' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt for sentiment analysis
    const prompt = `
      Analyze the following text for confidence, emotional tone, and professionalism in an interview context.
      Return a JSON object with these properties:
      - confidence: Number between 0-1 representing how confident the speaker sounds
      - emotionalTone: String (one of: "neutral", "positive", "negative", "anxious", "enthusiastic")
      - professionalism: Number between 0-1 representing how professional the language is
      - formality: Number between 0-1 representing how formal the language is
      
      Text to analyze: "${text}"
      
      Only respond with valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ 
        error: 'Failed to parse sentiment analysis result' 
      }, { status: 500 });
    }

    const sentimentData = JSON.parse(jsonMatch[0]);
    return Response.json(sentimentData);
    
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return Response.json({ 
      error: 'Failed to analyze sentiment',
      details: error.message 
    }, { status: 500 });
  }
}