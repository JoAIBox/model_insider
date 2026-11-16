import React, { useState, useEffect, useRef, useMemo } from 'react';
import { runMuonComparison, type MuonComparisonStep, type HeadMuonMetrics } from '../utils/toyMath';

// Preset A: Disparity scenario with dominant heads
const DISPARITY_HEADS: number[][][] = [
  // Head 1: Dominant gradient momentum (large norm ~3.15)
  [
    [2.1, 1.4, -0.8],
    [1.2, 1.6, 0.5],
    [-0.7, 0.9, 1.3]
  ],
  // Head 2: Weak / sparse gradient momentum (small norm ~0.35)
  [
    [0.2, 0.1, -0.1],
    [0.1, 0.2, 0.1],
    [-0.1, 0.1, 0.15]
  ],
  // Head 3: Moderate gradient momentum (norm ~1.5)
  [
    [0.9, 0.6, -0.4],
    [0.5, 0.8, 0.3],
    [-0.4, 0.3, 0.7]
  ],
  // Head 4: Dominant gradient momentum (large norm ~2.4)
  [
    [1.5, 1.1, -0.7],
    [0.8, 1.3, 0.4],
    [-0.5, 0.7, 1.0]
  ]
];

// Preset B: Rank-deficient scenario to prove NS limits
const RANK_DEFICIENT_HEADS: number[][][] = [
  // Head 1: Normal full-rank
  [
    [1.2, 0.8, -0.3],
    [0.4, 1.1, 0.5],
    [-0.5, 0.3, 0.9]
  ],
  // Head 2: Rank-1 degenerate matrix (outer product: [1, 0.5, 0.5] * [1, 0.5, 0.5]^T)
  // Two zero singular values! NS cannot resurrect zero singular values.
  [
    [1.0, 0.5, 0.5],
    [0.5, 0.25, 0.25],
    [0.5, 0.25, 0.25]
  ],
  // Head 3: Rank-2 matrix (Row 3 = Row 1 + Row 2; one zero singular value)
  [
    [0.8, 0.4, 0.2],
    [0.2, 0.6, 0.4],
    [1.0, 1.0, 0.6]
  ],
  // Head 4: Small norm full-rank
  [
    [0.3, 0.2, -0.1],
    [0.1, 0.3, 0.2],
    [-0.1, 0.1, 0.25]
  ]
];

