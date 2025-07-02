# 📈 Apple Stock Price Movement Prediction

This project analyzes and predicts the next-day movement (up/down) of Apple Inc.'s stock closing price using historical data and machine learning models.

## Overview

We use a dataset containing Apple's historical stock prices to:
- Explore and visualize the data.
- Engineer meaningful features.
- Train classification models to predict whether the stock will go up the next day.

## Dataset

- `finance-charts-apple.csv`
- Contains daily stock price data for Apple (Open, High, Low, Close, Volume, Adjusted Close, Date).

## Features Used

- `open-close` — Difference between opening and closing prices.
- `low-high` — Difference between low and high prices.
- `is_quarter_end` — Boolean feature indicating if the month is the end of a fiscal quarter.

##  Target

- Binary classification:
  - `1` if next day’s closing price is higher
  - `0` otherwise

##  Models Used

- Logistic Regression
- Support Vector Classifier (Polynomial Kernel)
- XGBoost Classifier

## 📊 Evaluation Metric

- ROC AUC Score
- Confusion Matrix

## 📈 Visualizations

- Line plots for closing prices
- Distribution and box plots of stock features
- Yearly bar charts
- Correlation heatmap
- Pie chart for target class balance

##  Libraries

- `pandas`, `numpy`
- `matplotlib`, `seaborn`
- `sklearn`
- `xgboost`


