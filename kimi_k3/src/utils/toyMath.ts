/**
 * Pure, verifiable toy mathematical implementations for Kimi K3 interactive components.
 * Sourced directly from Kimi K3 Technical Report (arXiv:2607.24653v2):
 * - KDA recurrence with channel-wise lower-bounded decay (Eq. 1, 2, 4)
 * - Block AttnRes learned pseudo-query retrieval (Eq. 7, 8, 9)
 * - Stable LatentMoE with SiTU-GLU (Eq. 10, 11)
 * - Quantile Balancing (QB) load balancing (Eq. 12, 13 & Appendix B)
 * - Per-Head Muon Newton-Schulz iterations (Sec. 2.5)
 * - Unified memory calculator
 */

// ==========================================
// 1. KDA (Kimi Delta Attention) Step Computation
// ==========================================
export function l2Normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0));
  return norm > 1e-8 ? vec.map(x => x / norm) : vec;
}

/**
 * Official Kimi-K3 Lower-Bounded Gating mapping (Eq. 2.114 - 2.120)
 * g_i = g_min * Sigmoid(exp(A) * z_i) in (g_min, 0)
 * alpha_i = exp(g_i) in (exp(g_min), 1)
 * with g_min = -5, alpha_min = exp(-5) ~= 0.006738
 */
export function computeK3Gate(z: number, A: number = 0, gMin: number = -5.0): { g: number; alpha: number } {
  const scaledZ = Math.exp(A) * z;
  const sig = 1.0 / (1.0 + Math.exp(-scaledZ));
  const g = gMin * sig; // in (gMin, 0)
  const alpha = Math.exp(g); // in (exp(gMin), 1)
  return { g, alpha };
}

/**
 * Kimi Linear un-bounded negative softplus mapping for comparative analysis:
 * g_i = -exp(A) * Softplus(z_i) in (-inf, 0)
 */
export function computeKimiLinearGate(z: number, A: number = 0): { g: number; alpha: number } {
  const sp = z > 20 ? z : Math.log(1.0 + Math.exp(z));
  const g = -Math.exp(A) * sp;
  const alpha = Math.exp(g);
  return { g, alpha };
}

export interface KdaStepResult {
  retainedState: number[][]; // S_bar = Diag(alpha) * S_{t-1}
  decayedS: number[][];      // alias for retainedState
  predictedValue: number[];  // v_hat = S_bar^T * k
  vHat: number[];            // alias for predictedValue
  deltaError: number[];      // delta = v - v_hat
  deltaV: number[];          // alias for deltaError
  outerProduct: number[][];  // Delta_S = beta * k * delta^T
  deltaS: number[][];        // alias for outerProduct
  updatedState: number[][];  // S_t = S_bar + Delta_S
  nextS: number[][];         // alias for updatedState
  output: number[];          // o = S_t^T * q
  predictionNorm: number;
  deltaNorm: number;
  decayChangeNorm: number;   // ||S_bar - S_{t-1}||_F
  deltaWriteNorm: number;    // ||Delta_S||_F
}

