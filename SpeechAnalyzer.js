'use client'

/**
 * A simplified speech analyzer that doesn't rely on complex ML models
 * but still provides useful metrics for interview confidence assessment
 */
class SpeechAnalyzer {
  constructor() {
    this.analysisResult = {
      fluencyScore: 0,
      confidenceScore: 0,
      fillerWordCount: 0,
      speakingRate: 0, // words per minute
      pauseFrequency: 0,
      vocabularyDiversity: 0,
    };
    
    this.startTime = null;
    this.endTime = null;
    this.transcriptParts = [];
    this.fillerWords = new Set([
      'um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'actually', 
      'basically', 'literally', 'right', 'i mean'
    ]);
    
    // For pause detection
    this.lastSpeechTimestamp = null;
    this.pauseThreshold = 1000; // ms
    this.pauses = [];
  }

  // Start recording timing information
  startRecording() {
    this.startTime = Date.now();
    this.lastSpeechTimestamp = this.startTime;
    this.transcriptParts = [];
    this.pauses = [];
    
    // Return default values initially
    return {
      fluencyScore: 70,
      confidenceScore: 65,
      speakingRate: 120,
      vocabularyDiversity: 0.5,
    };
  }
  
  // Record an interim transcript part
  addInterimTranscript(text, timestamp = Date.now()) {
    if (text && text.trim()) {
      // Calculate pause since last speech
      const currentTime = timestamp;
      if (this.lastSpeechTimestamp) {
        const pauseDuration = currentTime - this.lastSpeechTimestamp;
        if (pauseDuration > this.pauseThreshold) {
          this.pauses.push(pauseDuration);
        }
      }
      
      this.transcriptParts.push({
        text: text.trim(),
        timestamp: currentTime
      });
      
      this.lastSpeechTimestamp = currentTime;
    }
  }
  
  // End recording and analyze the full transcript
  endRecording(finalTranscript) {
    this.endTime = Date.now();
    
    // If no transcript or no start time, return default values
    if (!finalTranscript || !this.startTime) {
      return {
        fluencyScore: 70,
        confidenceScore: 65,
        speakingRate: 120,
        vocabularyDiversity: 0.5,
      };
    }
    
    // Add the final transcript if not already added
    if (finalTranscript && (!this.transcriptParts.length || 
        this.transcriptParts[this.transcriptParts.length - 1].text !== finalTranscript)) {
      this.transcriptParts.push({
        text: finalTranscript,
        timestamp: this.endTime
      });
    }
    
    return this.analyzeTranscript(finalTranscript);
  }
  
  // Analyze the transcript for various speech metrics
  analyzeTranscript(transcript) {
    if (!transcript || !this.startTime || !this.endTime) {
      return {
        fluencyScore: 70,
        confidenceScore: 65,
        speakingRate: 120,
        vocabularyDiversity: 0.5,
      };
    }
    
    // Convert to lowercase for analysis
    const fullText = transcript.toLowerCase();
    
    // Split into words
    const words = fullText.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    
    if (totalWords === 0) {
      return {
        fluencyScore: 70,
        confidenceScore: 65,
        speakingRate: 120,
        vocabularyDiversity: 0.5,
      };
    }
    
    // Calculate speaking duration in minutes
    const durationMs = this.endTime - this.startTime;
    const durationMinutes = Math.max(0.1, durationMs / 60000); // Avoid division by zero
    
    // Speaking rate (words per minute)
    const speakingRate = Math.round(totalWords / durationMinutes);
    
    // Count filler words
    const fillerWordCount = words.filter(word => this.fillerWords.has(word)).length;
    
    // Calculate percentage of filler words
    const fillerWordPercentage = (fillerWordCount / totalWords) * 100;
    
    // Calculate pause frequency (pauses per minute)
    const pauseFrequency = this.pauses.length / durationMinutes;
    
    // Calculate vocabulary diversity (unique words / total words)
    const uniqueWords = new Set(words);
    const vocabularyDiversity = uniqueWords.size / totalWords;
    
    // Calculate fluency score (inverse relationship with filler words and pauses)
    let fluencyScore = Math.max(0, Math.min(100, 
      100 - (fillerWordPercentage * 5) - (pauseFrequency * 2)
    ));
    
    // Calculate confidence score based on multiple factors
    let speakingRateScore = 40; // Default
    
    // Adjust based on speaking rate
    if (speakingRate < 60) {
      // Too slow
      speakingRateScore = 20;
    } else if (speakingRate > 180) {
      // Too fast
      speakingRateScore = 30;
    } else if (speakingRate >= 120 && speakingRate <= 160) {
      // Ideal range
      speakingRateScore = 40;
    }
    
    const pauseScore = Math.max(0, 30 - (pauseFrequency * 5));
    const diversityScore = vocabularyDiversity * 30;
    
    const confidenceScore = Math.min(100, Math.max(0,
      speakingRateScore + pauseScore + diversityScore
    ));
    
    // Apply minimum thresholds to avoid unrealistically low scores
    fluencyScore = Math.max(40, fluencyScore);
    
    this.analysisResult = {
      fluencyScore: Math.round(fluencyScore),
      confidenceScore: Math.round(confidenceScore),
      fillerWordCount,
      speakingRate: Math.max(60, Math.min(180, speakingRate)), // Clamp to reasonable range
      pauseFrequency: Math.round(pauseFrequency * 100) / 100,
      vocabularyDiversity: Math.round(vocabularyDiversity * 100) / 100,
    };
    
    return this.analysisResult;
  }
}

export default SpeechAnalyzer;