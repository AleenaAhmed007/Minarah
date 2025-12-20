import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, cohen_kappa_score
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# -----------------------------
# LOAD DATA
# -----------------------------
df = pd.read_csv(r"D:\project\Minarah\backend\app\ml_models\data\combined_flood_data.csv")

print(f"Dataset shape: {df.shape}")
print(f"\nFirst few rows:")
print(df.head())
print(f"\nMissing values:\n{df[['Rain_mm', 'Temp', 'Veg', 'Ice']].isnull().sum()}")
print(f"\nBasic statistics:")
print(df[['Rain_mm', 'Temp', 'Veg', 'Ice']].describe())

# -----------------------------
# SELECT PRE-FLOOD FEATURES
# -----------------------------
pre_flood_features = ['Rain_mm', 'Temp', 'Veg', 'Ice']

# -----------------------------
# IMPROVED SEVERITY FORMULA
# -----------------------------
def assign_severity_formula(row):
    """
    Assign flood severity based on environmental indicators.
    
    Formula explanation:
    - Rain: Primary driver (50% weight) - normalized by 500mm
    - Vegetation: Protective factor (30% weight) - higher veg = lower score
    - Temperature: Secondary factor (15% weight) - affects evaporation
    - Ice: Protective/risk factor (5% weight) - can indicate snowmelt
    
    Thresholds:
    - Severe: score >= 0.6 (immediate flood risk)
    - Moderate: 0.3 <= score < 0.6 (elevated risk)
    - Low: score < 0.3 (normal conditions)
    """
    # Handle missing values
    rain = row.get('Rain_mm', 0)
    veg = row.get('Veg', 0)
    temp = row.get('Temp', 0)
    ice = row.get('Ice', 0)
    
    # Normalize each factor to 0-1 range
    # Rain: Higher rain = higher risk
    rain_norm = min(rain / 500, 1.0)  # Cap at 1.0 for extreme values
    
    # Vegetation: INVERSE relationship (higher veg = lower risk)
    # Changed formula to reflect this
    veg_norm = max(0, 1 - (veg / 5000))  # Inverted
    
    # Temperature: Higher temp = higher evaporation, but also more intense weather
    temp_norm = min(temp / 50, 1.0)
    
    # Ice: Negative ice or low ice could indicate snowmelt risk
    ice_norm = max(0, (10 - ice) / 10)  # Inverted: less ice = higher risk
    
    # Weighted score
    score = (0.50 * rain_norm + 
             0.30 * veg_norm + 
             0.15 * temp_norm + 
             0.05 * ice_norm)
    
    # Assign severity categories
    if score >= 0.45:
        return "Severe"
    elif score >= 0.25:
        return "Moderate"
    else:
        return "Low"

# Apply severity formula
df['Severity'] = df.apply(assign_severity_formula, axis=1)

print(f"\n--- SEVERITY DISTRIBUTION ---")
print(df['Severity'].value_counts())
print(f"\nPercentage distribution:")
print(df['Severity'].value_counts(normalize=True) * 100)

# Check for class imbalance
severity_counts = df['Severity'].value_counts()
if severity_counts.min() / severity_counts.max() < 0.3:
    print("\n⚠️ Warning: Significant class imbalance detected!")
    print("Consider using SMOTE or adjusting class_weight parameters.")

# -----------------------------
# LABEL ENCODING
# -----------------------------
le = LabelEncoder()
df['Severity_encoded'] = le.fit_transform(df['Severity'])

# Save mapping for interpretability
severity_mapping = dict(zip(le.classes_, le.transform(le.classes_)))
print(f"\n--- SEVERITY ENCODING ---")
print(f"Mapping: {severity_mapping}")

# -----------------------------
# SPLIT DATA
# -----------------------------
X = df[pre_flood_features].copy()
y = df['Severity_encoded'].copy()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n--- DATA SPLIT ---")
print(f"Training set: {X_train.shape}")
print(f"Test set: {X_test.shape}")
print(f"Training severity distribution:\n{pd.Series(y_train).value_counts()}")

# -----------------------------
# LOAD OR CREATE SHARED SCALER
# -----------------------------
try:
    shared_scaler = joblib.load(r"D:\project\Minarah\backend\app\ml_models\artifacts\preprocessors\scaler.pkl")
    print("\n✓ Shared scaler loaded successfully")
