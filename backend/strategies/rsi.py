import pandas as pd

def rsi_strategy(data):
    # Calculate RSI
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    data['RSI'] = 100 - (100 / (1 + rs))

    # Generate signals
    data['Signal'] = 0
    data.loc[data['RSI'] < 30, 'Signal'] = 1  # Buy signal
    data.loc[data['RSI'] > 70, 'Signal'] = -1  # Sell signal

    # Return the data with signals
    return data.to_dict(orient="records")
