import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from "lucide-react";

const marketData = [
  { symbol: "SPY", name: "S&P 500", price: 438.52, change: 2.34, changePercent: 0.54, volume: "89.2M" },
  { symbol: "QQQ", name: "NASDAQ", price: 367.89, change: -1.23, changePercent: -0.33, volume: "52.1M" },
  { symbol: "DIA", name: "Dow Jones", price: 342.67, change: 0.89, changePercent: 0.26, volume: "4.3M" },
  { symbol: "IWM", name: "Russell 2000", price: 178.45, change: 1.56, changePercent: 0.88, volume: "31.5M" },
];

export function MarketOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {marketData.map((item) => (
        <Card key={item.symbol} className="bg-gradient-card border-border/50 hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="text-muted-foreground">{item.symbol}</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">${item.price.toFixed(2)}</div>
              <div className={`flex items-center gap-1 text-sm ${item.change >= 0 ? "text-profit" : "text-loss"}`}>
                {item.change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.changePercent >= 0 ? "+" : ""}{item.changePercent}%)
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Vol: {item.volume}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}