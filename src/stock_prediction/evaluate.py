from __future__ import annotations

from dataclasses import dataclass, asdict

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, clone
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import TimeSeriesSplit


@dataclass
class CVResult:
    model: str
    acc_mean: float
    acc_std: float
    auc_mean: float
    auc_std: float


def walk_forward_cv(
    name: str,
    model: BaseEstimator,
    X: pd.DataFrame,
    y: pd.Series,
    n_splits: int,
) -> CVResult:
    accs, aucs = [], []
    for train_idx, test_idx in TimeSeriesSplit(n_splits=n_splits).split(X):
        m = clone(model).fit(X.iloc[train_idx], y.iloc[train_idx])
        proba = m.predict_proba(X.iloc[test_idx])[:, 1]
        pred = (proba >= 0.5).astype(int)
        accs.append(accuracy_score(y.iloc[test_idx], pred))
        if y.iloc[test_idx].nunique() > 1:
            aucs.append(roc_auc_score(y.iloc[test_idx], proba))
    return CVResult(
        model=name,
        acc_mean=float(np.mean(accs)),
        acc_std=float(np.std(accs)),
        auc_mean=float(np.mean(aucs)) if aucs else float("nan"),
        auc_std=float(np.std(aucs)) if aucs else float("nan"),
    )


def results_to_frame(results: list[CVResult]) -> pd.DataFrame:
    return pd.DataFrame([asdict(r) for r in results]).set_index("model")