export function computeKdaStep(
  prevState: number[][],
  k: number[],
  v: number[],
  q: number[],
  alpha: number[], // Channel-wise decay (length 4)
  beta: number     // Write strength in (0, 1)
): KdaStepResult {
  const dimK = 4;
  const dimV = 4;

  // 1. Channel-wise decay: S_bar = Diag(alpha) * S_{t-1}
  // Row i of S_{t-1} is scaled by alpha[i]
  const retainedState: number[][] = [];
  let decayDiffSq = 0;
  for (let r = 0; r < dimK; r++) {
    retainedState[r] = [];
    const a = alpha[r] ?? 1.0;
    for (let c = 0; c < dimV; c++) {
      const prevVal = prevState[r][c];
      const decayedVal = prevVal * a;
      retainedState[r][c] = decayedVal;
      const diff = decayedVal - prevVal;
      decayDiffSq += diff * diff;
    }
  }
  const decayChangeNorm = Math.sqrt(decayDiffSq);

  // 2. Value prediction: v_hat = S_bar^T * k  (dimV vector)
  // v_hat[c] = sum_r S_bar[r][c] * k[r]
  const predictedValue: number[] = new Array(dimV).fill(0);
  for (let c = 0; c < dimV; c++) {
    let sum = 0;
    for (let r = 0; r < dimK; r++) {
      sum += retainedState[r][c] * k[r];
    }
    predictedValue[c] = sum;
  }

  // 3. Prediction error: delta = v - v_hat
  const deltaError: number[] = new Array(dimV).fill(0);
  for (let c = 0; c < dimV; c++) {
    deltaError[c] = v[c] - predictedValue[c];
  }

  // 4. State update: Delta_S = beta * (k * delta^T)
  // Delta_S[r][c] = beta * k[r] * delta[c]
  const outerProduct: number[][] = [];
  const updatedState: number[][] = [];
  let deltaWriteSq = 0;
  for (let r = 0; r < dimK; r++) {
    outerProduct[r] = [];
    updatedState[r] = [];
    for (let c = 0; c < dimV; c++) {
      const dS = beta * k[r] * deltaError[c];
      outerProduct[r][c] = dS;
      deltaWriteSq += dS * dS;
      updatedState[r][c] = retainedState[r][c] + dS;
    }
  }
  const deltaWriteNorm = Math.sqrt(deltaWriteSq);

  // 5. Read output: o = S_t^T * q  (dimV vector)
  // o[c] = sum_r S_t[r][c] * q[r]
  const output: number[] = new Array(dimV).fill(0);
  for (let c = 0; c < dimV; c++) {
    let sum = 0;
    for (let r = 0; r < dimK; r++) {
      sum += updatedState[r][c] * q[r];
    }
    output[c] = sum;
  }

  const predictionNorm = Math.sqrt(predictedValue.reduce((acc, x) => acc + x * x, 0));
  const deltaNorm = Math.sqrt(deltaError.reduce((acc, x) => acc + x * x, 0));

  return {
    retainedState,
    decayedS: retainedState,
    predictedValue,
    vHat: predictedValue,
    deltaError,
    deltaV: deltaError,
    outerProduct,
    deltaS: outerProduct,
    updatedState,
    nextS: updatedState,
    output,
    predictionNorm,
    deltaNorm,
    decayChangeNorm,
    deltaWriteNorm,
  };
}

// ==========================================
// 2. Block AttnRes Computation
// ==========================================
export interface AttnResResult {
  keysRMS: number[][];
  normalizedKeys: number[][]; // alias for keysRMS
  rawScores: number[];
  logits: number[];           // alias for rawScores
  weights: number[];          // softmax probabilities summing to 1
  retrievedValue: number[];
  output: number[];           // alias for retrievedValue
}

export type BlockSourceItem = { label?: string; vec: number[] } | number[];

export function computeBlockAttnRes(
  blockSources: BlockSourceItem[],
  pseudoQuery: number[]
): AttnResResult {
  const eps = 1e-6;
  const numSources = blockSources.length;
  const dim = pseudoQuery.length;

  const rawVectors: number[][] = blockSources.map((item) => {
    return Array.isArray(item) ? item : item.vec;
  });

  // 1. RMSNorm on each block key vector
  const keysRMS: number[][] = rawVectors.map((vec) => {
    const meanSquare = vec.reduce((acc, val) => acc + val * val, 0) / dim;
    const rms = Math.sqrt(meanSquare + eps);
    return vec.map((val) => val / rms);
  });

  // 2. Dot-product attention scores: s_i = q^T * RMSNorm(b_i)
  const rawScores: number[] = keysRMS.map((kVec) => {
    return pseudoQuery.reduce((acc, qVal, idx) => acc + qVal * kVec[idx], 0);
  });

  // 3. Softmax over scores
  const maxScore = Math.max(...rawScores);
  const exps = rawScores.map((s) => Math.exp(s - maxScore));
  const sumExp = exps.reduce((acc, val) => acc + val, 0);
  const weights = exps.map((e) => e / sumExp);

  // 4. Weighted combination: r = sum_i weights[i] * b_i (un-normalized values)
  const retrievedValue: number[] = new Array(dim).fill(0);
  for (let i = 0; i < numSources; i++) {
    const w = weights[i];
    const b = rawVectors[i];
    for (let d = 0; d < dim; d++) {
      retrievedValue[d] += w * b[d];
    }
  }

  return {
    keysRMS,
    normalizedKeys: keysRMS,
    rawScores,
    logits: rawScores,
    weights,
    retrievedValue,
    output: retrievedValue,
  };
}

