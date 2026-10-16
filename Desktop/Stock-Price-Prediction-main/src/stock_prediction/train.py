from __future__ import annotations

import json
import logging

import joblib
import numpy as np
from sklearn.base import clone
from sklearn.metrics import accuracy_score, roc_auc_score

from . import plots
from .config import Config
from .data import load_prices
from .evaluate import results_to_frame, walk_forward_cv
from .features import FEATURE_COLUMNS, build_features
from .models import build_models

logger = logging.getLogger(__name__)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    cfg = Config()
    np.random.seed(cfg.seed)

    prices = load_prices(cfg.ticker, cfg.start, cfg.end, cfg.data_dir)
    data = build_features(prices)
    X, y = data[FEATURE_COLUMNS], data["target"]

    split = int(len(data) * (1 - cfg.test_fraction))
    X_dev, X_test = X.iloc[:split], X.iloc[split:]
    y_dev, y_test = y.iloc[:split], y.iloc[split:]
    logger.info("Dev: %d rows | Held-out test: %d rows", len(X_dev), len(X_test))

    models = build_models(cfg.seed)
    cv_results = [
        walk_forward_cv(name, model, X_dev, y_dev, cfg.n_splits) for name, model in models.items()
    ]
    cv_table = results_to_frame(cv_results)
    logger.info("Walk-forward CV on dev set:\n%s", cv_table.round(4))

    best_name = cv_table.drop(index="baseline_majority")["auc_mean"].idxmax()
    final = clone(models[best_name]).fit(X_dev, y_dev)
    proba = final.predict_proba(X_test)[:, 1]
    test_metrics = {
        "model": best_name,
        "test_accuracy": float(accuracy_score(y_test, proba >= 0.5)),
        "test_auc": float(roc_auc_score(y_test, proba)),
        "test_majority_baseline": float(max(y_test.mean(), 1 - y_test.mean())),
        "n_test": int(len(y_test)),
    }
    logger.info("Held-out test: %s", test_metrics)

    cfg.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(final, cfg.model_dir / f"{best_name}.joblib")
    (cfg.model_dir / "metrics.json").write_text(json.dumps(test_metrics, indent=2))

    fig_dir = cfg.figure_dir
    plots.plot_price(prices, X_test.index[0], fig_dir / "price.png")
    plots.plot_correlation(X_dev, fig_dir / "correlation.png")
    plots.plot_cv_results(cv_table, fig_dir / "cv_results.png")
    plots.plot_roc(y_test, proba, best_name, fig_dir / "roc.png")
    plots.plot_confusion(y_test, proba, fig_dir / "confusion.png")
    plots.plot_feature_importance(final, FEATURE_COLUMNS, fig_dir / "feature_importance.png")


if __name__ == "__main__":
    main()