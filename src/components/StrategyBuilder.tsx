import { useState } from "react";
import { StrategyBlock } from "./StrategyBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  TrendingUp,
  Activity,
  Zap,
  ShoppingCart,
  DollarSign,
  Target,
  AlertTriangle,
  BarChart3,
  LineChart,
  Gauge,
  ArrowUpDown,
  TrendingDown,
  PlayCircle,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

const indicators = [
  { id: "sma", name: "SMA", description: "Simple Moving Average", icon: <LineChart className="h-5 w-5" /> },
  { id: "ema", name: "EMA", description: "Exponential Moving Average", icon: <Activity className="h-5 w-5" /> },
  { id: "rsi", name: "RSI", description: "Relative Strength Index", icon: <Gauge className="h-5 w-5" /> },
  { id: "macd", name: "MACD", description: "Moving Average Convergence", icon: <ArrowUpDown className="h-5 w-5" /> },
  { id: "bb", name: "Bollinger Bands", description: "Volatility indicator", icon: <BarChart3 className="h-5 w-5" /> },
];

const conditions = [
  { id: "cross-above", name: "Cross Above", description: "Price crosses above indicator", icon: <TrendingUp className="h-5 w-5" /> },
  { id: "cross-below", name: "Cross Below", description: "Price crosses below indicator", icon: <TrendingDown className="h-5 w-5" /> },
  { id: "greater-than", name: "Greater Than", description: "Value is greater than threshold", icon: <Zap className="h-5 w-5" /> },
  { id: "less-than", name: "Less Than", description: "Value is less than threshold", icon: <AlertTriangle className="h-5 w-5" /> },
];

const actions = [
  { id: "buy", name: "Buy", description: "Open long position", icon: <ShoppingCart className="h-5 w-5" /> },
  { id: "sell", name: "Sell", description: "Close position", icon: <DollarSign className="h-5 w-5" /> },
  { id: "stop-loss", name: "Stop Loss", description: "Set stop loss order", icon: <Target className="h-5 w-5" /> },
  { id: "take-profit", name: "Take Profit", description: "Set take profit order", icon: <Target className="h-5 w-5" /> },
];

interface DroppedBlock {
  id: string;
  type: string;
  name: string;
  instanceId: string;
}

interface StrategyBuilderProps {
  onNavigate?: (view: string) => void;
}

export function StrategyBuilder({ onNavigate }: StrategyBuilderProps) {
  const [droppedBlocks, setDroppedBlocks] = useState<DroppedBlock[]>([]);
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    
    const blockId = e.dataTransfer.getData("blockId");
    const blockType = e.dataTransfer.getData("blockType");
    const blockName = e.dataTransfer.getData("blockName");
    
    if (blockId && blockType && blockName) {
      const newBlock: DroppedBlock = {
        id: blockId,
        type: blockType,
        name: blockName,
        instanceId: `${blockId}-${Date.now()}`,
      };
      
      setDroppedBlocks([...droppedBlocks, newBlock]);
      toast.success(`Added ${blockName} to strategy`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const removeBlock = (instanceId: string) => {
    setDroppedBlocks(droppedBlocks.filter(b => b.instanceId !== instanceId));
    toast.success("Block removed from strategy");
  };

  const clearStrategy = () => {
    setDroppedBlocks([]);
    toast.success("Strategy cleared");
  };

  const saveStrategy = () => {
    if (droppedBlocks.length === 0) {
      toast.error("Cannot save empty strategy");
      return;
    }
    toast.success("Strategy saved successfully");
  };

  const getBlockIcon = (block: DroppedBlock) => {
    const allBlocks = [...indicators, ...conditions, ...actions];
    const foundBlock = allBlocks.find(b => b.id === block.id);
    return foundBlock?.icon || <Activity className="h-5 w-5" />;
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case "indicator":
        return "border-chart-1";
      case "condition":
        return "border-chart-3";
      case "action":
        return "border-profit";
      default:
        return "border-border";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Block Library */}
      <Card className="lg:col-span-1 bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Strategy Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Indicators</h3>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {indicators.map((indicator) => (
                  <StrategyBlock
                    key={indicator.id}
                    id={indicator.id}
                    type="indicator"
                    name={indicator.name}
                    description={indicator.description}
                    icon={indicator.icon}
                    color="border-chart-1"
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Conditions</h3>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <StrategyBlock
                    key={condition.id}
                    id={condition.id}
                    type="condition"
                    name={condition.name}
                    description={condition.description}
                    icon={condition.icon}
                    color="border-chart-3"
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Actions</h3>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {actions.map((action) => (
                  <StrategyBlock
                    key={action.id}
                    id={action.id}
                    type="action"
                    name={action.name}
                    description={action.description}
                    icon={action.icon}
                    color="border-profit"
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Canvas */}
      <Card className="lg:col-span-2 bg-gradient-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Strategy Canvas</CardTitle>
          <div className="flex gap-2">
            <Button variant="glass" size="sm" onClick={saveStrategy}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="glass" size="sm" onClick={clearStrategy}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "min-h-[500px] rounded-lg border-2 border-dashed p-4 transition-colors",
              draggedOver ? "border-primary bg-primary/5" : "border-border",
              droppedBlocks.length === 0 && "flex items-center justify-center"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {droppedBlocks.length === 0 ? (
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Drag and drop components here to build your strategy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {droppedBlocks.map((block, index) => (
                  <div key={block.instanceId} className="relative group animate-fade-in">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 text-xs text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className={cn(
                      "flex items-center gap-3 rounded-lg border-2 bg-card p-3",
                      getBlockColor(block.type)
                    )}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                        {getBlockIcon(block)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{block.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{block.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => removeBlock(block.instanceId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {index < droppedBlocks.length - 1 && (
                      <div className="flex justify-center my-2">
                        <div className="w-0.5 h-4 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="profit" className="flex-1" onClick={() => onNavigate?.("backtesting")}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Run Backtest
            </Button>
            <Button variant="glass" onClick={() => { onNavigate?.("execute"); toast.info("Execute flow not yet implemented"); }}>
              <Zap className="h-4 w-4 mr-2" />
              Live Execute
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}