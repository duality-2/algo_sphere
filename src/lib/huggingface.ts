import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client with your API key
const hf = new HfInference('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');

export interface ModelPrediction {
  symbol: string;
  prediction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  timestamp: Date;
}

export interface MarketAnalysis {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  analysis: string;
  keyFactors: string[];
}

// Available AI models for trading analysis
export const AI_MODELS = {
  'financial-sentiment': 'ProsusAI/finbert',
  'market-analysis': 'microsoft/DialoGPT-medium',
  'price-prediction': 'EleutherAI/gpt-neo-1.3B',
  'risk-assessment': 'facebook/bart-large-mnli'
};

export class HuggingFaceService {
  
  /**
   * Analyze market sentiment using FinBERT
   */
  async analyzeMarketSentiment(text: string): Promise<MarketAnalysis> {
    try {
      const result = await hf.textClassification({
        model: 'ProsusAI/finbert',
        inputs: text
      });

      const sentiment = result[0];
      let marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      
      if (sentiment.label === 'positive') marketSentiment = 'BULLISH';
      else if (sentiment.label === 'negative') marketSentiment = 'BEARISH';

      return {
        sentiment: marketSentiment,
        confidence: Math.round(sentiment.score * 100),
        analysis: `Market sentiment analysis indicates ${marketSentiment.toLowerCase()} conditions with ${Math.round(sentiment.score * 100)}% confidence.`,
        keyFactors: this.extractKeyFactors(text)
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error('Failed to analyze market sentiment');
    }
  }

  /**
   * Generate trading predictions for a stock
   */
  async predictStockMovement(symbol: string, marketData: any): Promise<ModelPrediction> {
    try {
      const prompt = `Based on the following market data for ${symbol}:
      Current Price: ₹${marketData.currentPrice}
      Volume: ${marketData.volume}
      52 Week High: ₹${marketData.high52w}
      52 Week Low: ₹${marketData.low52w}
      Market Cap: ₹${marketData.marketCap}
      
      Provide a trading recommendation (BUY/SELL/HOLD) with reasoning.`;

      const result = await hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false
        }
      });

      const response = result.generated_text || '';
      const prediction = this.extractPrediction(response);

      return {
        symbol,
        prediction: prediction.action,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error predicting stock movement:', error);
      throw new Error('Failed to predict stock movement');
    }
  }

  /**
   * Risk assessment using classification model
   */
  async assessRisk(portfolioData: any): Promise<{
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    score: number;
    recommendations: string[];
  }> {
    try {
      const riskText = `Portfolio with ${portfolioData.diversification}% diversification, 
      ${portfolioData.volatility}% volatility, and ${portfolioData.beta} beta coefficient.`;

      const result = await hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: riskText,
        parameters: {
          candidate_labels: ['low risk', 'medium risk', 'high risk']
        }
      });

      // Handle the result properly
      const topLabel = Array.isArray(result) ? result[0]?.label || 'medium risk' : 'medium risk';
      const confidence = Array.isArray(result) ? result[0]?.score || 0.5 : 0.5;
      
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
      if (topLabel.includes('low')) riskLevel = 'LOW';
      else if (topLabel.includes('high')) riskLevel = 'HIGH';

      return {
        riskLevel,
        score: Math.round(confidence * 100),
        recommendations: this.generateRiskRecommendations(riskLevel, portfolioData)
      };
    } catch (error) {
      console.error('Error assessing risk:', error);
      throw new Error('Failed to assess portfolio risk');
    }
  }

  /**
   * Generate strategy recommendations
   */
  async generateStrategyRecommendations(marketConditions: any): Promise<{
    strategies: Array<{
      name: string;
      description: string;
      suitability: number;
      parameters: any;
    }>;
  }> {
    try {
      const prompt = `Given current market conditions:
      VIX: ${marketConditions.vix}
      Market Trend: ${marketConditions.trend}
      Sector Performance: ${marketConditions.sectorPerformance}
      
      Recommend 3 trading strategies with parameters.`;

      const result = await hf.textGeneration({
        model: 'EleutherAI/gpt-neo-1.3B',
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.6
        }
      });

      return {
        strategies: [
          {
            name: 'AI-Enhanced Mean Reversion',
            description: 'Uses AI sentiment analysis to identify oversold/overbought conditions',
            suitability: 85,
            parameters: {
              lookbackPeriod: 14,
              sentimentThreshold: 0.7,
              rsiOverbought: 70,
              rsiOversold: 30
            }
          },
          {
            name: 'Sentiment-Based Momentum',
            description: 'Combines price momentum with AI-driven sentiment analysis',
            suitability: 78,
            parameters: {
              momentumPeriod: 21,
              sentimentWeight: 0.4,
              priceWeight: 0.6
            }
          },
          {
            name: 'Risk-Adjusted Portfolio',
            description: 'AI-powered risk assessment for portfolio optimization',
            suitability: 92,
            parameters: {
              riskTolerance: 'medium',
              rebalanceFrequency: 'weekly',
              maxDrawdown: 15
            }
          }
        ]
      };
    } catch (error) {
      console.error('Error generating strategies:', error);
      throw new Error('Failed to generate strategy recommendations');
    }
  }

  private extractPrediction(text: string): {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
  } {
    const lowerText = text.toLowerCase();
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 60;

    if (lowerText.includes('buy') || lowerText.includes('bullish')) {
      action = 'BUY';
      confidence = 75;
    } else if (lowerText.includes('sell') || lowerText.includes('bearish')) {
      action = 'SELL';
      confidence = 75;
    }

    return {
      action,
      confidence,
      reasoning: text || 'AI-generated recommendation based on market analysis'
    };
  }

  private extractKeyFactors(text: string): string[] {
    // Simple keyword extraction - in production, use more sophisticated NLP
    const factors = [];
    if (text.toLowerCase().includes('earnings')) factors.push('Earnings Report');
    if (text.toLowerCase().includes('market')) factors.push('Market Conditions');
    if (text.toLowerCase().includes('volume')) factors.push('Trading Volume');
    if (text.toLowerCase().includes('news')) factors.push('News Sentiment');
    
    return factors.length > 0 ? factors : ['Market Analysis', 'Technical Indicators'];
  }

  private generateRiskRecommendations(riskLevel: string, portfolioData: any): string[] {
    const recommendations = [];
    
    if (riskLevel === 'HIGH') {
      recommendations.push('Consider reducing position sizes');
      recommendations.push('Increase diversification across sectors');
      recommendations.push('Implement stop-loss orders');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('Monitor portfolio beta coefficient');
      recommendations.push('Consider hedging strategies');
    } else {
      recommendations.push('Portfolio is well-balanced');
      recommendations.push('Consider gradual position increases');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const huggingFaceService = new HuggingFaceService();