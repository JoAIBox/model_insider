import React, { useState, useEffect, useRef } from 'react';

export const PerHeadMuonSimulator: React.FC = () => {
  const [optimizerMode, setOptimizerMode] = useState<'full' | 'perHead'>('perHead');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [nsIterations, setNsIterations] = useState<number>(5);
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gradient magnitudes of 8 attention heads
  // Head 0 and Head 4 have massive gradient norms, others are small
  const headGradientNorms = [2.4, 0.3, 0.4, 0.2, 3.1, 0.5, 0.1, 0.3];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const draw = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 550);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 300);

      ctx.clearRect(0, 0, width, height);
      tick++;

      const startX = 30;
      const startY = 50;
      const headWidth = (width - 60) / 8 - 8;
      const headHeight = 100;
      const gap = 8;

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Outfit';
      ctx.fillText(optimizerMode === 'full' ? 'Traditional Full-Matrix Muon Optimizer Update (Imbalanced)' : 'Kimi-K3 Per-Head Muon Optimizer Update (Perfect Equilibrium)', startX, 25);

      // Draw 8 Attention Heads
      for (let i = 0; i < 8; i++) {
        const x = startX + i * (headWidth + gap);
        const y = startY;

        const gradNorm = headGradientNorms[i];
        let updateScale = 0;
        let color = '#38BDF8';
        const isBigGrad = i === 0 || i === 4;

        if (optimizerMode === 'full') {
          // Full-matrix: high-gradient heads dominate
          const totalGrad = headGradientNorms.reduce((a, b) => a + b, 0);
          updateScale = (gradNorm / totalGrad) * 8 * 0.8;

          if (isBigGrad) {
            // Alarm flashing red
            const flashVal = 0.5 + Math.sin(tick / 5) * 0.3;
            color = `rgba(239, 68, 68, ${flashVal})`;
          } else {
            // Dull grey
            color = '#334155';
          }
        } else {
          // Per-Head: Balanced around 0.85
          updateScale = 0.82 + Math.sin(tick / 15 + i) * 0.04;
          color = '#10B981';
        }

        // Draw head container
        ctx.strokeStyle = optimizerMode === 'full' && isBigGrad ? '#EF4444' : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, headWidth, headHeight);
        ctx.fillStyle = '#090D16';
        ctx.fillRect(x, y, headWidth, headHeight);

        // Draw update fills
        ctx.fillStyle = color;
        const fillH = headHeight - 35;
        const currentFill = fillH * Math.min(1.1, updateScale);
        ctx.fillRect(x + 4, y + headHeight - 4 - currentFill, headWidth - 8, currentFill);

        // Text labels inside the head
        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`H ${i+1}`, x + headWidth/2, y + 14);

        ctx.fillStyle = optimizerMode === 'full' && isBigGrad ? '#EF4444' : '#E2E8F0';
        ctx.font = 'bold 9px Outfit';
        ctx.fillText(`G:${gradNorm.toFixed(1)}`, x + headWidth/2, y + 26);

        // Draw alarm overlay icon in full mode
        if (optimizerMode === 'full' && isBigGrad) {
          ctx.fillStyle = '#EF4444';
          ctx.font = '10px Arial';
          ctx.fillText("🚨", x + headWidth/2, y + headHeight - 15);
        }
      }

      // Draw Loss Chart below the bar chart
      const chartX = startX;
      const chartY = startY + headHeight + 20;
      const chartW = width - 60;
      const chartH = height - chartY - 25;

      ctx.save();
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(chartX, chartY, chartW, chartH);
      ctx.fillStyle = '#64748B';
      ctx.font = '9px Outfit';
      ctx.fillText("Training Loss Curve", chartX + 15, chartY + 12);

      // Draw curves for 8 heads
      for (let headIdx = 0; headIdx < 8; headIdx++) {
        const isBigGrad = headIdx === 0 || headIdx === 4;
        let color = '#38BDF8';
        if (optimizerMode === 'perHead') {
          color = 'rgba(16, 185, 129, 0.4)';
        } else {
          color = isBigGrad ? 'rgba(239, 68, 68, 0.6)' : 'rgba(100, 116, 139, 0.2)';
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let step = 0; step < 50; step++) {
          const cx = chartX + (step / 50) * chartW;
          
          let loss = 1.0;
          if (optimizerMode === 'perHead') {
            // All heads converge
            loss = 1.0 - Math.min(0.85, (step / 50) * 0.95);
          } else {
            // Unbalanced: only massive heads learn, others are starved
            if (isBigGrad) {
              loss = 1.0 - Math.min(0.75, (step / 50) * 0.8);
            } else {
              loss = 0.95 - Math.random() * 0.05; // flatlined high loss
            }
          }

          const cy = chartY + chartH - loss * (chartH - 20) - 5;
          if (step === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    if (isPlaying) {
      const renderLoop = () => {
        draw();
        animId = requestAnimationFrame(renderLoop);
      };
      renderLoop();
    } else {
      draw();
    }

    return () => cancelAnimationFrame(animId);
  }, [optimizerMode, isPlaying]);

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 2.5 - Per-Head Muon Optimizer (Per-Head Orthogonalized Optimizer)</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Per-Head Muon Matrix Parameter Optimizer</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        Kimi-K3 replaces expensive standard second-order optimizers with Newton-Schulz iterations for parameter orthogonalization updates. <b>Per-head orthogonalization</b> prevents the head with the largest norm from starving other attention heads.
      </p>

      <div className="grid-2" style={{ gap: '20px' }}>
        {/* Left Simulator */}
        <div className="card">
          <div className="control-panel" style={{ marginBottom: '15px', display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${optimizerMode === 'full' ? 'active' : ''}`}
              onClick={() => setOptimizerMode('full')}
              style={{ padding: '4px 10px', fontSize: '1.02rem' }}
            >
              Traditional Global Muon
            </button>
            <button 
              className={`btn ${optimizerMode === 'perHead' ? 'active' : ''}`}
              onClick={() => setOptimizerMode('perHead')}
              style={{ padding: '4px 10px', fontSize: '1.02rem' }}
            >
              Kimi-K3 Per-Head Muon
            </button>
          </div>

          <div style={{ background: '#02040a', borderRadius: '8px', padding: '10px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '240px' }} />
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#94A3B8', fontSize: '1.02rem', marginRight: '10px' }}>
                Newton-Schulz Iterations:
              </span>
              <select 
                style={{ background: '#1E293B', color: '#FFF', border: '1px solid #475569', borderRadius: '4px', padding: '2px 5px', fontSize: '1.02rem' }}
                value={nsIterations}
                onChange={(e) => setNsIterations(Number(e.target.value))}
              >
                <option value="3">3 Iterations (Fast)</option>
                <option value="5">5 Iterations (Standard)</option>
                <option value="6">6 Iterations (High Precision)</option>
              </select>
            </div>
            <button className="btn" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause Animation' : 'Play Animation'}
            </button>
          </div>
        </div>

        {/* Right Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '10px' }}>⚖️ Optimization Metaphor: Tug-of-War and Division of Labor</h3>
            <p style={{ color: '#94A3B8', fontSize: '1.02rem', lineHeight: '1.5' }}>
              • <b>Global Orthogonalization (Full Muon):</b> It's like 8 people pulling a single thick rope together. Two strong giants (Heads 1, 5) exert massive force, dictating the rope's direction entirely, leaving the other 6 ordinary members (other Heads) unable to contribute their distinct strength.
            </p>
            <p style={{ color: '#94A3B8', fontSize: '1.02rem', lineHeight: '1.5', marginTop: '6px' }}>
              • <b>Per-Head Orthogonalization (Per-Head Muon):</b> Hand each of the 8 people their own rope and let them pull in their assigned directions. Everyone meets their own targets (orthogonalizing separately), granting every Head equal update gains, <b>preventing strong-gradient heads from dominating and starving weak-gradient heads to death</b>.
            </p>
          </div>

          {/* Collapsible Math Panel */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <button 
              className="btn" 
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex', fontSize: '1.02rem', padding: '8px 12px' }}
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>{showFormula ? '▼ Collapse Mathematical Principles & Formulas' : '▶ Click ? to View Mathematical Principles & Formulas'}</span>
            </button>

            {showFormula && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Newton-Schulz Orthogonalization Formula:</strong>
                  <div style={{ fontFamily: 'monospace', margin: '4px 0', fontSize: '1.02rem', color: '#38BDF8' }}>
                    X_(k+1) = 0.5 * X_k * (3 * I - X_kᵀ * X_k)
                  </div>
                  Gradient steps are approximated via Newton-Schulz iteration, achieving rapid matrix orthogonalization to maintain smooth and uniform parameter distribution during backpropagation.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
