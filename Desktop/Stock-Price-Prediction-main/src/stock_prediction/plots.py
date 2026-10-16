from __future__ import annotations

import logging
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator
from sklearn.metrics import ConfusionMatrixDisplay, RocCurveDisplay

plt.switch_backend("Agg")  # headless: write files, never open a window

logger = logging.getLogger(__name__)


def _save(fig: plt.Figure, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    logger.info("Saved %s", path)


def plot_price(prices: pd.DataFrame, split_date: pd.Timestamp, path: Path) -> None:
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.plot(prices.index, prices["Close"], linewidth=1)
    ax.axvline(split_date, color="red", linestyle="--", label="dev | held-out test")
    ax.set_title("Close price")
    ax.set_ylabel("USD")
    ax.legend()
    _save(fig, path)


def plot_cv_results(cv_table: pd.DataFrame, path: Path) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(11, 4))
    for ax, metric, chance in zip(axes, ("acc", "auc"), (None, 0.5)):
        means, stds = cv_table[f"{metric}_mean"], cv_table[f"{metric}_std"]
        ax.bar(cv_table.index, means, yerr=stds, capsize=4)
        ax.set_title(f"Walk-forward CV: {metric.upper()} (mean ± std)")
        ax.set_ylim(0.4, 0.65)
        ax.tick_params(axis="x", rotation=20)
        if chance is not None:
            ax.axhline(chance, color="red", linestyle="--", label="chance")
            ax.legend()
    _save(fig, path)


def plot_roc(y_true: pd.Series, proba: np.ndarray, model_name: str, path: Path) -> None:
    fig, ax = plt.subplots(figsize=(5, 5))
    RocCurveDisplay.from_predictions(y_true, proba, name=model_name, ax=ax)
    ax.plot([0, 1], [0, 1], "r--", label="chance")
    ax.set_title("Held-out test ROC")
    ax.legend()
    _save(fig, path)


def plot_confusion(y_true: pd.Series, proba: np.ndarray, path: Path) -> None:
    fig, ax = plt.subplots(figsize=(5, 4))
    ConfusionMatrixDisplay.from_predictions(y_true, (proba >= 0.5).astype(int), ax=ax)
    ax.set_title("Held-out test confusion matrix")
    _save(fig, path)


def _importances(model: BaseEstimator, names: list[str]) -> pd.Series | None:
    est = model.named_steps["clf"] if hasattr(model, "named_steps") else model
    if hasattr(est, "feature_importances_"):
        values = est.feature_importances_
    elif hasattr(est, "coef_"):
        values = np.abs(est.coef_[0])
    else:
        return None
    return pd.Series(values, index=names).sort_values()


def plot_feature_importance(model: BaseEstimator, names: list[str], path: Path) -> None:
    importances = _importances(model, names)
    if importances is None:
        logger.warning("Model exposes no feature importances; skipping plot")
        return
    fig, ax = plt.subplots(figsize=(7, 4))
    importances.plot.barh(ax=ax)
    ax.set_title("Feature importance")
    _save(fig, path)


def plot_correlation(features: pd.DataFrame, path: Path) -> None:
    corr = features.corr()
    fig, ax = plt.subplots(figsize=(8, 7))
    im = ax.imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)
    ax.set_xticks(range(len(corr)), corr.columns, rotation=60, ha="right")
    ax.set_yticks(range(len(corr)), corr.columns)
    fig.colorbar(im, ax=ax)
    ax.set_title("Feature correlation")
    _save(fig, path)