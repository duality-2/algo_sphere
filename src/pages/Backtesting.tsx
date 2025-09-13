import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BacktestResults } from "@/components/BacktestResults";
import { Badge } from "@/components/ui/badge";
import Papa from "papaparse";
import { huggingFaceService, AI_MODELS } from "@/lib/huggingface";
import { toast } from "sonner";
import { Brain, TrendingUp, Shield, BarChart3 } from "lucide-react";

interface Stock {
  TICKER: string;
  NAME: string;
}

export default function Backtesting() {
  const [model, setModel] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [ran, setRan] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("basic");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch("/data.csv");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        const result = await reader?.read();
        const decoder = new TextDecoder("utf-8");
        const csv = decoder.decode(result?.value);
        
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(), // Remove any whitespace from headers
          transform: (value) => value.trim(), // Remove any whitespace from values
          complete: (results) => {
            console.log("Parsed stocks:", results.data);
            setStocks(results.data as Stock[]);
            if (results.data.length === 0) {
              toast.error("No stocks loaded from CSV file");
            } else {
              toast.success(`Loaded ${results.data.length} stocks`);
            }
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            toast.error("Failed to parse stock data");
          }
        });
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
        toast.error("Failed to load stock data");
      }
    };
    fetchStocks();
  }, []);

  const runAiAnalysis = async () => {
    if (!symbol) {
      toast.error("Please select a stock symbol first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const mockMarketData = {
        currentPrice: 1250,
        volume: 2500000,
        high52w: 1450,
        low52w: 980,
        marketCap: 125000000000
      };

      toast.info("Starting AI analysis...");

      if (selectedAiModel === "sentiment") {
        const sentiment = await huggingFaceService.analyzeMarketSentiment(
          `${symbol} stock showing strong quarterly results with increased market share in Indian automobile sector`
        );
        setAiAnalysis({
          type: 'sentiment',
          data: sentiment
        });
        toast.success("AI sentiment analysis completed!");
      } else if (selectedAiModel === "prediction") {
        const prediction = await huggingFaceService.predictStockMovement(symbol, mockMarketData);
        setAiAnalysis({
          type: 'prediction',
          data: prediction
        });
        toast.success("AI prediction generated!");
      } else if (selectedAiModel === "risk") {
        const riskAssessment = await huggingFaceService.assessRisk({
          diversification: 75,
          volatility: 18,
          beta: 1.2
        });
        setAiAnalysis({
          type: 'risk',
          data: riskAssessment
        });
        toast.success("Risk assessment completed!");
      } else {
        // For basic analysis, show a mock result
        setAiAnalysis({
          type: 'basic',
          data: {
            analysis: `Traditional technical analysis suggests ${symbol} is showing moderate bullish signals based on moving averages and volume patterns.`,
            recommendation: 'HOLD',
            confidence: 72
          }
        });
        toast.success("Traditional analysis completed!");
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
      toast.error("AI analysis failed. Using fallback analysis...");
      
      // Fallback mock analysis if AI fails
      setAiAnalysis({
        type: 'fallback',
        data: {
          analysis: `Technical analysis for ${symbol}: Stock shows consolidation pattern with potential for breakout. RSI indicates neutral momentum.`,
          recommendation: 'HOLD',
          confidence: 65
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runBacktest = () => {
    if (!model || !symbol) {
      toast.error("Please select both a strategy model and stock symbol");
      return;
    }
    
    toast.success(`Running backtest for ${symbol} using ${model} strategy...`);
    setRan(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Backtesting Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">Strategy Model</label>
            <Select onValueChange={setModel} value={model}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Crossover</SelectItem>
                <SelectItem value="rsi">RSI Mean Revert</SelectItem>
                <SelectItem value="macd">MACD Trend Follow</SelectItem>
                <SelectItem value="ai-enhanced">🤖 AI-Enhanced Strategy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">Stock Symbol</label>
            <Select onValueChange={setSymbol} value={symbol}>
              <SelectTrigger>
                <SelectValue placeholder="Select a stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.length > 0 ? (
                  stocks.map((stock) => (
                    <SelectItem key={stock.TICKER} value={stock.TICKER}>
                      {stock.TICKER} - {stock.NAME}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading stocks...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">AI Model</label>
            <Select onValueChange={setSelectedAiModel} value={selectedAiModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Traditional Analysis</SelectItem>
                <SelectItem value="sentiment">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Sentiment Analysis
                  </div>
                </SelectItem>
                <SelectItem value="prediction">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Price Prediction
                  </div>
                </SelectItem>
                <SelectItem value="risk">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Assessment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button 
              className="flex-1" 
              onClick={runBacktest} 
              disabled={!model || !symbol}
              variant="default"
            >
              Run Backtest
            </Button>
            <Button 
              variant="outline" 
              onClick={runAiAnalysis}
              disabled={!symbol || isAnalyzing}
              className="px-3"
            >
              {isAnalyzing ? (
                <Brain className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Analysis Results
              <Badge variant="secondary" className="ml-2">
                Powered by Hugging Face
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiAnalysis.type === 'sentiment' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {aiAnalysis.data.sentiment}
                  </div>
                  <Badge 
                    variant={aiAnalysis.data.sentiment === 'BULLISH' ? 'default' : 
                            aiAnalysis.data.sentiment === 'BEARISH' ? 'destructive' : 'secondary'}
                  >
                    {aiAnalysis.data.confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-muted-foreground">{aiAnalysis.data.analysis}</p>
                <div className="flex gap-2">
                  {aiAnalysis.data.keyFactors.map((factor: string, index: number) => (
                    <Badge key={index} variant="outline">{factor}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {aiAnalysis.type === 'prediction' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalysis.data.prediction}
                  </div>
                  <Badge variant="default">
                    {aiAnalysis.data.confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-muted-foreground">{aiAnalysis.data.reasoning}</p>
              </div>
            )}

            {aiAnalysis.type === 'risk' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">
                    {aiAnalysis.data.riskLevel} RISK
                  </div>
                  <Badge 
                    variant={aiAnalysis.data.riskLevel === 'LOW' ? 'default' : 
                            aiAnalysis.data.riskLevel === 'HIGH' ? 'destructive' : 'secondary'}
                  >
                    Score: {aiAnalysis.data.score}/100
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {aiAnalysis.data.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {(aiAnalysis.type === 'basic' || aiAnalysis.type === 'fallback') && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalysis.data.recommendation}
                  </div>
                  <Badge variant="default">
                    {aiAnalysis.data.confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-muted-foreground">{aiAnalysis.data.analysis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {ran && <BacktestResults />}
    </div>
  );
}