// ==========================================
// 3. Quantile Balancing (QB) Computation
// ==========================================
export interface QbStepResult {
  mTokens: number;
  nExperts: number;
  kActive: number;
  targetLoad: number;
  biasedScores: number[][];
  cutoffs: number[]; // alpha_i^(t)
  margins: number[][]; // M_{i,j} = s_{i,j} - alpha_i
  candidateBiases: number[]; // -quantile
  centeredBiases: number[]; // b^(t+1)
  initialLoads: number[];
  balancedLoads: number[];
  initialRoutes: number[][];
  balancedRoutes: number[][];
}

export function computeQuantileBalancingStep(
  rawScores: number[][], // m x n
  currentBias: number[], // length n
  kActive: number = 1
): QbStepResult {
  const m = rawScores.length;
  const n = rawScores[0].length;
  const targetLoad = (m * kActive) / n;

  // 1. Biased scores: s_{i,j} + b_j
  const biasedScores: number[][] = [];
  const initialRoutes: number[][] = [];
  const initialLoads: number[] = new Array(n).fill(0);
  const cutoffs: number[] = new Array(m).fill(0);

  for (let i = 0; i < m; i++) {
    biasedScores[i] = [];
    const pairs: Array<{ expertIdx: number; score: number }> = [];
    for (let j = 0; j < n; j++) {
      const bScore = rawScores[i][j] + currentBias[j];
      biasedScores[i][j] = bScore;
      pairs.push({ expertIdx: j, score: bScore });
    }
    // Sort descending by biased score
    pairs.sort((a, b) => b.score - a.score);

    // Initial chosen experts (Top-k)
    const chosen = pairs.slice(0, kActive).map((p) => p.expertIdx);
    initialRoutes.push(chosen);
    chosen.forEach((idx) => initialLoads[idx]++);

    // Cutoff alpha_i^(t) is the (k+1)-th largest score
    // In Top-(k+1) selection, index k is the (k+1)-th item (0-indexed)
    cutoffs[i] = pairs[Math.min(pairs.length - 1, kActive)].score;
  }

  // 2. Margins: M_{i,j} = s_{i,j} - alpha_i^(t)
  const margins: number[][] = [];
  for (let i = 0; i < m; i++) {
    margins[i] = [];
    for (let j = 0; j < n; j++) {
      margins[i][j] = rawScores[i][j] - cutoffs[i];
    }
  }

  // 3. For each expert j, find (targetLoad + 1)-th largest margin
  // candidate_b_j = - (q+1)-th largest margin
  const candidateBiases: number[] = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    const colMargins: number[] = [];
    for (let i = 0; i < m; i++) {
      colMargins.push(margins[i][j]);
    }
    colMargins.sort((a, b) => b - a); // descending
    // (targetLoad + 1)-th largest margin is at index targetLoad (0-indexed)
    const cutoffMargin = colMargins[Math.min(colMargins.length - 1, targetLoad)];
    candidateBiases[j] = -cutoffMargin;
  }

  // 4. Mean-centering
  const meanCandidate = candidateBiases.reduce((a, b) => a + b, 0) / n;
  const centeredBiases = candidateBiases.map((b) => b - meanCandidate);

  // 5. Test routing under next bias b^(t+1)
  const balancedRoutes: number[][] = [];
  const balancedLoads: number[] = new Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    const pairs: Array<{ expertIdx: number; score: number }> = [];
    for (let j = 0; j < n; j++) {
      pairs.push({ expertIdx: j, score: rawScores[i][j] + centeredBiases[j] });
    }
    pairs.sort((a, b) => b.score - a.score);
    const chosen = pairs.slice(0, kActive).map((p) => p.expertIdx);
    balancedRoutes.push(chosen);
    chosen.forEach((idx) => balancedLoads[idx]++);
  }

  return {
    mTokens: m,
    nExperts: n,
    kActive,
    targetLoad,
    biasedScores,
    cutoffs,
    margins,
    candidateBiases,
    centeredBiases,
    initialLoads,
    balancedLoads,
    initialRoutes,
    balancedRoutes,
  };
}

