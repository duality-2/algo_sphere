import { Button } from "@/components/ui/button";
import { Activity, BarChart3, BookOpen, Settings, User, LogOut, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "builder", label: "Strategy Builder", icon: BarChart3 },
    { id: "backtesting", label: "Backtesting", icon: BookOpen },
    { id: "ai-demo", label: "AI Demo", icon: Brain },
    { id: "library", label: "Strategy Library", icon: Settings },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-card/50 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AlgoTrade Pro
            </h1>
            <p className="text-xs text-muted-foreground">Professional Trading Platform</p>
          </div>
        </div>

        <div className="flex gap-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "transition-all",
                activeView === item.id && "shadow-glow-profit"
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onViewChange("auth")}>
          <User className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}