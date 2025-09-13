# app/strategies.py

import pandas as pd
import pandas_ta as ta

def momentum_strategy(data: pd.DataFrame, fast_ma: int = 50, slow_ma: int = 200) -> pd.DataFrame:
    """
    Implements a classic Momentum/Trend-Following strategy using a Moving Average Crossover.
    A "Golden Cross" (fast MA crosses above slow MA) is a buy signal.
    A "Death Cross" (fast MA crosses below slow MA) is a sell signal.
    """
    print(f"Calculating Momentum Strategy (SMA {fast_ma}/{slow_ma})...")
    df = data.copy()
    
    # Calculate Fast and Slow Simple Moving Averages
    df.ta.sma(length=fast_ma, append=True)
    df.ta.sma(length=slow_ma, append=True)
    df.dropna(inplace=True)

    # Generate signals
    # `[df.ta.sma(fast_ma) > df.ta.sma(slow_ma), df.ta.sma(fast_ma).shift(1) < df.ta.sma(slow_ma).shift(1)]`
    # The above would be the more robust way to implement this using pandas-ta
    buy_signals = (df[f'SMA_{fast_ma}'] > df[f'SMA_{slow_ma}']) & (df[f'SMA_{fast_ma}'].shift(1) <= df[f'SMA_{slow_ma}'].shift(1))
    sell_signals = (df[f'SMA_{fast_ma}'] < df[f'SMA_{slow_ma}']) & (df[f'SMA_{fast_ma}'].shift(1) >= df[f'SMA_{slow_ma}'].shift(1))
    
    df['buy_signal'] = buy_signals
    df['sell_signal'] = sell_signals
    
    return df


def mean_reversion_strategy(data: pd.DataFrame, length: int = 20, std_dev: float = 2.0) -> pd.DataFrame:
    """
    Implements a Mean Reversion strategy using Bollinger Bands®.
    A buy signal is generated when the price crosses below the lower band.
    A sell signal is generated when the price crosses above the upper band.
    """
    print(f"Calculating Mean Reversion Strategy (Bollinger Bands® {length}/{std_dev})...")
    df = data.copy()
    
    # Calculate Bollinger Bands®
    df.ta.bbands(length=length, std=std_dev, append=True)
    df.dropna(inplace=True)
    
    # Generate signals
    buy_signals = (df['Close'] < df[f'BBL_{length}_{std_dev}']) & (df['Close'].shift(1) >= df[f'BBL_{length}_{std_dev}'].shift(1))
    sell_signals = (df['Close'] > df[f'BBU_{length}_{std_dev}']) & (df['Close'].shift(1) <= df[f'BBU_{length}_{std_dev}'].shift(1))
    
    df['buy_signal'] = buy_signals
    df['sell_signal'] = sell_signals
    
    return df


def volatility_strategy(data: pd.DataFrame, length: int = 20, std_dev: float = 2.0, squeeze_threshold: float = 1.5) -> pd.DataFrame:
    """
    Implements a Volatility Breakout strategy using a Bollinger Band® Squeeze.
    A "squeeze" is identified when the band width is historically low.
    A buy signal is generated on a breakout above the upper band *after* a squeeze.
    A sell signal is generated on a breakdown below the lower band *after* a squeeze.
    """
    print(f"Calculating Volatility Strategy (Bollinger Band® Squeeze)...")
    df = data.copy()
    
    # Calculate Bollinger Bands® and Band Width
    df.ta.bbands(length=length, std=std_dev, append=True)
    df['BB_WIDTH'] = (df[f'BBU_{length}_{std_dev}'] - df[f'BBL_{length}_{std_dev}']) / df[f'BBM_{length}_{std_dev}']
    df.dropna(inplace=True)
    
    # Identify the squeeze
    squeeze_on = df['BB_WIDTH'] < df['BB_WIDTH'].rolling(window=length*2).mean() * squeeze_threshold
    
    # Generate signals
    buy_breakout = (df['Close'] > df[f'BBU_{length}_{std_dev}'].shift(1))
    sell_breakout = (df['Close'] < df[f'BBL_{length}_{std_dev}'].shift(1))
    
    df['buy_signal'] = squeeze_on.shift(1) & buy_breakout
    df['sell_signal'] = squeeze_on.shift(1) & sell_breakout
    
    return df