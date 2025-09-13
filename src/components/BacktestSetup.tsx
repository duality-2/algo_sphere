
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";

interface Stock {
  Symbol: string;
  "Company Name": string;
}

export function BacktestSetup() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>("");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/stocks");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
        toast.error("Failed to load stocks. Please ensure the backend is running.");
      }
    };

    fetchStocks();
  }, []);

  const handleRunBacktest = () => {
    if (!selectedStock) {
      toast.error("Please select a stock to run the backtest.");
      return;
    }
    toast.success(`Running backtest for ${selectedStock}...`);
    // Here you would typically make an API call to run the backtest
  };

  return (
    <div className="bg-gradient-card border-border/50 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label htmlFor="model" className="text-sm font-medium text-muted-foreground">Model</label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Basic Crossover" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic-crossover">Basic Crossover</SelectItem>
              <SelectItem value="rsi-momentum">RSI Momentum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label htmlFor="stock" className="text-sm font-medium text-muted-foreground">Stock Symbol</label>
          <Select onValueChange={setSelectedStock} value={selectedStock}>
            <SelectTrigger id="stock" className="w-full">
              <SelectValue placeholder="e.g. AAPL" />
            </SelectTrigger>
            <SelectContent>
              {stocks.map((stock) => (
                <SelectItem key={stock.Symbol} value={stock.Symbol}>
                  {stock.Symbol} - {stock["Company Name"]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="self-end">
          <Button variant="profit" className="w-full" onClick={handleRunBacktest}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Run Backtest
          </Button>
        </div>
      </div>
    </div>
  );
}
