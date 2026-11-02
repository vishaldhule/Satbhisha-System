AI Virtual Hand Mouse: Part 1
By Pulse of AI (Swayam Dhawale)
Controls PC cursor with Palm Center (Landmark 9) and Exponential Moving Average (EMA) smoothing.
Index + Thumb Pinch triggers instant left click. ESC key to exit.
"""
import math
import cv2
import mediapipe as mp
import numpy as np
import pyautogui
# Zero internal latency
pyautogui.PAUSE = 0
pyautogui.FAILSAFE = False
cam = cv2.VideoCapture(0)
cam.set(cv2.CAP_PROP_BUFFERSIZE, 1)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
max_num_hands=1,
min_detection_confidence=0.8,
min_tracking_confidence=0.8,
)
mp_draw = mp.solutions.drawing_utils
screen_w, screen_h = pyautogui.size()
# Landmark IDs
PALM_CENTER = 9 # Base knuckle of middle finger (true hand/palm anchor)
INDEX_TIP = 8
THUMB_TIP = 4
# Smoothing & Tracking Configuration
ALPHA = 0.20 # EMA smoothing factor
DEADZONE = 4 # Ignores micro hand jitters
FRAME_MARGIN = 140 # Active boundary box margin
PINCH_THRESH = 35 # Distance between thumb & index for click
smooth_x, smooth_y = screen_w // 2, screen_h // 2
is_pinched = False
print("[ONLINE] Palm Tracking + Pinch Click Active. Press ESC to quit.")
while True:
ret, frame = cam.read()
if not ret:
break
frame = cv2.flip(frame, 1)
h, w, _ = frame.shape
rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
# Visual tracking zone box
cv2.rectangle(
frame,
(FRAME_MARGIN, FRAME_MARGIN),
(w - FRAME_MARGIN, h - FRAME_MARGIN),
(255, 0, 255),
2,
)
results = hands.process(rgb_frame)
if results.multi_hand_landmarks:
for hand_landmarks in results.multi_hand_landmarks:
mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
3
# 1. Palm Center Tracking (Cursor Movement)
palm_pt = hand_landmarks.landmark[PALM_CENTER]
palm_x, palm_y = int(palm_pt.x * w), int(palm_pt.y * h)
# Map palm position inside bounding box to full screen
raw_x = np.interp(palm_x, [FRAME_MARGIN, w - FRAME_MARGIN], [0, screen_w])
raw_y = np.interp(palm_y, [FRAME_MARGIN, h - FRAME_MARGIN], [0, screen_h])
# EMA Smoothing filter
target_x = smooth_x + ALPHA * (raw_x - smooth_x)
target_y = smooth_y + ALPHA * (raw_y - smooth_y)
# Apply deadband filter to eliminate resting tremor
if abs(target_x - smooth_x) > DEADZONE or abs(target_y - smooth_y) > DEADZONE:
smooth_x, smooth_y = target_x, target_y
pyautogui.moveTo(int(smooth_x), int(smooth_y))
# Draw glowing cyan center dot on palm
cv2.circle(frame, (palm_x, palm_y), 9, (255, 255, 0), -1)
# 2. Independent Index + Thumb Pinch for Click
idx_pt = hand_landmarks.landmark[INDEX_TIP]
thm_pt = hand_landmarks.landmark[THUMB_TIP]
idx_x, idx_y = int(idx_pt.x * w), int(idx_pt.y * h)
thm_x, thm_y = int(thm_pt.x * w), int(thm_pt.y * h)
pinch_dist = math.hypot(thm_x - idx_x, thm_y - idx_y)
cv2.circle(frame, (idx_x, idx_y), 6, (0, 255, 0), -1)
cv2.circle(frame, (thm_x, thm_y), 6, (0, 255, 0), -1)
cv2.line(frame, (idx_x, idx_y), (thm_x, thm_y), (0, 255, 255), 2)
if pinch_dist < PINCH_THRESH:
if not is_pinched:
pyautogui.click()
is_pinched = True
cv2.putText(frame, "CLICK!", (40, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
else:
is_pinched = False
cv2.imshow("Palm-Gaze Virtual Mouse", frame)
if cv2.waitKey(1) & 0xFF == 27:
break
cam.release()
cv2.destroyAllWindows()