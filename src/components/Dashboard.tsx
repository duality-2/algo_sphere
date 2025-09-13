ti import { MarketOverview } from "./MarketOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
} from "lucide-react";
import { BacktestSetup } from "./BacktestSetup";

const portfolioData = [
  { time: "09:30", value: 100000 },
  { time: "10:00", value: 100500 },
  { time: "10:30", value: 101200 },
  { time: "11:00", value: 100800 },
  { time: "11:30", value: 101500 },
  { time: "12:00", value: 102000 },
  { time: "12:30", value: 102300 },
  { time: "13:00", value: 102800 },
];

const activeStrategies = [
  { name: "Golden Cross", status: "Active", pnl: 2500, pnlPercent: 2.5 },
  { name: "RSI Divergence", status: "Active", pnl: -350, pnlPercent: -0.35 },
  { name: "MACD Crossover", status: "Paused", pnl: 1200, pnlPercent: 1.2 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold">$102,800</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-profit" />
                  <span className="text-sm text-profit">+2.8%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's P&L</p>
                <p className="text-2xl font-bold text-profit">+$2,800</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-profit" />
                  <span className="text-sm text-muted-foreground">8 winning trades</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                <p className="text-2xl font-bold">72%</p>
                <Progress value={72} className="h-2 mt-2" />
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Strategies</p>
                <p className="text-2xl font-bold">3</p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="h-4 w-4 text-chart-3" />
                  <span className="text-sm text-muted-foreground">2 profitable</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backtesting Setup */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Backtesting Setup</h2>
        <BacktestSetup />
      </div>

      {/* Market Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Market Overview</h2>
        <MarketOverview />
      </div>

      {/* Portfolio Chart & Active Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Today's intraday performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--profit))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Active Strategies</CardTitle>
            <CardDescription>Currently running algorithms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeStrategies.map((strategy) => (
                <div key={strategy.name} className="p-3 rounded-lg bg-card/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{strategy.name}</span>
                    <Badge variant={strategy.status === "Active" ? "default" : "secondary"}>
                      {strategy.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">P&L</span>
                    <div className={`flex items-center gap-1 ${strategy.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {strategy.pnl >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span className="font-medium">
                        ${Math.abs(strategy.pnl).toLocaleString()} ({strategy.pnlPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="glass" className="w-full mt-2">
                View All Strategies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
