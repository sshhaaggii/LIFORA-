/**
 * ML & Landmark Processing Engine for Computer Vision Sign Language Detection
 */

// Landmark Indices
export const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
};

// Hand Connections Skeleton Pairs
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky & Palm
];

/**
 * Normalizes 21 3D hand landmarks relative to wrist (landmark 0) and max palm scale.
 * Returns a 63-element array [x0, y0, z0, ..., x20, y20, z20].
 */
export function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  let maxDist = 0.0001;

  const shifted = landmarks.map(lm => {
    const dx = lm.x - wrist.x;
    const dy = lm.y - wrist.y;
    const dz = (lm.z || 0) - (wrist.z || 0);
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > maxDist) maxDist = dist;
    return { dx, dy, dz };
  });

  const normalizedVector = [];
  for (let i = 0; i < 21; i++) {
    normalizedVector.push(shifted[i].dx / maxDist);
    normalizedVector.push(shifted[i].dy / maxDist);
    normalizedVector.push(shifted[i].dz / maxDist);
  }

  return normalizedVector;
}

/**
 * Calculates Euclidean distance between two 3D landmarks
 */
export function getDistance(lm1, lm2) {
  if (!lm1 || !lm2) return 0;
  const dx = lm1.x - lm2.x;
  const dy = lm1.y - lm2.y;
  const dz = (lm1.z || 0) - (lm2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates angle between three landmarks in degrees (vertex at lm2)
 */
export function getAngle(lm1, lm2, lm3) {
  if (!lm1 || !lm2 || !lm3) return 0;
  const v1 = { x: lm1.x - lm2.x, y: lm1.y - lm2.y, z: (lm1.z || 0) - (lm2.z || 0) };
  const v2 = { x: lm3.x - lm2.x, y: lm3.y - lm2.y, z: (lm3.z || 0) - (lm2.z || 0) };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 * mag2 === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Evaluates finger extension status using rotation-invariant PIP joint angles & distances
 */
export function checkFingerStates(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];

  // Joint Angles (Straight line = ~180 deg, Curled = < 120 deg)
  const indexAngle = getAngle(landmarks[5], landmarks[6], landmarks[8]);
  const middleAngle = getAngle(landmarks[9], landmarks[10], landmarks[12]);
  const ringAngle = getAngle(landmarks[13], landmarks[14], landmarks[16]);
  const pinkyAngle = getAngle(landmarks[17], landmarks[18], landmarks[20]);
  const thumbAngle = getAngle(landmarks[1], landmarks[2], landmarks[4]);

  // Distances relative to wrist
  const thumbPinkyMcpDist = getDistance(landmarks[4], landmarks[17]);
  const indexTipWristDist = getDistance(landmarks[8], wrist);
  const indexMcpWristDist = getDistance(landmarks[5], wrist);
  const middleTipWristDist = getDistance(landmarks[12], wrist);
  const middleMcpWristDist = getDistance(landmarks[9], wrist);
  const ringTipWristDist = getDistance(landmarks[16], wrist);
  const ringMcpWristDist = getDistance(landmarks[13], wrist);
  const pinkyTipWristDist = getDistance(landmarks[20], wrist);
  const pinkyMcpWristDist = getDistance(landmarks[17], wrist);

  const thumbExtended = thumbAngle > 130 || thumbPinkyMcpDist > 0.15;
  const indexExtended = indexAngle > 130 || indexTipWristDist > indexMcpWristDist * 1.05;
  const middleExtended = middleAngle > 130 || middleTipWristDist > middleMcpWristDist * 1.05;
  const ringExtended = ringAngle > 130 || ringTipWristDist > ringMcpWristDist * 1.05;
  const pinkyExtended = pinkyAngle > 130 || pinkyTipWristDist > pinkyMcpWristDist * 1.05;

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
    angles: { thumbAngle, indexAngle, middleAngle, ringAngle, pinkyAngle }
  };
}

/**
 * Fast & Accurate Heuristic Classifier for ASL Alphabets, Numbers, & Phrases
 */
export function classifyHeuristic(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const f = checkFingerStates(landmarks);
  if (!f) return null;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  const thumbIndexDist = getDistance(thumbTip, indexTip);
  const indexMiddleDist = getDistance(indexTip, middleTip);

  // 1. "I Love You" (Thumb, Index, Pinky extended; Middle, Ring curled)
  if (f.thumb && f.index && !f.middle && !f.ring && f.pinky) {
    return { gesture: "I Love You", category: "Phrase", confidence: 0.96, icon: "🤟" };
  }

  // 2. "Peace / V" vs "U" (Index & Middle extended, others curled)
  if (f.index && f.middle && !f.ring && !f.pinky) {
    if (indexMiddleDist > 0.04) {
      return { gesture: "V / Peace", category: "Alphabet", confidence: 0.95, icon: "✌️" };
    }
    return { gesture: "U", category: "Alphabet", confidence: 0.92, icon: "✌️" };
  }

  // 3. "W / 3" (Index, Middle, Ring extended)
  if (f.index && f.middle && f.ring && !f.pinky) {
    return { gesture: "W / 3", category: "Alphabet", confidence: 0.93, icon: "🤟" };
  }

  // 4. "B / 4" (Index, Middle, Ring, Pinky extended)
  if (!f.thumb && f.index && f.middle && f.ring && f.pinky) {
    return { gesture: "B / 4", category: "Alphabet", confidence: 0.94, icon: "🖐️" };
  }

  // 5. "Open Palm / Hello / 5" (All 5 fingers extended)
  if (f.thumb && f.index && f.middle && f.ring && f.pinky) {
    return { gesture: "Hello / Open Hand", category: "Phrase", confidence: 0.96, icon: "✋" };
  }

  // 6. "OK Gesture / F" (Thumb and Index touching, Middle/Ring/Pinky extended)
  if (thumbIndexDist < 0.10 && f.middle && f.ring && f.pinky) {
    return { gesture: "OK / F", category: "Alphabet", confidence: 0.95, icon: "👌" };
  }

  // 7. "Thumbs Up / Yes" vs "Thumbs Down / No"
  if (f.thumb && !f.index && !f.middle && !f.ring && !f.pinky) {
    if (thumbTip.y < wrist.y) {
      return { gesture: "Yes / Thumbs Up", category: "Phrase", confidence: 0.96, icon: "👍" };
    } else {
      return { gesture: "No / Thumbs Down", category: "Phrase", confidence: 0.94, icon: "👎" };
    }
  }

  // 8. "1 / D / Index Pointing" (Only Index extended)
  if (f.index && !f.middle && !f.ring && !f.pinky) {
    return { gesture: "1 / D", category: "Alphabet", confidence: 0.94, icon: "☝️" };
  }

  // 9. "Rock / Horns" (Index and Pinky extended)
  if (f.index && !f.middle && !f.ring && f.pinky) {
    return { gesture: "Rock / Horns", category: "Phrase", confidence: 0.93, icon: "🤘" };
  }

  // 10. "Y / Phone" (Thumb and Pinky extended)
  if (f.thumb && !f.index && !f.middle && !f.ring && f.pinky) {
    return { gesture: "Y / Phone", category: "Alphabet", confidence: 0.95, icon: "🤙" };
  }

  // 11. "L Gesture" (Thumb and Index open, others curled)
  if (f.thumb && f.index && !f.middle && !f.ring && !f.pinky) {
    return { gesture: "L", category: "Alphabet", confidence: 0.94, icon: "👆" };
  }

  // 12. "A / Fist" (All fingers curled tight)
  if (!f.index && !f.middle && !f.ring && !f.pinky) {
    return { gesture: "A / Fist", category: "Alphabet", confidence: 0.91, icon: "✊" };
  }

  // 13. "C Gesture" (Curved fingers forming C shape)
  if (thumbIndexDist < 0.14 && thumbIndexDist > 0.04 && !f.middle && !f.pinky) {
    return { gesture: "C", category: "Alphabet", confidence: 0.89, icon: "🤏" };
  }

  // 14. "Pinky Promise / I" (Only Pinky extended)
  if (!f.thumb && !f.index && !f.middle && !f.ring && f.pinky) {
    return { gesture: "I", category: "Alphabet", confidence: 0.92, icon: "🤙" };
  }

  // Fallback whenever hand is present in camera view
  return { gesture: "Hand Detected", category: "General", confidence: 0.80, icon: "✋" };
}

/**
 * In-Browser Custom K-Nearest Neighbors (KNN) & Multi-Layer Perceptron ML Trainer Engine
 */
export class CustomMLEngine {
  constructor() {
    this.samples = [];
    this.labels = new Set();
  }

  addSample(vector, label) {
    if (!vector || vector.length !== 63 || !label) return false;
    this.samples.push({ vector, label: label.trim() });
    this.labels.add(label.trim());
    return true;
  }

  clearSamples(label = null) {
    if (label) {
      this.samples = this.samples.filter(s => s.label !== label);
      this.labels.delete(label);
    } else {
      this.samples = [];
      this.labels.clear();
    }
  }

  predict(vector, k = 3) {
    if (this.samples.length === 0 || !vector || vector.length !== 63) {
      return null;
    }

    const effectiveK = Math.min(k, this.samples.length);

    const distances = this.samples.map(sample => {
      let sumSq = 0;
      for (let i = 0; i < 63; i++) {
        const diff = vector[i] - sample.vector[i];
        sumSq += diff * diff;
      }
      return { distance: Math.sqrt(sumSq), label: sample.label };
    });

    distances.sort((a, b) => a.distance - b.distance);
    const topK = distances.slice(0, effectiveK);

    const votes = {};
    topK.forEach(item => {
      votes[item.label] = (votes[item.label] || 0) + 1;
    });

    let bestLabel = null;
    let maxVotes = -1;
    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        bestLabel = label;
      }
    }

    const confidence = maxVotes / effectiveK;
    const avgDistance = topK[0]?.distance || 0;

    return {
      gesture: bestLabel,
      confidence: Math.min(0.99, Math.max(0.60, confidence * (1 / (1 + avgDistance)))),
      sampleCount: this.samples.length,
      category: "Custom Trained ML",
      icon: "🤖",
    };
  }

  exportJSON() {
    return JSON.stringify({
      version: "1.0",
      timestamp: new Date().toISOString(),
      samplesCount: this.samples.length,
      labels: Array.from(this.labels),
      samples: this.samples,
    }, null, 2);
  }

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.samples)) {
        this.samples = data.samples;
        this.labels = new Set(data.labels || data.samples.map(s => s.label));
        return { success: true, count: this.samples.length };
      }
    } catch (e) {
      console.error("Failed to import model JSON:", e);
    }
    return { success: false, count: 0 };
  }

  getStats() {
    const stats = {};
    this.samples.forEach(s => {
      stats[s.label] = (stats[s.label] || 0) + 1;
    });
    return {
      totalSamples: this.samples.length,
      labelCount: this.labels.size,
      breakdown: stats,
    };
  }
}
