
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from strategies import moving_average_crossover, rsi

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes


@app.route('/api/stocks')
def get_stocks():
    df = pd.read_csv("data/stock_metadata.csv")
    return jsonify(df.to_dict(orient="records"))


def run_strategy(strategy_name, data):
    if strategy_name == "moving_average_crossover":
        return moving_average_crossover.moving_average_crossover_strategy(data)
    elif strategy_name == "rsi":
        return rsi.rsi_strategy(data)
    else:
        return {"result": "hold"}


@app.route('/api/backtest', methods=['POST'])
def backtest_strategy():
    request_data = request.get_json()
    strategy_name = request_data.get("strategy")
    stock_symbol = request_data.get("stock_symbol")
    
    # Construct the file path for the selected stock
    file_path = f"data/{stock_symbol}.csv"
    
    try:
        data = pd.read_csv(file_path)
    except FileNotFoundError:
        return jsonify({"error": f"Data for stock '{stock_symbol}' not found."}), 404
        
    result = run_strategy(strategy_name, data)
    return jsonify(result)


if __name__ == '__main__':
    app.run()
