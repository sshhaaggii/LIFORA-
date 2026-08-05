import cv2
import mediapipe as mp
import numpy as np
import joblib
import os

"""
Real-Time Computer Vision Sign Language Detector (Python + OpenCV + MediaPipe)
Uses trained ML model (.pkl) for live inference on webcam feed.
"""

MODEL_PATH = "sign_language_model.pkl"

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
    return np.array(vec).reshape(1, -1)

def run_live_detector():
    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Trained model file '{MODEL_PATH}' not found!")
        print("Please run 'python train_sign_model.py' first to train the model.")
        return

    print(f"[INFO] Loading ML Model from '{MODEL_PATH}'...")
    model = joblib.load(MODEL_PATH)
    print("[SUCCESS] ML Model loaded successfully!")

    cap = cv2.VideoCapture(0)
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )

    print("\n[INFO] Starting Live OpenCV Sign Language Detector. Press 'Q' to quit.\n")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Camera error.")
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw hand landmarks
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style()
                )

                # Normalize features and predict
                vec = normalize_landmarks(hand_landmarks.landmark)
                prediction = model.predict(vec)[0]
                probabilities = model.predict_proba(vec)[0]
                confidence = np.max(probabilities)

                # Draw UI predictions box
                cv2.rectangle(frame, (10, 10), (450, 100), (20, 20, 20), -1)
                cv2.rectangle(frame, (10, 10), (450, 100), (0, 255, 180), 2)
                
                label_str = f"Sign Detected: {prediction}"
                conf_str = f"Confidence: {confidence * 100:.1f}%"

                cv2.putText(frame, label_str, (25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
                cv2.putText(frame, conf_str, (25, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        cv2.imshow("Live Computer Vision Sign Language Detector", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_live_detector()
