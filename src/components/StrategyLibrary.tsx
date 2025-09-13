import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Copy, TrendingUp, Shield, Zap, Brain } from "lucide-react";
import { toast } from "sonner";

const strategies = [
  {
    id: 1,
    name: "Golden Cross Strategy",
    description: "Buy when 50-day MA crosses above 200-day MA",
    category: "Trend Following",
    winRate: 65,
    avgReturn: 12.5,
    risk: "Medium",
    icon: <TrendingUp className="h-5 w-5" />,
    tags: ["Moving Average", "Long Term"],
  },
  {
    id: 2,
    name: "RSI Divergence",
    description: "Trade based on RSI divergence patterns",
    category: "Momentum",
    winRate: 72,
    avgReturn: 8.3,
    risk: "Low",
    icon: <Zap className="h-5 w-5" />,
    tags: ["RSI", "Divergence"],
  },
  {
    id: 3,
    name: "Bollinger Band Squeeze",
    description: "Trade breakouts from volatility contraction",
    category: "Volatility",
    winRate: 68,
    avgReturn: 15.2,
    risk: "High",
    icon: <Shield className="h-5 w-5" />,
    tags: ["Bollinger Bands", "Breakout"],
  },
  {
    id: 4,
    name: "MACD Crossover",
    description: "Signal line crossover strategy",
    category: "Trend Following",
    winRate: 61,
    avgReturn: 10.1,
    risk: "Medium",
    icon: <Brain className="h-5 w-5" />,
    tags: ["MACD", "Crossover"],
  },
];

export function StrategyLibrary() {
  const handleUseStrategy = (strategyName: string) => {
    toast.success(`Loading ${strategyName} into builder`);
  };

  const handleViewDetails = (strategyName: string) => {
    toast.info(`Opening details for ${strategyName}`);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-profit/20 text-profit";
      case "Medium":
        return "bg-chart-4/20 text-chart-4";
      case "High":
        return "bg-loss/20 text-loss";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle>Strategy Library</CardTitle>
        <CardDescription>Pre-built strategies ready to backtest</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className="bg-card/50 border-border/50 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        {strategy.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{strategy.name}</h3>
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      </div>
                    </div>
                    <Badge className={getRiskColor(strategy.risk)}>{strategy.risk} Risk</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Win Rate</span>
                      <p className="font-medium text-profit">{strategy.winRate}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Return</span>
                      <p className="font-medium text-profit">+{strategy.avgReturn}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="font-medium">{strategy.category}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {strategy.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(strategy.name)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="profit"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUseStrategy(strategy.name)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}