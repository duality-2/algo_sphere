import pandas as pd

def moving_average_crossover_strategy(data, short_window=5, long_window=10):
    # Calculate short and long-term moving averages
    data[f'SMA_{short_window}'] = data['Close'].rolling(window=short_window).mean()
    data[f'SMA_{long_window}'] = data['Close'].rolling(window=long_window).mean()

    # Generate signals
    data['Signal'] = 0
    data.loc[data[f'SMA_{short_window}'] > data[f'SMA_{long_window}'], 'Signal'] = 1
    data.loc[data[f'SMA_{short_window}'] < data[f'SMA_{long_window}'], 'Signal'] = -1

    # Return the data with signals
    return data.to_dict(orient="records")
