/**
 * High-Performance Client-Side Optical Hand & Fingertip Tracking Engine
 * Zero-dependency, pure HTML5 Canvas & TypedArray Computer Vision.
 * Engineered for Rock-Solid Stability, Tremor Elimination, and Precision Control.
 */

export interface HandTrackerConfig {
  speedMultiplier: number; // 0.8 to 2.5x
  smoothing: number; // 0.20 to 0.90 (Higher = smoother, less jitter)
  deadzone: number; // 0.002 to 0.030 (minimum delta to eliminate tremor)
  pinchThreshold: number; // 0.05 to 0.18 (pinch distance for click)
  clickCooldownMs: number; // 150 to 500ms
  acceleration: number; // 1.0 to 2.0x
  isMirrored: boolean; // Flip horizontal for natural mirror view
}

export const DEFAULT_HAND_CONFIG: HandTrackerConfig = {
  speedMultiplier: 1.1,
  smoothing: 0.70,
  deadzone: 0.012,
  pinchThreshold: 0.09,
  clickCooldownMs: 320,
  acceleration: 1.0,
  isMirrored: true,
};

export interface HandTrackingResult {
  detected: boolean;
  handX: number; // 0 to 1 normalized
  handY: number; // 0 to 1 normalized
  fingertipX: number; // 0 to 1 normalized (Index pointer)
  fingertipY: number; // 0 to 1 normalized
  thumbX: number; // 0 to 1 normalized
  thumbY: number; // 0 to 1 normalized
  pinchDistance: number; // Normalized distance between fingertip and thumb
  isPinching: boolean;
  gesture: 'IDLE' | 'TRACKING' | 'CLICK' | 'PINCH' | 'SCROLL' | 'FIST' | 'OPEN_PALM';
  confidence: number;
  rawTipX: number;
  rawTipY: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export class OpticalHandTracker {
  private filteredX = 0.5;
  private filteredY = 0.5;
  private targetX = 0.5;
  private targetY = 0.5;
  private isPinchingState = false;
  private lastClickTime = 0;
  private consecutiveLostFrames = 0;

  /**
   * Process a video frame and extract hand centroid, fingertip, thumb, and pinch status
   */
  public processFrame(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    config: HandTrackerConfig = DEFAULT_HAND_CONFIG
  ): HandTrackingResult {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return this.emptyResult();
    }

    const width = 160;
    const height = 120;
    canvas.width = width;
    canvas.height = height;

    // Draw downscaled frame
    ctx.drawImage(video, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let totalSkinPixels = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    const skinPoints: { x: number; y: number }[] = [];
    const stride = 2; // Fast 60 FPS sub-sampling

    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (this.isSkinColor(r, g, b)) {
          totalSkinPixels++;
          sumX += x;
          sumY += y;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          skinPoints.push({ x, y });
        }
      }
    }

    // Minimum area to reject background noise, maximum to reject entire wall
    const minPixels = 70;
    const maxPixels = (width * height) / 4 * 0.75;

    if (totalSkinPixels < minPixels || totalSkinPixels > maxPixels) {
      this.consecutiveLostFrames++;
      return this.emptyResult();
    }

    this.consecutiveLostFrames = 0;

    // 1. Hand centroid
    const rawCentroidX = sumX / totalSkinPixels;
    const rawCentroidY = sumY / totalSkinPixels;

    // 2. Robust Fingertip Detection via Cluster Centroid (Rejects Single-Pixel Noise)
    // Sort skin points by Y (ascending, top-to-bottom)
    skinPoints.sort((a, b) => a.y - b.y);

    // Skip top 2% of pixels to completely ignore stray hot-pixels or hair noise
    const noiseCutoff = Math.max(1, Math.floor(skinPoints.length * 0.02));
    const topClusterSize = Math.max(5, Math.floor(skinPoints.length * 0.12));
    const validTopPoints = skinPoints.slice(noiseCutoff, noiseCutoff + topClusterSize);

    let topClusterX = 0;
    let topClusterY = 0;
    for (const pt of validTopPoints) {
      topClusterX += pt.x;
      topClusterY += pt.y;
    }
    topClusterX /= validTopPoints.length;
    topClusterY /= validTopPoints.length;

    // 3. Robust Secondary Lateral Cluster (Thumb Detection)
    // Search for the lateral outermost point below the fingertip
    let thumbX = topClusterX;
    let thumbY = topClusterY + 12;
    let maxDist = 0;

    // Take points between top cluster and centroid
    for (let i = topClusterSize; i < skinPoints.length; i += 3) {
      const p = skinPoints[i];
      if (p.y > topClusterY + 6 && p.y < rawCentroidY + 15) {
        const dist = Math.hypot(p.x - topClusterX, p.y - topClusterY);
        if (dist > maxDist) {
          maxDist = dist;
          thumbX = p.x;
          thumbY = p.y;
        }
      }
    }

    // Normalize coordinates [0.0 to 1.0]
    let rawTipNormX = topClusterX / width;
    let rawTipNormY = topClusterY / height;
    let rawThumbNormX = thumbX / width;
    let rawThumbNormY = thumbY / height;