// ==========================================
// 4. SiTU-GLU Activation Computation
// ==========================================
export function computeSiTU(x: number, beta1: number = 4, beta2: number = 25): {
  gate: number;
  up: number;
  output: number;
  swiglu: number;
} {
  // Gate branch: beta_1 * tanh(x / beta_1) * sigmoid(x)
  const tanhGate = Math.tanh(x / beta1);
  const sigmoidGate = 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, x))));
  const gate = beta1 * tanhGate * sigmoidGate;

  // Up branch: beta_2 * tanh(x / beta_2)
  const up = beta2 * Math.tanh(x / beta2);

  const output = gate * up;

  // Baseline SwiGLU: (x * sigmoid(x)) * x
  const swiglu = x * sigmoidGate * x;

  return { gate, up, output, swiglu };
}

// ==========================================
// 5. Per-Head Muon Newton-Schulz Iteration
// ==========================================
export interface MuonIterationResult {
  step: number;
  matrix: number[][];
  frobeniusNorm: number;
  orthogonalityError: number; // ||X^T * X - I||_F
}

export function computeNewtonSchulzStep(
  inputMatrix: number[][],
  maxIterations: number = 3
): MuonIterationResult[] {
  const rows = inputMatrix.length;
  const cols = inputMatrix[0].length;
  const transposedInitially = rows < cols;
  
  // Matrix transpose helper
  const transpose = (A: number[][]): number[][] => {
    const r = A.length;
    const c = A[0].length;
    const T: number[][] = [];
    for (let j = 0; j < c; j++) {
      T[j] = [];
      for (let i = 0; i < r; i++) {
        T[j][i] = A[i][j];
      }
    }
    return T;
  };

  // Ensure m >= n for standard Newton-Schulz X^T X formulation
  const M = transposedInitially ? transpose(inputMatrix) : inputMatrix;
  const n = M[0].length; // inner dimension for X^T X
  const results: MuonIterationResult[] = [];

  // Matrix multiplication helper
  const matMul = (A: number[][], B: number[][]): number[][] => {
    const rA = A.length;
    const cB = B[0].length;
    const inner = B.length;
    const C: number[][] = [];
    for (let i = 0; i < rA; i++) {
      C[i] = [];
      for (let j = 0; j < cB; j++) {
        let sum = 0;
        for (let k = 0; k < inner; k++) {
          sum += A[i][k] * B[k][j];
        }
        C[i][j] = sum;
      }
    }
    return C;
  };

  // Frobenius norm
  const frobNorm = (A: number[][]): number => {
    let sum = 0;
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
        sum += A[i][j] * A[i][j];
      }
    }
    return Math.sqrt(sum);
  };

  // Orthogonality error ||X^T X - I||_F
  const calcOrthoError = (X: number[][]): number => {
    const XtX = matMul(transpose(X), X);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const target = i === j ? 1 : 0;
        const diff = XtX[i][j] - target;
        sum += diff * diff;
      }
    }
    return Math.sqrt(sum);
  };

  // Initial scaling: X_0 = M / (||M||_F * sqrt(n/m)) or standard M / ||M||_F
  const initialNorm = frobNorm(M);
  let X: number[][] = M.map((row) => row.map((val) => val / (initialNorm || 1)));

  const recordStep = (stepIdx: number, mat: number[][]) => {
    const finalMat = transposedInitially ? transpose(mat) : mat;
    results.push({
      step: stepIdx,
      matrix: finalMat.map((r) => [...r]),
      frobeniusNorm: frobNorm(finalMat),
      orthogonalityError: calcOrthoError(mat),
    });
  };

  recordStep(0, X);

  // Newton-Schulz update: X_{k+1} = 0.5 * X_k * (3*I_n - X_k^T * X_k)
  for (let it = 1; it <= maxIterations; it++) {
    const Xt = transpose(X);
    const XtX = matMul(Xt, X); // n x n
    const threeI_minus_XtX: number[][] = [];
    for (let i = 0; i < n; i++) {
      threeI_minus_XtX[i] = [];
      for (let j = 0; j < n; j++) {
        const diag = i === j ? 3 : 0;
        threeI_minus_XtX[i][j] = diag - XtX[i][j];
      }
    }
    const nextX_raw = matMul(X, threeI_minus_XtX); // m x n
    X = nextX_raw.map((row) => row.map((v) => 0.5 * v));

    recordStep(it, X);
  }

  return results;
}

