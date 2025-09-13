import pandas as pd
import numpy as np
import pandas_ta as ta
import yfinance as yf
import joblib
import warnings
from . import strategies

# --- Artifact Registry for Multiple Model Sets ---
print("Loading all ML artifact sets...")
ARTIFACT_REGISTRY = {}
MODEL_SETS = {
    "SetA": {"rf": "rf_model.pkl", "gb": "gb_model.pkl"},
    "SetB": {"rf": "rf1_model.pkl", "gb": "gb1_model.pkl"}
}

for set_name, files in MODEL_SETS.items():
    try:
        ARTIFACT_REGISTRY[set_name] = {
            "RandomForest": joblib.load(f"./trained_models/{files['rf']}"),
            "GradientBoosting": joblib.load(f"./trained_models/{files['gb']}")
        }
        print(f"✅ ML artifact set '{set_name}' loaded successfully.")
    except FileNotFoundError as e:
        print(f"❌ Could not load artifact set '{set_name}'. It will be unavailable. Error: {e}")


def get_ml_predictions(model_set_name: str, model_name: str, data: pd.DataFrame):
    if model_set_name not in ARTIFACT_REGISTRY:
        warnings.warn(f"Model set '{model_set_name}' not available. Skipping ML predictions.")
        return pd.Series(0, index=data.index)

    artifacts = ARTIFACT_REGISTRY[model_set_name]
    
    # THIS IS A CRITICAL PLACEHOLDER
    # You must replace this with the *exact* same feature engineering steps used in your training notebook.
    feature_columns = ['Open', 'High', 'Low', 'Close', 'Volume'] # Placeholder - REPLACE ME
    features = data[feature_columns].copy()
    features.dropna(inplace=True)

    if features.empty:
        return pd.Series(0, index=data.index)

    if model_name == "Ensemble":
        pred_rf = artifacts["RandomForest"].predict(features)
        pred_gb = artifacts["GradientBoosting"].predict(features)
        predictions = (pred_rf + pred_gb) / 2
    elif model_name in artifacts:
        model = artifacts[model_name]
        predictions = model.predict(features)
    else:
        return pd.Series(0, index=data.index)

    return pd.Series(predictions, index=features.index)

def calculate_performance_metrics(equity_curve: pd.Series):
    """Calculates key performance metrics from an equity curve."""
    if equity_curve.empty or equity_curve.iloc[0] == 0:
        return {
            "total_return_pct": 0,
            "annualized_return_pct": 0,
            "sharpe_ratio": 0,
            "max_drawdown_pct": 0
        }

    total_return_pct = (equity_curve.iloc[-1] / equity_curve.iloc[0] - 1) * 100
    
    # Calculate annualized return
    days = (equity_curve.index[-1] - equity_curve.index[0]).days
    if days > 0:
        annualized_return_pct = ((1 + total_return_pct / 100) ** (365.0 / days) - 1) * 100
    else:
        annualized_return_pct = 0

    # Calculate Sharpe Ratio
    daily_returns = equity_curve.pct_change().dropna()
    if daily_returns.std() > 0:
        # Assuming risk-free rate is 0
        sharpe_ratio = (daily_returns.mean() / daily_returns.std()) * np.sqrt(252)
    else:
        sharpe_ratio = 0

    # Calculate Max Drawdown
    rolling_max = equity_curve.cummax()
    drawdown = (equity_curve - rolling_max) / rolling_max
    max_drawdown_pct = drawdown.min() * 100

    return {
        "total_return_pct": round(total_return_pct, 2),
        "annualized_return_pct": round(annualized_return_pct, 2),
        "sharpe_ratio": round(sharpe_ratio, 2),
        "max_drawdown_pct": round(max_drawdown_pct, 2)
    }

def run_simulation(strategy_json: dict, ticker: str, start_date: str, end_date: str):
    strategy_type = strategy_json.get("strategyType")
    ml_model_set = strategy_json.get("ml_model_set")
    ml_model_name = strategy_json.get("ml_model")
    
    # 1. Fetch and prepare data
    data = yf.download(ticker, start=start_date, end=end_date, progress=False)
    if data.empty: raise ValueError("No data fetched.")
    
    # Ensure OHLC data is present
    ohlc_columns = ['Open', 'High', 'Low', 'Close']
    if not all(col in data.columns for col in ohlc_columns):
        raise ValueError("OHLC data not found in yfinance download.")

    # 2. Get signals from the base technical strategy
    if strategy_type == "TrendFollowing":
        data = strategies.momentum_strategy(data)
    elif strategy_type == "MeanReversion":
        data = strategies.mean_reversion_strategy(data)
    elif strategy_type == "Volatility":
        data = strategies.volatility_strategy(data)
    else:
        raise ValueError(f"Unknown strategy type: {strategy_type}")

    # 3. Get ML predictions if a model is selected
    if ml_model_set and ml_model_name:
        print(f"Generating predictions with {ml_model_name} from {ml_model_set}...")
        ml_preds = get_ml_predictions(ml_model_set, ml_model_name, data)
        data = data.join(ml_preds.rename('ml_prediction')).fillna(0)
        # --- Signal Combination Logic ---
        # Here we decide how to combine the technical signal and the ML signal.
        # Let's use the ML prediction as a confirmation filter.
        # 1 means ML confirms, 0 means ML does not.
        # A threshold of 0.5 is common for binary classifiers.
        ml_confirmation = (data['ml_prediction'] > 0.5).astype(int)
        data['buy_signal'] = data['buy_signal'] & ml_confirmation
        # For selling, we might not need ML confirmation, or we could use a different logic.
        # Here, we'll stick to the technical sell signal.
        data['sell_signal'] = data['sell_signal']
    
    # 4. Core Simulation Loop
    initial_cash = 100000
    cash = initial_cash
    shares = 0
    equity = []

    for date, row in data.iterrows():
        current_price = row['Close']
        
        # Sell Logic
        if row['sell_signal'] and shares > 0:
            cash = shares * current_price
            shares = 0
            # print(f"{date}: Sold at {current_price:.2f}, New Cash: {cash:.2f}")
        
        # Buy Logic
        elif row['buy_signal'] and cash > 0:
            shares_to_buy = cash / current_price
            shares = shares_to_buy
            cash = 0
            # print(f"{date}: Bought at {current_price:.2f}, Shares: {shares:.2f}")

        portfolio_value = cash + shares * current_price
        equity.append({'date': date, 'portfolio_value': portfolio_value})

    equity_df = pd.DataFrame(equity).set_index('date')
    
    # 5. Calculate Performance & Format Output
    metrics = calculate_performance_metrics(equity_df['portfolio_value'])
    
    # Prepare candlestick data
    candlestick_data = data[ohlc_columns].reset_index().to_dict(orient='records')

    results = {
        "keyMetrics": [
            {"label": "Final Portfolio Value", "value": f"₹{equity_df['portfolio_value'].iloc[-1]:,.2f}"},
            {"label": "Total Return", "value": f"{metrics['total_return_pct']}%", "positive": metrics['total_return_pct'] > 0},
            {"label": "Annualized Return", "value": f"{metrics['annualized_return_pct']}%"},
            {"label": "Sharpe Ratio", "value": f"{metrics['sharpe_ratio']}"},
            {"label": "Max Drawdown", "value": f"{metrics['max_drawdown_pct']}%", "positive": metrics['max_drawdown_pct'] > -15},
        ],
        "performanceData": equity_df.reset_index().to_dict(orient='records'),
        "candlestickData": candlestick_data
    }
    print("Simulation finished.")
    return results
