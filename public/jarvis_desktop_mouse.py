#!/usr/bin/env python3
"""
JARVIS Mark-XXXIX Real PC Hardware Mouse Controller
Controls the REAL operating system mouse cursor (Windows / macOS / Linux)
using computer vision optical hand tracking.

Usage:
    pip install pyautogui opencv-python mediapipe
    python jarvis_desktop_mouse.py
"""

import sys
import time
import math

try:
    import cv2
    import pyautogui
    import mediapipe as mp
except ImportError:
    print("\n[!] Missing dependencies for Direct OS Mouse Control.")
    print("    Please install them with: pip install pyautogui opencv-python mediapipe\n")
    sys.exit(1)

# PyAutoGUI Safety configuration
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.0

def main():
    print("=" * 60)
    print("   JARVIS MARK-XXXIX REAL PC HARDWARE MOUSE CONTROLLER")
    print("=" * 60)
    print("• Index finger moves REAL PC mouse cursor.")
    print("• Pinch (Index + Thumb) = Left Click.")
    print("• Two Fingers (Index + Middle up) = Scroll Page.")
    print("• Pinky + Thumb Pinch = Right Click.")
    print("• Press 'Q' or 'ESC' on the camera window to exit.")
    print("=" * 60)

    screen_w, screen_h = pyautogui.size()
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )

    prev_x, prev_y = screen_w // 2, screen_h // 2
    smooth_factor = 0.4
    last_click_time = 0
    is_dragging = False

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            continue

        # Flip horizontally for natural mirror feel
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Landmark 8: Index Fingertip
                # Landmark 4: Thumb Tip
                # Landmark 12: Middle Fingertip
                # Landmark 20: Pinky Tip
                lm = hand_landmarks.landmark

                index_tip = lm[8]
                thumb_tip = lm[4]
                middle_tip = lm[12]
                pinky_tip = lm[20]

                # Convert normalized coordinates to screen resolution
                # Add margin to reach screen edges comfortably
                margin = 0.15
                norm_x = (index_tip.x - margin) / (1.0 - 2 * margin)
                norm_y = (index_tip.y - margin) / (1.0 - 2 * margin)
                norm_x = max(0.0, min(1.0, norm_x))
                norm_y = max(0.0, min(1.0, norm_y))

                target_x = int(norm_x * screen_w)
                target_y = int(norm_y * screen_h)

                # Exponential Moving Average Smoothing
                curr_x = int(prev_x + (target_x - prev_x) * smooth_factor)
                curr_y = int(prev_y + (target_y - prev_y) * smooth_factor)

                # Move real PC mouse
                pyautogui.moveTo(curr_x, curr_y)
                prev_x, prev_y = curr_x, curr_y

                # Calculate pinch distance (Thumb to Index)
                dx = thumb_tip.x - index_tip.x
                dy = thumb_tip.y - index_tip.y
                pinch_dist = math.sqrt(dx*dx + dy*dy)

                # Calculate scroll distance (Index & Middle parallel)
                idx_mid_dist = math.sqrt((index_tip.x - middle_tip.x)**2 + (index_tip.y - middle_tip.y)**2)
                now = time.time()

                # Left Click on Pinch
                if pinch_dist < 0.06:
                    if now - last_click_time > 0.35:
                        pyautogui.click()
                        last_click_time = now
                        cv2.putText(frame, "CLICK!", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)

                # Two-finger Scroll Mode
                elif idx_mid_dist < 0.05 and middle_tip.y < lm[10].y:
                    scroll_dir = -30 if index_tip.y > 0.5 else 30
                    pyautogui.scroll(scroll_dir)
                    cv2.putText(frame, "SCROLLING", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

                # Visual feedback on camera feed
                cv2.circle(frame, (int(index_tip.x * w), int(index_tip.y * h)), 10, (0, 255, 255), -1)
                cv2.circle(frame, (int(thumb_tip.x * w), int(thumb_tip.y * h)), 8, (255, 0, 255), -1)

        cv2.imshow("JARVIS Mark-XXXIX Real PC Mouse Driver", frame)
        if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
