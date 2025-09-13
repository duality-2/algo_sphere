// Simple in-memory database simulation for demo purposes
// In production, you would use a real database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In production, this would be hashed
  createdAt: Date;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  blocks: Array<{
    id: string;
    type: string;
    name: string;
    value?: string;
    threshold?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  symbol: string;
  model: string;
  results: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
  };
  createdAt: Date;
}

// In-memory storage (replace with real database)
class InMemoryDatabase {
  private users: User[] = [];
  private strategies: Strategy[] = [];
  private backtestResults: BacktestResult[] = [];

  // User operations
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      id: `user_${Date.now()}`,
      createdAt: new Date(),
      ...userData,
    };
    this.users.push(user);
    return user;
  }

  findUserByEmail(email: string): User | null {
    return this.users.find(user => user.email === email) || null;
  }

  // Strategy operations
  createStrategy(strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Strategy {
    const strategy: Strategy = {
      id: `strategy_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...strategyData,
    };
    this.strategies.push(strategy);
    return strategy;
  }

  getStrategiesByUser(userId: string): Strategy[] {
    return this.strategies.filter(strategy => strategy.userId === userId);
  }

  updateStrategy(id: string, updates: Partial<Strategy>): Strategy | null {
    const index = this.strategies.findIndex(strategy => strategy.id === id);
    if (index === -1) return null;
    
    this.strategies[index] = {
      ...this.strategies[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.strategies[index];
  }

  // Backtest operations
  createBacktestResult(resultData: Omit<BacktestResult, 'id' | 'createdAt'>): BacktestResult {
    const result: BacktestResult = {
      id: `backtest_${Date.now()}`,
      createdAt: new Date(),
      ...resultData,
    };
    this.backtestResults.push(result);
    return result;
  }

  getBacktestResultsByStrategy(strategyId: string): BacktestResult[] {
    return this.backtestResults.filter(result => result.strategyId === strategyId);
  }
}

// Export singleton instance
export const db = new InMemoryDatabase();

// Auth utilities
export const authUtils = {
  async login(email: string, password: string): Promise<User | null> {
    const user = db.findUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  },

  async register(name: string, email: string, password: string): Promise<User | null> {
    // Check if user already exists
    if (db.findUserByEmail(email)) {
      throw new Error('User already exists');
    }
    
    return db.createUser({ name, email, password });
  },
};

// Strategy utilities
export const strategyUtils = {
  async saveStrategy(userId: string, name: string, blocks: any[]): Promise<Strategy> {
    return db.createStrategy({
      userId,
      name,
      blocks,
    });
  },

  async getUserStrategies(userId: string): Promise<Strategy[]> {
    return db.getStrategiesByUser(userId);
  },
};

// Backtest utilities
export const backtestUtils = {
  async runBacktest(strategyId: string, symbol: string, model: string): Promise<BacktestResult> {
    // Simulate backtest results
    const mockResults = {
      totalReturn: Math.random() * 50 - 10, // -10% to 40%
      sharpeRatio: Math.random() * 3,
      maxDrawdown: -(Math.random() * 20),
      winRate: Math.random() * 40 + 50, // 50% to 90%
      profitFactor: Math.random() * 2 + 0.5,
      totalTrades: Math.floor(Math.random() * 100) + 20,
    };

    return db.createBacktestResult({
      strategyId,
      symbol,
      model,
      results: mockResults,
    });
  },

  async getStrategyBacktests(strategyId: string): Promise<BacktestResult[]> {
    return db.getBacktestResultsByStrategy(strategyId);
  },
};