except FileNotFoundError:
    print("\n⚠️ Shared scaler not found. Creating new StandardScaler.")
    shared_scaler = StandardScaler()
    # Fit on entire dataset's numeric columns (not just training)
    # This ensures consistency with other models
    shared_scaler.fit(df[pre_flood_features])
    joblib.dump(shared_scaler, "scaler.pkl")
    print("✓ New scaler created and saved")

# -----------------------------
# CREATE PREPROCESSING PIPELINE
# -----------------------------
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', shared_scaler)
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, pre_flood_features)
    ],
    remainder='passthrough'  # Keep any additional columns
)

# -----------------------------
# HYPERPARAMETER TUNING (OPTIONAL)
# -----------------------------
print("\n--- MODEL TRAINING ---")
use_grid_search = False  # Set to True for hyperparameter tuning

if use_grid_search:
    print("Running GridSearchCV for hyperparameter tuning...")
    
    param_grid = {
        'clf__n_estimators': [200, 300, 500],
        'clf__max_depth': [8, 10, 12],
        'clf__min_samples_split': [5, 10],
        'clf__min_samples_leaf': [2, 4]
    }
    
    base_model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('clf', RandomForestClassifier(random_state=42, class_weight='balanced'))
    ])
    
    grid_search = GridSearchCV(
        base_model, param_grid, cv=5, scoring='f1_weighted', 
        n_jobs=-1, verbose=1
    )
    grid_search.fit(X_train, y_train)
    
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best cross-validation score: {grid_search.best_score_:.4f}")
    
    model = grid_search.best_estimator_
else:
    # Use pre-configured model
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('clf', RandomForestClassifier(
            n_estimators=300,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=42,
            class_weight='balanced',
            n_jobs=-1
        ))
    ])
    
    print("Training RandomForest model...")
    model.fit(X_train, y_train)
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    print(f"Cross-validation F1 scores: {cv_scores}")
    print(f"Mean CV F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

print("✓ Model training completed")

# -----------------------------
# EVALUATE MODEL
# -----------------------------
print("\n" + "="*60)
print("MODEL EVALUATION")
print("="*60)

y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print("\nConfusion Matrix:")
print(cm)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='YlOrRd',
            xticklabels=le.classes_,
            yticklabels=le.classes_)
plt.title('Confusion Matrix - Pre-Flood Severity Prediction')
plt.ylabel('Actual Severity')
plt.xlabel('Predicted Severity')
plt.tight_layout()
plt.savefig('severity_confusion_matrix.png', dpi=300)
plt.show()

# Classification Report
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# Cohen's Kappa (better for multi-class imbalanced datasets)
kappa = cohen_kappa_score(y_test, y_pred)
print(f"\nCohen's Kappa Score: {kappa:.4f}")
if kappa > 0.8:
    print("  → Excellent agreement")
elif kappa > 0.6:
    print("  → Good agreement")
elif kappa > 0.4:
    print("  → Moderate agreement")
else:
    print("  → Fair/Poor agreement")

# Per-class accuracy
for i, severity_class in enumerate(le.classes_):
    class_mask = y_test == i
    if class_mask.sum() > 0:
        class_acc = (y_pred[class_mask] == i).sum() / class_mask.sum()
        print(f"{severity_class} accuracy: {class_acc:.4f}")

# -----------------------------
# FEATURE IMPORTANCE ANALYSIS
# -----------------------------
print("\n" + "="*60)
print("FEATURE IMPORTANCE ANALYSIS")
print("="*60)

# Extract feature importances from the trained classifier
feature_importances = model.named_steps['clf'].feature_importances_

importance_df = pd.DataFrame({
    'Feature': pre_flood_features,
    'Importance': feature_importances
}).sort_values('Importance', ascending=False)

print("\nFeature Importance:")
print(importance_df)

plt.figure(figsize=(10, 6))
plt.barh(importance_df['Feature'], importance_df['Importance'])
plt.xlabel('Importance')
plt.title('Feature Importance for Severity Prediction')
plt.tight_layout()
plt.savefig('severity_feature_importance.png', dpi=300)
plt.show()

# -----------------------------
# PREDICTION CONFIDENCE ANALYSIS
# -----------------------------
print("\n" + "="*60)
print("PREDICTION CONFIDENCE ANALYSIS")
print("="*60)

