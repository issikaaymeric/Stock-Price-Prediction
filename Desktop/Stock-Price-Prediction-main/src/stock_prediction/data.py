from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {"Open", "High", "Low", "Close", "Volume"}


def load_prices(
    ticker: str,
    start: str,
    end: str | None = None,
    cache_dir: Path | None = None,
) -> pd.DataFrame:
    """Load daily OHLCV data, using a local parquet cache when available."""
    cache_path = cache_dir / f"{ticker}_{start}_{end or 'latest'}.parquet" if cache_dir else None

    if cache_path and cache_path.exists():
        logger.info("Loading cached data from %s", cache_path)
        return pd.read_parquet(cache_path)

    df = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)
    if df.empty:
        raise ValueError(f"No data returned for ticker {ticker!r}")

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing expected columns: {sorted(missing)}")

    df = df.sort_index()
    if df.index.has_duplicates:
        raise ValueError("Duplicate dates in price data")

    if cache_path:
        cache_dir.mkdir(parents=True, exist_ok=True)
        df.to_parquet(cache_path)

    return df