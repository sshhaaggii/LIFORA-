import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

"""
Machine Learning Model Training Pipeline for Sign Language Recognition
Trains a Random Forest or Multi-Layer Perceptron (MLP) Classifier on normalized landmark datasets.
"""

DATASET_PATH = "dataset.csv"
MODEL_OUTPUT_PATH = "sign_language_model.pkl"

def generate_synthetic_demo_data():
    """Generates baseline benchmark dataset if user hasn't collected samples yet"""
    print("[INFO] No dataset.csv found. Generating synthetic baseline dataset for ASL gestures...")
    labels = ["A", "B", "C", "V", "Hello", "Thanks", "Yes", "No", "I Love You"]
    records = []
    
    for label in labels:
        for _ in range(120):
            # Create simulated 63-element landmark vector with label-specific centroid & noise
            base_vec = np.random.normal(loc=0.0, scale=0.5, size=63)
            if label == "Hello": base_vec[12:15] += 1.2
            elif label == "Yes": base_vec[3:6] += 1.5
            elif label == "I Love You": base_vec[24:27] += 1.4
            norm_factor = np.linalg.norm(base_vec)
            if norm_factor > 0:
                base_vec /= norm_factor
            records.append(list(base_vec) + [label])
            
    cols = [f"f_{i}" for i in range(63)] + ["label"]
    df = pd.DataFrame(records, columns=cols)
    df.to_csv(DATASET_PATH, index=False)
    print(f"[SUCCESS] Synthetic dataset created: {DATASET_PATH} with {len(df)} samples across {len(labels)} classes.")
    return df

def train_model():
    print("=" * 60)
    print("   SIGN LANGUAGE MACHINE LEARNING MODEL TRAINER")
    print("=" * 60)
    
    if not os.path.exists(DATASET_PATH):
        df = generate_synthetic_demo_data()
    else:
        df = pd.read_csv(DATASET_PATH)
        print(f"[INFO] Loaded dataset '{DATASET_PATH}' with {len(df)} rows.")

    X = df.iloc[:, :-1].values
    y = df.iloc[:, -1].values

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"[INFO] Dataset shape: Features={X.shape[1]}, Classes={len(np.unique(y))}")
    print(f"[INFO] Training set size: {len(X_train)} | Test set size: {len(X_test)}")
    
    # Train Random Forest Classifier
    print("\n[INFO] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    print("\n" + "=" * 50)
    print(f"   TRAINING RESULTS — MODEL ACCURACY: {acc * 100:.2f}%")
    print("=" * 50)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Save model
    joblib.dump(model, MODEL_OUTPUT_PATH)
    print(f"\n[SUCCESS] Trained ML model saved to '{MODEL_OUTPUT_PATH}'!")

if __name__ == "__main__":
    train_model()