# Calculate prediction confidence (max probability)
pred_confidence = y_pred_proba.max(axis=1)
print(f"Average prediction confidence: {pred_confidence.mean():.4f}")
print(f"Min confidence: {pred_confidence.min():.4f}")
print(f"Max confidence: {pred_confidence.max():.4f}")

# Analyze predictions by confidence level
low_confidence_mask = pred_confidence < 0.5
if low_confidence_mask.sum() > 0:
    print(f"\n⚠️ Warning: {low_confidence_mask.sum()} predictions have low confidence (<0.5)")
    print("Consider reviewing these cases or gathering more data.")

# -----------------------------
# SAVE MODEL + ENCODER + METADATA
# -----------------------------
# print("\n" + "="*60)
# print("SAVING MODEL ARTIFACTS")
# print("="*60)

# joblib.dump(model, "pre_flood_severity_model.pkl")
# joblib.dump(le, "pre_flood_severity_label_encoder.pkl")

# # Save comprehensive metadata
# metadata = {
#     'features': pre_flood_features,
#     'severity_mapping': severity_mapping,
#     'model_type': 'RandomForestClassifier',
#     'kappa_score': kappa,
#     'feature_importance': importance_df.to_dict(),
#     'class_distribution': df['Severity'].value_counts().to_dict(),
#     'formula_explanation': {
#         'rain_weight': 0.50,
#         'veg_weight': 0.30,
#         'temp_weight': 0.15,
#         'ice_weight': 0.05,
#         'severe_threshold': 0.6,
#         'moderate_threshold': 0.3
#     }
# }
# joblib.dump(metadata, "severity_model_metadata.pkl")

# print("✓ Model saved as: pre_flood_severity_model.pkl")
# print("✓ Label Encoder saved as: pre_flood_severity_label_encoder.pkl")
# print("✓ Metadata saved as: severity_model_metadata.pkl")

# -----------------------------
# COMPREHENSIVE SAMPLE TESTS
# -----------------------------
print("\n" + "="*60)
print("SAMPLE PREDICTION TESTS")
print("="*60)

test_scenarios = [
    {
        'name': 'Severe Risk - Heavy Rain, Low Vegetation',
        'data': {'Rain_mm': [450], 'Temp': [35], 'Veg': [1000], 'Ice': [2]},
        'expected': 'Severe'
    },
    {
        'name': 'Moderate Risk - Medium Rain, Moderate Veg',
        'data': {'Rain_mm': [200], 'Temp': [28], 'Veg': [3000], 'Ice': [5]},
        'expected': 'Moderate'
    },
    {
        'name': 'Low Risk - Low Rain, High Vegetation',
        'data': {'Rain_mm': [50], 'Temp': [25], 'Veg': [4500], 'Ice': [8]},
        'expected': 'Low'
    },
    {
        'name': 'Edge Case - Extreme Rain',
        'data': {'Rain_mm': [800], 'Temp': [30], 'Veg': [2000], 'Ice': [0]},
        'expected': 'Severe'
    }
]

for scenario in test_scenarios:
    print(f"\n--- {scenario['name']} ---")
    sample = pd.DataFrame(scenario['data'])
    
    pred = model.predict(sample)[0]
    pred_label = le.inverse_transform([pred])[0]
    proba = model.predict_proba(sample)[0]
    
    # Calculate manual score for transparency
    row = sample.iloc[0]
    rain_norm = min(row['Rain_mm'] / 500, 1.0)
    veg_norm = max(0, 1 - (row['Veg'] / 5000))
    temp_norm = min(row['Temp'] / 50, 1.0)
    ice_norm = max(0, (10 - row['Ice']) / 10)
    manual_score = 0.50*rain_norm + 0.30*veg_norm + 0.15*temp_norm + 0.05*ice_norm
    
    print(f"Input: {scenario['data']}")
    print(f"Manual Risk Score: {manual_score:.4f}")
    print(f"Expected: {scenario['expected']}")
    print(f"Predicted: {pred_label} {'✓' if pred_label == scenario['expected'] else '✗'}")
    print(f"Confidence: {proba.max():.4f}")
    print(f"Class Probabilities:")
    for cls, prob in zip(le.classes_, proba):
        print(f"  {cls}: {prob:.4f}")

print("\n" + "="*60)
print("MODEL PIPELINE COMPLETE")
print("="*60)