export const PerHeadMuonSimulator: React.FC = () => {
  const [scenario, setScenario] = useState<'disparity' | 'rankDeficient'>('disparity');
  const [optimizerMode, setOptimizerMode] = useState<'full' | 'perHead'>('perHead');
  const [currentStep, setCurrentStep] = useState<number>(5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [selectedHeadIdx, setSelectedHeadIdx] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeHeads = scenario === 'disparity' ? DISPARITY_HEADS : RANK_DEFICIENT_HEADS;

  // Run authentic Newton-Schulz on both Full-Matrix and Per-Head modes across 6 steps
  const comparisonHistory = useMemo<MuonComparisonStep[]>(() => {
    return runMuonComparison(activeHeads, 6);
  }, [activeHeads]);

  // Current iteration snapshot
  const activeSnapshot = comparisonHistory[currentStep] || comparisonHistory[0];
  const activeMetrics: HeadMuonMetrics[] = optimizerMode === 'perHead' 
    ? activeSnapshot.perHeadModeHeads 
    : activeSnapshot.fullModeHeads;

  // Auto-play iteration timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentStep((prev) => (prev >= 6 ? 0 : prev + 1));
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Render authentic Canvas visualization driven strictly by computed metrics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 550);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    ctx.clearRect(0, 0, width, height);

    const numHeads = activeMetrics.length;
    const startX = 24;
    const startY = 44;
    const gap = 10;
    const headWidth = Math.max(70, (width - startX * 2 - (numHeads - 1) * gap) / numHeads);
    const headHeight = 105;

    // Header Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Outfit, sans-serif';
    const modeLabel = optimizerMode === 'full' 
      ? 'Global Full-Matrix Muon: Energy concentrates in dominant heads' 
      : 'Kimi-K3 Per-Head Muon: Independent orthogonalization per head';
    ctx.fillText(modeLabel, startX, 24);

    // Subtitle / Step Indicator
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px monospace';
    ctx.fillText(`Newton-Schulz Iteration Step k = ${currentStep} / 6`, width - 210, 24);

    // Draw Attention Head Boxes
    for (let i = 0; i < numHeads; i++) {
      const metric = activeMetrics[i];
      const x = startX + i * (headWidth + gap);
      const y = startY;
      const isSelected = selectedHeadIdx === i;

      // Color scheme based on state
      const primaryColor = optimizerMode === 'full'
        ? (metric.stepFrobenius > 1.0 ? '#EF4444' : metric.stepFrobenius < 0.4 ? '#64748B' : '#F59E0B')
        : (metric.singularValues.some((s) => s < 0.2) ? '#F59E0B' : '#10B981');

      // Card Background & Border
      ctx.strokeStyle = isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(x, y, headWidth, headHeight);
      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.08)' : '#070913';
      ctx.fillRect(x, y, headWidth, headHeight);

      // Card Header
      ctx.fillStyle = isSelected ? '#38BDF8' : '#CBD5E1';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Head ${i + 1}`, x + headWidth / 2, y + 16);

      // Initial Norm Tag
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px monospace';
      ctx.fillText(`||G||_F: ${metric.initialFrobenius.toFixed(2)}`, x + headWidth / 2, y + 29);

      // Vertical Fill Bar based on True Computed Spectral Norm (max ~ 1.5)
      const maxDisplayScale = 2.0;
      const fillHeight = 44;
      const normRatio = Math.min(1.0, metric.spectralNorm / maxDisplayScale);
      const barH = fillHeight * normRatio;
      const barY = y + headHeight - 24 - barH;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(x + 8, y + headHeight - 24 - fillHeight, headWidth - 16, fillHeight);

      ctx.fillStyle = primaryColor;
      ctx.fillRect(x + 8, barY, headWidth - 16, barH);

      // Metric readout: spectral norm
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`σ₁:${metric.spectralNorm.toFixed(2)}`, x + headWidth / 2, y + headHeight - 10);
    }

    // BOTTOM SECTION: True Mathematical Convergence Trajectory Chart
    const chartX = startX;
    const chartY = startY + headHeight + 20;
    const chartW = width - startX * 2;
    const chartH = height - chartY - 22;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(chartX, chartY, chartW, chartH);
    ctx.fillStyle = '#070913';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Actual Spectral Norm (σ₁) Evolution Across Newton-Schulz Steps (k = 0..6)', chartX + 10, chartY + 14);

    // Reference Target Line at σ = 1.0
    const targetY = chartY + chartH - (1.0 / 2.0) * (chartH - 24) - 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(chartX, targetY);
    ctx.lineTo(chartX + chartW, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#64748B';
    ctx.font = '9px monospace';
    ctx.fillText('Target σ₁ = 1.0 (Unit Spectral Sphere)', chartX + chartW - 190, targetY - 4);

    // Plot true calculated curves for each head from comparisonHistory
    for (let h = 0; h < numHeads; h++) {
      const isSelected = selectedHeadIdx === h;
      const initNorm = activeHeads[h].flat().reduce((s, v) => s + v * v, 0);
      const lineColor = optimizerMode === 'full'
        ? (initNorm > 5 ? '#EF4444' : initNorm < 0.5 ? '#64748B' : '#F59E0B')
        : (h === 0 ? '#10B981' : h === 1 ? '#38BDF8' : h === 2 ? '#A78BFA' : '#F59E0B');

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = isSelected ? 2.5 : 1.2;
      ctx.beginPath();

      for (let stepIdx = 0; stepIdx < comparisonHistory.length; stepIdx++) {
        const stepData = comparisonHistory[stepIdx];
        const headMetrics = optimizerMode === 'perHead' ? stepData.perHeadModeHeads[h] : stepData.fullModeHeads[h];
        const cx = chartX + 30 + (stepIdx / (comparisonHistory.length - 1)) * (chartW - 60);
        // Map spectral norm in [0, 2.0] to chart height
        const cy = chartY + chartH - (headMetrics.spectralNorm / 2.0) * (chartH - 24) - 6;

        if (stepIdx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Draw dot at currentStep
      const currentHeadMetric = activeMetrics[h];
      const dotX = chartX + 30 + (currentStep / (comparisonHistory.length - 1)) * (chartW - 60);
      const dotY = chartY + chartH - (currentHeadMetric.spectralNorm / 2.0) * (chartH - 24) - 6;
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(dotX, dotY, isSelected ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [optimizerMode, currentStep, activeMetrics, comparisonHistory, selectedHeadIdx, activeHeads]);

  const selectedMetric = activeMetrics[selectedHeadIdx] || activeMetrics[0];

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 2.8 - Per-Head Muon Optimizer (Per-Head Orthogonalized Optimizer)</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Per-Head Muon Matrix Parameter Optimizer</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.05rem', marginBottom: '20px', lineHeight: '1.5' }}>
        Kimi-K3 applies Muon to 2D matrix weights and partitions the Q/K/V momentum matrices by attention head before Newton-Schulz orthogonalization. Below is an authentic live computation on a 4-head momentum tensor (each head 3×3; full matrix 12×3), demonstrating how Per-Head prevents strong-gradient heads from starving weak-gradient heads.
      </p>

      {/* Scenario & Optimizer Controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#070913', padding: '4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className={`btn ${scenario === 'disparity' ? 'active' : ''}`}
            onClick={() => setScenario('disparity')}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            📊 Scenario 1: Gradient Disparity (H1, H4 Strong)
          </button>
          <button
            className={`btn ${scenario === 'rankDeficient' ? 'active' : ''}`}
            onClick={() => setScenario('rankDeficient')}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            ⚠️ Scenario 2: Rank-Deficient Heads (NS Bound Limits)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: '#070913', padding: '4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className={`btn ${optimizerMode === 'full' ? 'active' : ''}`}
            onClick={() => setOptimizerMode('full')}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            Traditional Global Muon
          </button>
          <button
            className={`btn ${optimizerMode === 'perHead' ? 'active' : ''}`}
            onClick={() => setOptimizerMode('perHead')}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            Kimi-K3 Per-Head Muon
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        {/* Left: Canvas Simulator */}
        <div className="card">
          <div style={{ background: '#02040a', borderRadius: '8px', padding: '10px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '270px' }} />
          </div>

          {/* Stepper Toolbar */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                Newton-Schulz Step: <b>{currentStep}</b> / 6
              </span>
              <input
                type="range"
                min="0"
                max="6"
                value={currentStep}
                onChange={(e) => setCurrentStep(Number(e.target.value))}
                style={{ width: '130px', accentColor: '#10B981' }}
                aria-label="Newton Schulz step slider"
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                style={{ padding: '4px 10px', fontSize: '0.85rem' }}
              >
                ◀ Prev
              </button>
              <button
                className="btn"
                onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
                style={{ padding: '4px 10px', fontSize: '0.85rem' }}
              >
                Next ▶
              </button>
              <button
                className="btn"
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ padding: '4px 12px', fontSize: '0.85rem', background: isPlaying ? '#EF4444' : '#10B981', color: '#000', fontWeight: 'bold' }}
              >
                {isPlaying ? 'Pause' : 'Auto Play'}
              </button>
            </div>
          </div>

          {/* Head Selection Chips */}
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>Inspect Head:</span>
            {activeMetrics.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHeadIdx(idx)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: selectedHeadIdx === idx ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedHeadIdx === idx ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: selectedHeadIdx === idx ? '#38BDF8' : '#CBD5E1',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Head {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Right Details & Live Inspection Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '8px' }}>
              🔬 Live Head State (Step {currentStep} · Head {selectedHeadIdx + 1})
            </h3>
            
            <div style={{ background: '#070913', padding: '12px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              <div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Initial Norm ||G_h||_F</div>
                <div style={{ color: '#CBD5E1', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {selectedMetric.initialFrobenius.toFixed(3)}
                </div>
              </div>
              <div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Current Norm ||U_h||_F</div>
                <div style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {selectedMetric.stepFrobenius.toFixed(3)}
                </div>
              </div>
              <div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Spectral Norm σ₁</div>
                <div style={{ color: '#38BDF8', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {selectedMetric.spectralNorm.toFixed(3)}
                </div>
              </div>
              <div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Singular Values [σ₁, σ₂, σ₃]</div>
                <div style={{ color: '#F59E0B', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  [{selectedMetric.singularValues.map((s) => s.toFixed(2)).join(', ')}]
                </div>
              </div>
            </div>

            {/* Matrix Viewer */}
            <div style={{ marginTop: '10px', background: '#02040a', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>
                Extracted 3×3 Update Matrix U_h:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', maxWidth: '240px' }}>
                {selectedMetric.matrix.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`cell-${r}-${c}`}
                      style={{
                        background: '#0F172A',
                        padding: '4px 2px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: val >= 0 ? '#CBD5E1' : '#F87171',
                        borderRadius: '3px'
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Educational Insights */}
          <div style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.5', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <b style={{ color: '#E2E8F0' }}>Key Mathematical Takeaways:</b>
            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
              <li>
                <b>Full-Matrix Muon:</b> Concatenating heads into a single matrix means Newton-Schulz orthonormalizes the full matrix columns. Dominant heads (e.g. H1 with norm 3.15) take up the lion's share of the spectral update, leaving weak heads (H2 with norm 0.35) with negligible update steps.
              </li>
              <li>
                <b>Per-Head Muon:</b> Orthogonalizing each head matrix independently guarantees that every head receives an update scaled to unit spectral norm (σ₁ ≈ 1.0), equalizing the effective learning rate across all attention heads.
              </li>
              <li>
                <b>Rank &amp; Iteration Limits:</b> In Scenario 2, if a head is rank-deficient (e.g. Rank 1), zero singular values remain exactly 0.0 under Newton-Schulz polynomial iteration (X · (3I - XᵀX)). Thus, finite steps or low rank do not guarantee all singular values equal 1.0.
              </li>
            </ul>
          </div>

          {/* Collapsible Math Panel */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <button
              className="btn"
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex', fontSize: '0.9rem', padding: '6px 10px' }}
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>{showFormula ? '▼ Collapse Newton-Schulz Derivation' : '▶ Click to View Newton-Schulz Derivation'}</span>
            </button>

            {showFormula && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="formula-box" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>Newton-Schulz Orthogonalization Iteration:</strong>
                  <div style={{ fontFamily: 'monospace', margin: '4px 0', fontSize: '0.88rem', color: '#38BDF8' }}>
                    X_(k+1) = 0.5 · X_k · (3 · I_n - X_kᵀ · X_k)
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                    Where X₀ = M / ||M||_F. Each step pushes singular values toward 1.0 according to the cubic mapping f(σ) = 0.5 σ (3 - σ²). Fixed points are σ = 0 and σ = 1.
                  </div>
                </div>

                <div style={{ background: '#02040a', borderRadius: '6px', padding: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <strong style={{ color: '#6EE7B7', fontSize: '0.82rem' }}>PyTorch Per-Head Muon Pseudocode:</strong>
                  <pre style={{ margin: '6px 0 0', color: '#CBD5E1', fontSize: '0.78rem', lineHeight: '1.45', overflowX: 'auto' }}>{`# Partition Q/K/V momentum [H, d_h, d_model] along head dimension H:
for h in range(num_heads):
    X = momentum[h]  # [d_h, d_model]
    X = X / (torch.norm(X, p='fro') + 1e-7)
    for _ in range(ns_steps):
        X = 0.5 * X @ (3.0 * torch.eye(X.shape[-1], device=X.device) - X.T @ X)
    momentum[h] = X
`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
