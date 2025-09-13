import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// Generate simple volatility data for each stock
const generateVolatilityData = (basePrice: number, volatility: number = 0.02) => {
  const data = [];
  let price = basePrice;
  for (let i = 0; i < 20; i++) {
    price += (Math.random() - 0.5) * basePrice * volatility;
    data.push({ value: price });
  }
  return data;
};

const marketData = [
  { symbol: "NIFTY", name: "Nifty 50", price: 19843.75, change: 134.20, changePercent: 0.68, volume: "2.3B", chartData: generateVolatilityData(19843.75) },
  { symbol: "SENSEX", name: "BSE Sensex", price: 66589.93, change: -89.83, changePercent: -0.13, volume: "1.8B", chartData: generateVolatilityData(66589.93) },
  { symbol: "BANKNIFTY", name: "Bank Nifty", price: 44287.65, change: 287.45, changePercent: 0.65, volume: "4.5B", chartData: generateVolatilityData(44287.65) },
  { symbol: "FINNIFTY", name: "Fin Nifty", price: 19456.80, change: -45.30, changePercent: -0.23, volume: "8.9M", chartData: generateVolatilityData(19456.80) },
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
            <div className="space-y-3">
              <div className="text-2xl font-bold">₹{item.price.toFixed(2)}</div>
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
              <div className="h-12 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={item.change >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} 
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}