// Compute singular values of an m x n matrix via Jacobi eigenvalue decomposition of M^T M (or M M^T)
export function computeSingularValues(matrix: number[][]): number[] {
  const m = matrix.length;
  if (m === 0) return [];
  const n = matrix[0].length;
  if (n === 0) return [];

  // Work with the smaller square Gram matrix: either M^T M (n x n) or M M^T (m x m)
  const useMtM = m >= n;
  const dim = useMtM ? n : m;
  const Gram: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));

  if (useMtM) {
    // Gram = M^T * M
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < m; k++) {
          sum += matrix[k][i] * matrix[k][j];
        }
        Gram[i][j] = sum;
      }
    }
  } else {
    // Gram = M * M^T
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += matrix[i][k] * matrix[j][k];
        }
        Gram[i][j] = sum;
      }
    }
  }

  // Classic Jacobi eigenvalue algorithm for symmetric positive semi-definite matrix
  const A = Gram.map((row) => [...row]);
  const maxIters = 40;
  for (let iter = 0; iter < maxIters; iter++) {
    let maxOffDiag = 0;
    let p = 0;
    let q = 1;
    for (let i = 0; i < dim; i++) {
      for (let j = i + 1; j < dim; j++) {
        const val = Math.abs(A[i][j]);
        if (val > maxOffDiag) {
          maxOffDiag = val;
          p = i;
          q = j;
        }
      }
    }
    if (maxOffDiag < 1e-10) break;

    const diff = A[q][q] - A[p][p];
    const theta = 0.5 * Math.atan2(2 * A[p][q], diff);
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    const App = c * c * A[p][p] - 2 * s * c * A[p][q] + s * s * A[q][q];
    const Aqq = s * s * A[p][p] + 2 * s * c * A[p][q] + c * c * A[q][q];
    A[p][q] = 0;
    A[q][p] = 0;
    A[p][p] = App;
    A[q][q] = Aqq;

    for (let k = 0; k < dim; k++) {
      if (k !== p && k !== q) {
        const Akp = c * A[k][p] - s * A[k][q];
        const Akq = s * A[k][p] + c * A[k][q];
        A[k][p] = Akp;
        A[p][k] = Akp;
        A[k][q] = Akq;
        A[q][k] = Akq;
      }
    }
  }

  const eigenvalues = Array.from({ length: dim }, (_, i) => Math.max(0, A[i][i]));
  const singularValues = eigenvalues.map((ev) => Math.sqrt(ev)).sort((a, b) => b - a);
  return singularValues;
}

export interface HeadMuonMetrics {
  headIndex: number;
  initialFrobenius: number;
  stepFrobenius: number;
  spectralNorm: number; // max singular value
  singularValues: number[];
  orthogonalityError: number;
  matrix: number[][];
}

export interface MuonComparisonStep {
  step: number;
  fullModeHeads: HeadMuonMetrics[];
  perHeadModeHeads: HeadMuonMetrics[];
  fullMatrixFrobenius: number;
  fullMatrixOrthoError: number;
}

