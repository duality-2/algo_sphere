import pandas as pd
import pandas_ta as ta
import yfinance as yf
import joblib
import warnings
from . import strategies

# --- Artifact Registry for Multiple Model Sets ---
# This dictionary loads your different groups of trained models.
print("Loading all ML artifact sets...")
ARTIFACT_REGISTRY = {}
MODEL_SETS = {
    "SetA": {"rf": "rf_model.pkl", "gb": "gb_model.pkl"}, # Your first pair
    "SetB": {"rf": "rf1_model.pkl", "gb": "gb1_model.pkl"}  # Your second pair
}

for set_name, files in MODEL_SETS.items():
    try:
        # NOTE: For a production system, you MUST also save and load the corresponding
        # scaler.pkl and feature_columns.pkl files for EACH model set.
        ARTIFACT_REGISTRY[set_name] = {
            "RandomForest": joblib.load(f"./trained_models/{files['rf']}"),
            "GradientBoosting": joblib.load(f"./trained_models/{files['gb']}")
        }
        print(f"✅ ML artifact set '{set_name}' loaded successfully.")
    except FileNotFoundError as e:
        print(f"❌ Could not load artifact set '{set_name}'. It will be unavailable. Error: {e}")


def get_ml_predictions(model_set_name: str, model_name: str, data: pd.DataFrame):
    """
    Generates predictions using the artifacts from the selected model set.
    """
    if model_set_name not in ARTIFACT_REGISTRY:
        warnings.warn(f"Model set '{model_set_name}' not available. Skipping ML predictions.")
        return pd.Series(0, index=data.index)

    artifacts = ARTIFACT_REGISTRY[model_set_name]
    
    # --- IMPORTANT: Feature Engineering ---
    # You MUST create the exact features your models were trained on here.
    # This is a placeholder; replace it with your feature creation code from Google Colab.
    # For example:
    # data.ta.sma(length=50, append=True)
    # data.ta.rsi(length=14, append=True)
    # feature_columns = ["SMA_50", "RSI_14", "Volume"] 
    feature_columns = ['Open', 'High', 'Low', 'Close', 'Volume'] # Placeholder
    features = data[feature_columns].copy()
    features.dropna(inplace=True)

    if features.empty:
        return pd.Series(0, index=data.index)

    # --- Prediction ---
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


def run_simulation(strategy_json: dict, ticker: str, start_date: str, end_date: str):
    """ Main simulation function with full ML integration. """
    strategy_type = strategy_json.get("strategyType")
    ml_model_set = strategy_json.get("ml_model_set")
    ml_model_name = strategy_json.get("ml_model")

    # 1. Fetch Data
    data = yf.download(ticker, start=start_date, end=end_date, progress=False)
    if data.empty: raise ValueError("No data fetched.")

    # 2. Apply the Selected Technical Strategy (Momentum, etc.)
    if strategy_type == "TrendFollowing":
        data_with_signals = strategies.momentum_strategy(data)
    elif strategy_type == "MeanReversion":
        data_with_signals = strategies.mean_reversion_strategy(data)
    elif strategy_type == "Volatility":
        data_with_signals = strategies.volatility_strategy(data)
    else:
        raise ValueError(f"Unknown strategy type: {strategy_type}")

    # 3. Layer ML Predictions on top (if a model was selected)
    if ml_model_set and ml_model_name:
        print(f"Generating predictions with {ml_model_name} from {ml_model_set}...")
        ml_preds = get_ml_predictions(ml_model_set, ml_model_name, data_with_signals)
        data_with_signals = data_with_signals.join(ml_preds.rename('ml_prediction')).fillna(0)

    # 4. Simulation Loop
    cash = 100000
    position = 0
    equity = []
    for i in range(len(data_with_signals)):
        buy_signal = data_with_signals['buy_signal'].iloc[i]
        sell_signal = data_with_signals['sell_signal'].iloc[i]
        
        # --- Combine Technical Signal with ML Prediction ---
        # If no model is used, the 'ml_prediction' column won't exist, so we default to a value that allows the trade.
        ml_confirm_buy = data_with_signals.get('ml_prediction', pd.Series(1)).iloc[i] > 0
        
        # Execute trade only if the base strategy signals AND the ML model agrees.
        if buy_signal and ml_confirm_buy and position == 0:
            position = cash / data_with_signals['Close'].iloc[i]
            cash = 0
        elif sell_signal and position > 0:
            cash = position * data_with_signals['Close'].iloc[i]
            position = 0
        
        current_equity = cash + position * data_with_signals['Close'].iloc[i]
        equity.append({'date': data_with_signals.index[i].strftime('%Y-%m-%d'), 'portfolio': current_equity})

    # 5. Generate and return the report
    final_equity = equity[-1]['portfolio'] if equity else cash
    total_return = (final_equity / 100000 - 1) * 100
    results = {
        "keyMetrics": [{"label": "Total Return", "value": f"{total_return:.2f}%", "positive": total_return > 0}],
        "performanceData": equity,
    }
    print("Simulation finished.")
    return results