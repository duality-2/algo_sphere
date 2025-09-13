
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from strategies import moving_average_crossover, rsi

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes


def fetch_data_from_csv():
    df = pd.read_csv("data/market_data.csv")
    return df


# Placeholder for trading strategies
def run_strategy(strategy_name, data):
    if strategy_name == "moving_average_crossover":
        return moving_average_crossover.moving_average_crossover_strategy(data)
    elif strategy_name == "rsi":
        return rsi.rsi_strategy(data)
    else:
        return {"result": "hold"}


@app.route('/api/market_data')
def get_market_data():
    df = fetch_data_from_csv()
    return jsonify(df.to_dict(orient="records"))


@app.route('/api/backtest', methods=['POST'])
def backtest_strategy():
    request_data = request.get_json()
    strategy_name = request_data.get("strategy")
    data = fetch_data_from_csv()
    result = run_strategy(strategy_name, data)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
