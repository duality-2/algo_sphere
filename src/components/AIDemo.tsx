import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { huggingFaceService } from "@/lib/huggingface";
import { toast } from "sonner";
import { Brain, TrendingUp, Shield, MessageSquare } from "lucide-react";

export function AIDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testSentimentAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await huggingFaceService.analyzeMarketSentiment(
        "Reliance Industries reported strong quarterly earnings with revenue growth of 15% and increased market share in retail and telecommunications sectors. The company announced major expansion plans in renewable energy."
      );
      setResults({ type: 'sentiment', data: result });
      toast.success("Sentiment analysis completed!");
    } catch (error) {
      toast.error("Failed to analyze sentiment");
    } finally {
      setIsLoading(false);
    }
  };

  const testPrediction = async () => {
    setIsLoading(true);
    try {
      const result = await huggingFaceService.predictStockMovement("RELIANCE", {
        currentPrice: 2450,
        volume: 1500000,
        high52w: 2700,
        low52w: 2100,
        marketCap: 1650000000000
      });
      setResults({ type: 'prediction', data: result });
      toast.success("AI prediction generated!");
    } catch (error) {
      toast.error("Failed to generate prediction");
    } finally {
      setIsLoading(false);
    }
  };

  const testRiskAssessment = async () => {
    setIsLoading(true);
    try {
      const result = await huggingFaceService.assessRisk({
        diversification: 65,
        volatility: 22,
        beta: 1.35
      });
      setResults({ type: 'risk', data: result });
      toast.success("Risk assessment completed!");
    } catch (error) {
      toast.error("Failed to assess risk");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Models Demo
            <Badge variant="secondary">Powered by Hugging Face</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testSentimentAnalysis}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <MessageSquare className="h-6 w-6" />
              <span>Test Sentiment Analysis</span>
            </Button>
            
            <Button 
              onClick={testPrediction}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>Test Price Prediction</span>
            </Button>
            
            <Button 
              onClick={testRiskAssessment}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Shield className="h-6 w-6" />
              <span>Test Risk Assessment</span>
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Brain className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">AI is thinking...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>AI Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.type === 'sentiment' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {results.data.sentiment}
                  </div>
                  <Badge 
                    variant={results.data.sentiment === 'BULLISH' ? 'default' : 
                            results.data.sentiment === 'BEARISH' ? 'destructive' : 'secondary'}
                  >
                    {results.data.confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-muted-foreground">{results.data.analysis}</p>
              </div>
            )}
            
            {results.type === 'prediction' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    {results.data.prediction}
                  </div>
                  <Badge variant="default">
                    {results.data.confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-muted-foreground">{results.data.reasoning}</p>
              </div>
            )}

            {results.type === 'risk' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {results.data.riskLevel} RISK
                  </div>
                  <Badge 
                    variant={results.data.riskLevel === 'LOW' ? 'default' : 
                            results.data.riskLevel === 'HIGH' ? 'destructive' : 'secondary'}
                  >
                    Score: {results.data.score}/100
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {results.data.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}