export function runMuonComparison(
  headMatrices: number[][][],
  maxIterations: number = 6
): MuonComparisonStep[] {
  const numHeads = headMatrices.length;
  if (numHeads === 0) return [];
  const headRows = headMatrices[0].length;

  // Initial head Frobenius norms
  const initialHeadNorms = headMatrices.map((mat) => {
    let sum = 0;
    for (const r of mat) {
      for (const v of r) sum += v * v;
    }
    return Math.sqrt(sum);
  });

  // 1. Full Matrix Newton-Schulz
  // Concatenate heads vertically into a single large matrix
  const fullMatrix: number[][] = [];
  for (let h = 0; h < numHeads; h++) {
    for (let r = 0; r < headRows; r++) {
      fullMatrix.push([...headMatrices[h][r]]);
    }
  }
  const fullNsSteps = computeNewtonSchulzStep(fullMatrix, maxIterations);

  // 2. Per-Head Newton-Schulz (each head run independently)
  const perHeadNsSteps = headMatrices.map((hMat) => computeNewtonSchulzStep(hMat, maxIterations));

  const results: MuonComparisonStep[] = [];

  for (let k = 0; k <= maxIterations; k++) {
    const fullStep = fullNsSteps[k] || fullNsSteps[fullNsSteps.length - 1];

    // Deconstruct the full matrix update back into head blocks
    const fullModeHeads: HeadMuonMetrics[] = [];
    for (let h = 0; h < numHeads; h++) {
      const headSlice = fullStep.matrix.slice(h * headRows, (h + 1) * headRows);
      const sVals = computeSingularValues(headSlice);
      let fNorm = 0;
      for (const r of headSlice) {
        for (const v of r) fNorm += v * v;
      }
      fNorm = Math.sqrt(fNorm);

      fullModeHeads.push({
        headIndex: h,
        initialFrobenius: initialHeadNorms[h],
        stepFrobenius: fNorm,
        spectralNorm: sVals[0] || 0,
        singularValues: sVals,
        orthogonalityError: 0, // Orthogonality is defined globally for full mode
        matrix: headSlice,
      });
    }

    // Per-Head mode metrics
    const perHeadModeHeads: HeadMuonMetrics[] = [];
    for (let h = 0; h < numHeads; h++) {
      const hStep = perHeadNsSteps[h][k] || perHeadNsSteps[h][perHeadNsSteps[h].length - 1];
      const sVals = computeSingularValues(hStep.matrix);

      perHeadModeHeads.push({
        headIndex: h,
        initialFrobenius: initialHeadNorms[h],
        stepFrobenius: hStep.frobeniusNorm,
        spectralNorm: sVals[0] || 0,
        singularValues: sVals,
        orthogonalityError: hStep.orthogonalityError,
        matrix: hStep.matrix,
      });
    }

    results.push({
      step: k,
      fullModeHeads,
      perHeadModeHeads,
      fullMatrixFrobenius: fullStep.frobeniusNorm,
      fullMatrixOrthoError: fullStep.orthogonalityError,
    });
  }

  return results;
}

// ==========================================
// 6. Unified Cache Memory Calculator
// ==========================================
export interface MemoryEstimate {
  batchSize: number;
  contextTokens: number;
  kdaRecurrentBytes: number;
  kdaRecurrentGiB: number;
  kdaRecurrentStateGiB: number;
  mlaLatentKvBytes: number;
  mlaLatentKvGiB: number;
  standardMhaKvBytes: number;
  standardMhaKvGiB: number;
  mlaSavingsVsMhaRatio: number;
  totalK3CacheGiB: number;
}

export function calculateMemoryEstimates(
  batchSize: number,
  contextTokens: number,
  bytesPerFloat: number = 2, // 2 for FP16/BF16
  dc: number = 512
): MemoryEstimate {
  // KDA: 69 layers, 96 heads, d_k=128, d_v=128
  // State S_t is [d_k x d_v] per head. O(1) in context length!
  const kdaLayers = 69;
  const numHeads = 96;
  const dk = 128;
  const dv = 128;
  const kdaRecurrentBytes = batchSize * kdaLayers * numHeads * dk * dv * bytesPerFloat;
  const kdaRecurrentGiB = kdaRecurrentBytes / (1024 * 1024 * 1024);

  // MLA: 24 layers, low-rank latent KV vector d_c per token. O(N) in context length!
  const mlaLayers = 24;
  const mlaLatentKvBytes = batchSize * contextTokens * mlaLayers * dc * bytesPerFloat;
  const mlaLatentKvGiB = mlaLatentKvBytes / (1024 * 1024 * 1024);

  // Standard MHA baseline: 93 layers, 96 heads, 2 (K and V), head_dim 128
  const totalLayers = 93;
  const headDim = 128;
  const standardMhaKvBytes = batchSize * contextTokens * totalLayers * 2 * numHeads * headDim * bytesPerFloat;
  const standardMhaKvGiB = standardMhaKvBytes / (1024 * 1024 * 1024);

  const mlaSavingsVsMhaRatio = standardMhaKvBytes > 0 && mlaLatentKvBytes > 0
    ? standardMhaKvBytes / mlaLatentKvBytes
    : 1;

  const totalK3CacheGiB = kdaRecurrentGiB + mlaLatentKvGiB;

  return {
    batchSize,
    contextTokens,
    kdaRecurrentBytes,
    kdaRecurrentGiB,
    kdaRecurrentStateGiB: kdaRecurrentGiB,
    mlaLatentKvBytes,
    mlaLatentKvGiB,
    standardMhaKvBytes,
    standardMhaKvGiB,
    mlaSavingsVsMhaRatio,
    totalK3CacheGiB,
  };
}
