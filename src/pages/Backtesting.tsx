import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BacktestResults } from "@/components/BacktestResults";

export default function Backtesting() {
  const [model, setModel] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [ran, setRan] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Backtesting Setup</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">Model</label>
            <Select onValueChange={setModel} value={model}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Crossover</SelectItem>
                <SelectItem value="rsi">RSI Mean Revert</SelectItem>
                <SelectItem value="macd">MACD Trend Follow</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block text-muted-foreground">Stock Symbol</label>
            <Input placeholder="e.g. AAPL" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => setRan(true)} disabled={!model || !symbol}>
              Run Backtest
            </Button>
          </div>
        </CardContent>
      </Card>

      {ran && <BacktestResults />}
    </div>
  );
}
