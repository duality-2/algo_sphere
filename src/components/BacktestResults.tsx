import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar, Target } from "lucide-react";

// Stock price data with OHLC format for candlestick-like visualization
const stockPriceData = [
  { date: "Jan", open: 520, high: 550, low: 515, close: 545, volume: 2.1, signal: "buy" },
  { date: "Feb", open: 545, high: 580, low: 540, close: 575, volume: 2.3, signal: null },
  { date: "Mar", open: 575, high: 590, low: 560, close: 585, volume: 1.9, signal: null },
  { date: "Apr", open: 585, high: 620, low: 580, close: 610, volume: 2.5, signal: "sell" },
  { date: "May", open: 610, high: 630, low: 595, close: 625, volume: 2.2, signal: null },
  { date: "Jun", open: 625, high: 650, low: 620, close: 645, volume: 2.4, signal: "buy" },
];

const performanceData = [
  { month: "Jan", portfolio: 100000, benchmark: 100000 },
  { month: "Feb", portfolio: 105000, benchmark: 102000 },
  { month: "Mar", portfolio: 108000, benchmark: 104000 },
  { month: "Apr", portfolio: 112000, benchmark: 105000 },
  { month: "May", portfolio: 118000, benchmark: 107000 },
  { month: "Jun", portfolio: 125000, benchmark: 109000 },
];

const tradeDistribution = [
  { range: "< -5%", count: 2 },
  { range: "-5% to -2%", count: 5 },
  { range: "-2% to 0%", count: 8 },
  { range: "0% to 2%", count: 12 },
  { range: "2% to 5%", count: 15 },
  { range: "> 5%", count: 8 },
];

const metrics = [
  { label: "Total Return", value: "+25.0%", icon: TrendingUp, positive: true },
  { label: "Sharpe Ratio", value: "1.85", icon: Target, positive: true },
  { label: "Max Drawdown", value: "-8.2%", icon: TrendingDown, positive: false },
  { label: "Win Rate", value: "68%", icon: Percent, positive: true },
  { label: "Profit Factor", value: "2.3", icon: DollarSign, positive: true },
  { label: "Total Trades", value: "50", icon: Calendar, positive: true },
];

export function BacktestResults() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`h-4 w-4 ${metric.positive ? "text-profit" : "text-loss"}`} />
                <span className={`text-xl font-bold ${metric.positive ? "text-profit" : "text-loss"}`}>
                  {metric.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="stock-chart" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="stock-chart">Stock Chart</TabsTrigger>
          <TabsTrigger value="performance">Portfolio Performance</TabsTrigger>
          <TabsTrigger value="distribution">Trade Distribution</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
        </TabsList>

        <TabsContent value="stock-chart">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Stock Price Chart with Trading Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={stockPriceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value, name) => [
                      `₹${value}`,
                      name === 'high' ? 'High' : name === 'low' ? 'Low' : name === 'open' ? 'Open' : 'Close'
                    ]}
                  />
                  <Legend />
                  
                  {/* High-Low lines */}
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={1}
                    dot={false}
                    name="High"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={1}
                    dot={false}
                    name="Low"
                  />
                  
                  {/* Main price line (close) */}
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="hsl(var(--profit))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--profit))", strokeWidth: 2, r: 4 }}
                    name="Close Price"
                  />
                  
                  {/* Open price line */}
                  <Line
                    type="monotone"
                    dataKey="open"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Open Price"
                  />

                  {/* Buy/Sell signals */}
                  {stockPriceData.map((item, index) => {
                    if (item.signal === "buy") {
                      return <ReferenceLine key={`buy-${index}`} x={item.date} stroke="hsl(var(--profit))" strokeWidth={2} />;
                    }
                    if (item.signal === "sell") {
                      return <ReferenceLine key={`sell-${index}`} x={item.date} stroke="hsl(var(--loss))" strokeWidth={2} />;
                    }
                    return null;
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="portfolio"
                    stroke="hsl(var(--profit))"
                    fill="hsl(var(--profit))"
                    fillOpacity={0.3}
                    name="Portfolio"
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.1}
                    name="Benchmark"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Trade Return Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={tradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                    className="animate-chart-grow"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawdown">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Drawdown Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Current Drawdown</span>
                    <span className="text-loss">-2.3%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Max Drawdown</span>
                    <span className="text-loss">-8.2%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Average Drawdown</span>
                    <span className="text-loss">-3.5%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}