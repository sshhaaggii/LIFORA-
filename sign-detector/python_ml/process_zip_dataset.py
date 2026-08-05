import zipfile
import os
import sys
import shutil
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import glob
from train_sign_model import train_model

"""
Python Sign Language ZIP Dataset Processor & ML Pipeline
Extracts images or CSV files from a dataset ZIP archive (e.g. Kaggle ASL Alphabet ZIP),
runs MediaPipe 21-hand landmark extraction on images, updates dataset.csv,
and trains the Machine Learning classifier automatically.
"""

DATASET_CSV = "dataset.csv"
TEMP_DIR = "temp_unzipped_dataset"

mp_hands = mp.solutions.hands

def normalize_landmarks(landmarks):
    wrist = landmarks[0]
    max_dist = 0.0001
    shifted = []
    
    for lm in landmarks:
        dx = lm.x - wrist.x
        dy = lm.y - wrist.y
        dz = lm.z - wrist.z
        dist = np.sqrt(dx*dx + dy*dy + dz*dz)
        if dist > max_dist:
            max_dist = dist
        shifted.append((dx, dy, dz))
        
    vec = []
    for dx, dy, dz in shifted:
        vec.extend([dx / max_dist, dy / max_dist, dz / max_dist])
    return vec

def process_zip_file(zip_path):
    if not os.path.exists(zip_path):
        print(f"[ERROR] ZIP file '{zip_path}' not found!")
        return

    print("=" * 65)
    print("   AUTOMATED ZIP DATASET EXTRACTOR & COMPUTER VISION TRAINER")
    print("=" * 65)
    print(f"\n[INFO] Extracting '{zip_path}' to temporary directory '{TEMP_DIR}'...")

    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    os.makedirs(TEMP_DIR)

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(TEMP_DIR)

    print("[SUCCESS] Extraction complete. Scanning extracted files...")

    # 1. Check if ZIP contained a dataset.csv directly
    csv_files = glob.glob(os.path.join(TEMP_DIR, "**", "*.csv"), recursive=True)
    if csv_files:
        print(f"[INFO] Found CSV dataset in ZIP: {csv_files[0]}")
        df_new = pd.read_csv(csv_files[0])
        if os.path.exists(DATASET_CSV):
            df_old = pd.read_csv(DATASET_CSV)
            df_final = pd.concat([df_old, df_new], ignore_index=True)
        else:
            df_final = df_new
        df_final.to_csv(DATASET_CSV, index=False)
        print(f"[SUCCESS] Updated '{DATASET_CSV}' with {len(df_new)} rows from ZIP CSV.")
    else:
        # 2. Extract landmarks from images in subfolders
        image_extensions = ("*.jpg", "*.jpeg", "*.png", "*.bmp")
        image_files = []
        for ext in image_extensions:
            image_files.extend(glob.glob(os.path.join(TEMP_DIR, "**", ext), recursive=True))

        print(f"[INFO] Found {len(image_files)} images across gesture class folders.")

        if not image_files:
            print("[WARNING] No image or CSV files found in the ZIP archive.")
            shutil.rmtree(TEMP_DIR)
            return

        hands = mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.5
        )

        records = []
        success_count = 0
        failed_count = 0

        for idx, img_path in enumerate(image_files):
            # Infer label from folder name (e.g. temp_unzipped_dataset/A/img1.jpg -> "A")
            parent_dir = os.path.basename(os.path.dirname(img_path))
            label = parent_dir if parent_dir != os.path.basename(TEMP_DIR) else "CustomSign"

            img = cv2.imread(img_path)
            if img is None:
                continue

            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb_img)

            if results.multi_hand_landmarks:
                norm_vec = normalize_landmarks(results.multi_hand_landmarks[0].landmark)
                records.append(norm_vec + [label])
                success_count += 1
            else:
                failed_count += 1

            if (idx + 1) % 50 == 0 or (idx + 1) == len(image_files):
                print(f"   [Processing] {idx + 1}/{len(image_files)} images... (Detected hands in {success_count})")

        hands.close()

        if records:
            cols = [f"f_{i}" for i in range(63)] + ["label"]
            df_new = pd.DataFrame(records, columns=cols)

            if os.path.exists(DATASET_CSV):
                df_existing = pd.read_csv(DATASET_CSV)
                df_final = pd.concat([df_existing, df_new], ignore_index=True)
            else:
                df_final = df_new

            df_final.to_csv(DATASET_CSV, index=False)
            print(f"\n[SUCCESS] Extracted MediaPipe 21-hand landmarks from {success_count} images!")
            print(f"[INFO] Appended to '{DATASET_CSV}'. Total samples: {len(df_final)}")

    # Clean up temporary directory
    shutil.rmtree(TEMP_DIR)

    # 3. Train ML Model
    print("\n[INFO] Triggering Machine Learning Model Training on extracted dataset...")
    train_model()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        zip_file = sys.argv[1]
    else:
        zip_file = input("Enter path to dataset ZIP file (e.g. 'asl_dataset.zip'): ").strip()
    
    if zip_file.startswith('"') and zip_file.endswith('"'):
        zip_file = zip_file[1:-1]
        
    process_zip_file(zip_file)
