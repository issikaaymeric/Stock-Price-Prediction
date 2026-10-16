import numpy as np
import pandas as pd
import pytest

from stock_prediction.features import FEATURE_COLUMNS, build_features


@pytest.fixture
def prices() -> pd.DataFrame:
    rng = np.random.default_rng(0)
    idx = pd.bdate_range("2020-01-01", periods=200)
    close = 100 + rng.normal(0, 1, len(idx)).cumsum()
    return pd.DataFrame(
        {
            "Open": close * 0.999,
            "High": close * 1.01,
            "Low": close * 0.99,
            "Close": close,
            "Volume": rng.integers(1_000_000, 2_000_000, len(idx)),
        },
        index=idx,
    )


def test_last_row_dropped_no_nan_target(prices):
    data = build_features(prices)
    assert data["target"].notna().all()
    assert data.index.max() < prices.index.max()


def test_features_unchanged_by_future_data(prices):
    """Features at day t must not change if later rows are removed."""
    full = build_features(prices)
    cutoff = full.index[100]
    truncated = build_features(prices.loc[:cutoff + pd.Timedelta(days=1)])
    common = truncated.index.intersection(full.index)[:-1]
    pd.testing.assert_frame_equal(
        full.loc[common, FEATURE_COLUMNS], truncated.loc[common, FEATURE_COLUMNS]
    )


def test_target_matches_next_day_direction(prices):
    data = build_features(prices)
    close = prices["Close"]
    expected = (close.shift(-1) > close).loc[data.index].astype(int)
    pd.testing.assert_series_equal(data["target"], expected, check_names=False)