    if (config.isMirrored) {
      rawTipNormX = 1.0 - rawTipNormX;
      rawThumbNormX = 1.0 - rawThumbNormX;
    }

    // 4. Natural Active Interaction Workspace Mapping
    // In camera space, center ~60% of frame comfortably covers 100% of the screen
    // Speed multiplier expands or contracts the active zone
    const baseMarginX = 0.18 / Math.max(0.6, config.speedMultiplier);
    const baseMarginY = 0.20 / Math.max(0.6, config.speedMultiplier);

    const mappedX = Math.max(0.002, Math.min(0.998, (rawTipNormX - baseMarginX) / (1.0 - 2 * baseMarginX)));
    const mappedY = Math.max(0.002, Math.min(0.998, (rawTipNormY - baseMarginY) / (1.0 - 2 * baseMarginY)));

    // 5. Adaptive Tremor Deadzone & One-Euro Filter
    const deltaX = mappedX - this.filteredX;
    const deltaY = mappedY - this.filteredY;
    const dist = Math.hypot(deltaX, deltaY);

    if (dist > config.deadzone) {
      // Hand is intentionally moving
      const effectiveDist = dist - config.deadzone;

      // Dynamic responsiveness:
      // High speed flicks adapt smoothly; micro movements stay stable
      const baseAlpha = 1.0 - Math.min(0.92, Math.max(0.15, config.smoothing));
      const dynamicSpeedBoost = Math.min(0.55, effectiveDist * 4.0);
      const alpha = Math.min(0.85, baseAlpha + dynamicSpeedBoost);

      // Velocity Clamp: Prevent erratic teleportation if lighting flickers
      const maxDelta = 0.22 * config.speedMultiplier;
      const clampedDeltaX = Math.max(-maxDelta, Math.min(maxDelta, deltaX));
      const clampedDeltaY = Math.max(-maxDelta, Math.min(maxDelta, deltaY));

      this.filteredX += clampedDeltaX * alpha;
      this.filteredY += clampedDeltaY * alpha;
    }
    // Clamping to screen viewport
    this.filteredX = Math.max(0.001, Math.min(0.999, this.filteredX));
    this.filteredY = Math.max(0.001, Math.min(0.999, this.filteredY));

    // 6. Pinch-to-Click with Hysteresis (Prevents Click-Chatter)
    const pinchDist = Math.hypot(rawTipNormX - rawThumbNormX, rawTipNormY - rawThumbNormY);
    
    // Hysteresis: Easier to stay pinched, harder to falsely trigger
    const engageThreshold = config.pinchThreshold;
    const releaseThreshold = config.pinchThreshold * 1.35;

    let isPinching = this.isPinchingState;
    if (!this.isPinchingState && pinchDist < engageThreshold) {
      isPinching = true;
    } else if (this.isPinchingState && pinchDist > releaseThreshold) {
      isPinching = false;
    }

    let gesture: HandTrackingResult['gesture'] = 'TRACKING';
    const now = Date.now();

    if (isPinching) {
      if (!this.isPinchingState && now - this.lastClickTime > config.clickCooldownMs) {
        gesture = 'CLICK';
        this.lastClickTime = now;
      } else {
        gesture = 'PINCH';
      }
    } else {
      const boxHeight = maxY - minY;
      const boxWidth = maxX - minX;
      if (boxHeight < 20 || boxWidth < 20) {
        gesture = 'FIST';
      } else if (totalSkinPixels > 950) {
        gesture = 'OPEN_PALM';
      }
    }

    this.isPinchingState = isPinching;

    return {
      detected: true,
      handX: rawTipNormX,
      handY: rawTipNormY,
      fingertipX: this.filteredX,
      fingertipY: this.filteredY,
      thumbX: rawThumbNormX,
      thumbY: rawThumbNormY,
      pinchDistance: pinchDist,
      isPinching,
      gesture,
      confidence: Math.min(1.0, totalSkinPixels / 500),
      rawTipX: rawTipNormX,
      rawTipY: rawTipNormY,
      boundingBox: {
        x: config.isMirrored ? width - maxX : minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    };
  }

  /**
   * Fast, reliable skin tone classification (RGB + YCbCr hybrid)
   */
  private isSkinColor(r: number, g: number, b: number): boolean {
    const rgbCheck =
      r > 90 &&
      g > 40 &&
      b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 &&
      r > g &&
      r > b;

    if (!rgbCheck) return false;

    // YCbCr color space conversion
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cr = (r - y) * 0.713 + 128;
    const cb = (b - y) * 0.564 + 128;

    return cr >= 133 && cr <= 173 && cb >= 77 && cb <= 127;
  }

  private emptyResult(): HandTrackingResult {
    return {
      detected: false,
      handX: this.filteredX,
      handY: this.filteredY,
      fingertipX: this.filteredX,
      fingertipY: this.filteredY,
      thumbX: this.filteredX,
      thumbY: this.filteredY,
      pinchDistance: 1.0,
      isPinching: false,
      gesture: 'IDLE',
      confidence: 0,
      rawTipX: this.filteredX,
      rawTipY: this.filteredY,
    };
  }
}
