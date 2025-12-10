import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib

# Load dataset
df = pd.read_csv(r"D:\convex\New folder\Minarah\backend\app\ml_models\combined_flood_data.csv")

# Numeric features to scale
num_cols = ['Year', 'Temp', 'Ice', 'Veg', 'Rain_mm']

# Fill missing values
df[num_cols] = df[num_cols].fillna(df[num_cols].mean())

# Fit scaler
scaler = StandardScaler()
scaler.fit(df[num_cols])

# Save scaler
joblib.dump(scaler, "scaler.pkl")
print("Scaler saved as scaler.pkl")
