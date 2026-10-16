from __future__ import annotations

from sklearn.base import BaseEstimator
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier


def build_models(seed: int) -> dict[str, BaseEstimator]:
    """Return named pipelines. Scaling lives inside the pipeline to prevent leakage."""
    return {
        "baseline_majority": DummyClassifier(strategy="prior"),
        "logreg": Pipeline([
            ("scale", StandardScaler()),
            ("clf", LogisticRegression(C=0.1, max_iter=1000, random_state=seed)),
        ]),
        "xgboost": XGBClassifier(
            n_estimators=200,
            max_depth=3,
            learning_rate=0.03,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=5,
            reg_lambda=5.0,
            eval_metric="logloss",
            random_state=seed,
            n_jobs=-1,
        ),
    }