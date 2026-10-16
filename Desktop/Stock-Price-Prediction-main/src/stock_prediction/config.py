from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Config:
    ticker: str = "AAPL"
    start: str = "2015-01-01"
    end: str | None = None
    test_fraction: float = 0.2
    n_splits: int = 5
    seed: int = 42
    data_dir: Path = Path("data")
    model_dir: Path = Path("models")
    figure_dir: Path = Path("reports/figures")