import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import os
import time

"""
Sign Language Dataset Collector Script (Python + OpenCV + MediaPipe)
Extracts 21 3D hand landmark coordinates normalized relative to wrist & palm scale,
and appends to dataset CSV file.
"""

# Configuration
DATASET_PATH = "dataset.csv"
SAMPLES_PER_CLASS = 100

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

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

def collect_data():
    cap = cv2.VideoCapture(0)
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )
    
    print("=" * 60)
    print("   COMPUTER VISION SIGN LANGUAGE DATASET COLLECTOR")
    print("=" * 60)
    label_name = input("Enter gesture label name (e.g. 'A', 'Hello', 'Help'): ").strip()
    
    if not label_name:
        print("Invalid label. Exiting.")
        return

    print(f"\n[INFO] Starting recording for label '{label_name}'...")
    print("Press 's' to start capturing samples. Press 'q' to quit.")

    collecting = False
    count = 0
    records = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to access camera.")
            break
            
        frame = cv2.flip(frame, 1)
        h, w, c = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        status_text = f"Label: {label_name} | Captured: {count}/{SAMPLES_PER_CLASS}"
        color = (0, 255, 0) if collecting else (0, 165, 255)
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style()
                )
                
                if collecting and count < SAMPLES_PER_CLASS:
                    norm_vec = normalize_landmarks(hand_landmarks.landmark)
                    records.append(norm_vec + [label_name])
                    count += 1
                    time.sleep(0.05)
                    
                    if count >= SAMPLES_PER_CLASS:
                        collecting = False
                        print(f"\n[SUCCESS] Successfully captured {SAMPLES_PER_CLASS} samples for '{label_name}'!")
        
        cv2.putText(frame, status_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        cv2.putText(frame, "Press 'S' to Start | 'Q' to Quit", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        cv2.imshow("Sign Language Dataset Collector", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s') or key == ord('S'):
            collecting = True
            print("[INFO] Recording started...")
        elif key == ord('q') or key == ord('Q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    if records:
        cols = [f"f_{i}" for i in range(63)] + ["label"]
        df_new = pd.DataFrame(records, columns=cols)
        
        if os.path.exists(DATASET_PATH):
            df_existing = pd.read_csv(DATASET_PATH)
            df_final = pd.concat([df_existing, df_new], ignore_index=True)
        else:
            df_final = df_new
            
        df_final.to_csv(DATASET_PATH, index=False)
        print(f"[INFO] Saved dataset to {DATASET_PATH}. Total samples: {len(df_final)}")

if __name__ == "__main__":
    collect_data()
