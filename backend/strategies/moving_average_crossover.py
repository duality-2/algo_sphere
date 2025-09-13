import pandas as pd

def moving_average_crossover_strategy(data):
    # Calculate short and long-term moving averages
    data['SMA_5'] = data['Close'].rolling(window=5).mean()
    data['SMA_10'] = data['Close'].rolling(window=10).mean()

    # Generate signals
    data['Signal'] = 0
    data.loc[data['SMA_5'] > data['SMA_10'], 'Signal'] = 1
    data.loc[data['SMA_5'] < data['SMA_10'], 'Signal'] = -1

    # Return the data with signals
    return data.to_dict(orient="records")
