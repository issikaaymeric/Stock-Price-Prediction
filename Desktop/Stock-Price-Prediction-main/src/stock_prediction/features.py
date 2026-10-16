from __future__ import annotations

import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "ret_1", "ret_5", "ret_10",
    "vol_10", "vol_change",
    "rsi_14", "ma_ratio_10_30",
    "range_pct", "gap_pct",
    "dow",
]


def _rsi(close: pd.Series, window: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(window).mean()
    loss = (-delta.clip(upper=0)).rolling(window).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - 100 / (1 + rs)


def build_features(prices: pd.DataFrame) -> pd.DataFrame:
    """Build features using only information available at close of day t.

    The target is 1 if close(t+1) > close(t). The final row has no label and is dropped.
    """
    close = prices["Close"]
    out = pd.DataFrame(index=prices.index)

    out["ret_1"] = close.pct_change(1)
    out["ret_5"] = close.pct_change(5)
    out["ret_10"] = close.pct_change(10)
    out["vol_10"] = out["ret_1"].rolling(10).std()
    out["vol_change"] = prices["Volume"].pct_change().replace([np.inf, -np.inf], np.nan)
    out["rsi_14"] = _rsi(close)
    out["ma_ratio_10_30"] = close.rolling(10).mean() / close.rolling(30).mean() - 1
    out["range_pct"] = (prices["High"] - prices["Low"]) / close
    out["gap_pct"] = prices["Open"] / close.shift(1) - 1
    out["dow"] = prices.index.dayofweek

    next_close = close.shift(-1)
    out["target"] = (next_close > close).astype("float")
    out.loc[next_close.isna(), "target"] = np.nan

    out = out.dropna()
    out["target"] = out["target"].astype(int)
    return out