import pandas as pd

def calculate_volatility(data, window=252):
    # Calculate the daily returns
    data['Returns'] = data['Close'].pct_change()

    # Calculate the rolling volatility
    data['Volatility'] = data['Returns'].rolling(window=window).std() * (window ** 0.5)

    return data.to_dict(orient="records")
