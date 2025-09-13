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
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar, Target } from "lucide-react";

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

// Candlestick component using Bar for wick and body
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isBullish = close > open;
  const color = isBullish ? "hsl(var(--profit))" : "hsl(var(--loss))";

  return (
    <g>
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={color} />
      <rect
        x={x}
        y={isBullish ? y + (open - close) : y}
        width={width}
        height={Math.abs(open - close)}
        fill={color}
      />
    </g>
  );
};

export function BacktestResults() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Trade Distribution</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
        </TabsList>

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
        
        <TabsContent value="candlestick">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Candlestick Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={[] /* Replace with backtestResults.candlestickData */}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="Date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    domain={['auto', 'auto']}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="ohlc" shape={<Candlestick />} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
