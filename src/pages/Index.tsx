import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { StrategyBuilder } from "@/components/StrategyBuilder";
import { BacktestResults } from "@/components/BacktestResults";
import { StrategyLibrary } from "@/components/StrategyLibrary";
import { AIDemo } from "@/components/AIDemo";
import Backtesting from "@/pages/Backtesting";
import Auth from "@/pages/Auth";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "builder":
        return <StrategyBuilder onNavigate={setActiveView} />;
      case "backtesting":
        return <Backtesting />;
      case "ai-demo":
        return <AIDemo />;
      case "backtest":
        return <BacktestResults />;
      case "library":
        return <StrategyLibrary />;
      case "execute":
        return <Dashboard />;
      case "auth":
        return <Auth onNavigate={setActiveView} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="container mx-auto px-6 py-8 animate-fade-in">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;