import React, { useState, useEffect, useRef } from 'react';

const tokensList = [
  "Kimi", "K3", "is", "a", "frontier", "2.8T", "Mixture-of-Experts", 
  "model", "using", "Kimi", "Delta", "Attention", "for", "long-context"
];

interface WhiteboardWord {
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  underlinePoints: { x: number; y: number }[];
}

export const KDASimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [alpha, setAlpha] = useState<number>(0.85);
  const [mode, setMode] = useState<'standard' | 'kda'>('standard');
  const [contextLength, setContextLength] = useState<number>(128); // 128K
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // Whiteboard items ref
  const whiteboardRef = useRef<WhiteboardWord[]>([]);

  // Reset the whiteboard and simulation
  const handleReset = () => {
    setIsPlaying(false);
    setActiveIdx(-1);
    whiteboardRef.current = [];
  };

  // Step function to update whiteboard
  const handleStep = () => {
    setActiveIdx(prev => {
      const next = (prev + 1) % tokensList.length;
      updateWhiteboard(next);
      return next;
    });
  };

  const updateWhiteboard = (idx: number) => {
    const currentItems = whiteboardRef.current;

    // Decay step (Forgetting Rule)
    currentItems.forEach(item => {
      item.opacity *= alpha;
    });

    // Remove almost invisible items
    whiteboardRef.current = currentItems.filter(item => item.opacity > 0.02);

    if (idx === -1) return;

    // Add new token text
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 500;
    const height = canvas ? canvas.height : 320;
    
    // Left whiteboard area size: width * 0.5
    const boardWidth = width * 0.5 - 60;
    const boardHeight = height - 80;

    // Generate random coordinates inside the left whiteboard area
    const x = 50 + Math.random() * (boardWidth - 80);
    const y = 80 + Math.random() * (boardHeight - 40);

    const colors = ['#00F2FE', '#10B981', '#FFB000', '#EC4899', '#C084FC'];
    const randColor = colors[Math.floor(Math.random() * colors.length)];

    // Generate custom underline paths for a whiteboard look
    const wordText = tokensList[idx];
    const underlinePoints = [];
    const steps = 10;
    const wordEstWidth = wordText.length * 7;
    for (let i = 0; i <= steps; i++) {
      underlinePoints.push({
        x: x + (i / steps) * wordEstWidth,
        y: y + 5 + (Math.random() - 0.5) * 2
      });
    }

    whiteboardRef.current.push({
      text: wordText,
      x,
      y,
      color: randColor,
      opacity: 1.0,
      underlinePoints
    });
  };

  // Auto-play effect
  useEffect(() => {
    let intervalId: number;
    if (isPlaying) {
      intervalId = window.setInterval(() => {
        handleStep();
      }, 800);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, alpha]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 320);

    ctx.clearRect(0, 0, width, height);

    // Draw Whiteboard Board Container (Left half)
    const boardX = 30;
    const boardY = 50;
    const boardW = width * 0.5 - 20;
    const boardH = height - 80;

    ctx.save();
    // Whiteboard frame background
    ctx.fillStyle = '#090D16';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 6);
    ctx.fill();
    ctx.stroke();

    // Whiteboard label / Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Outfit';
    ctx.fillText("KDA Constant Memory: Adaptive Information Decay Whiteboard", boardX + 12, boardY - 12);

    // Draw grid lines like a whiteboard Grid to feel more technical
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    for (let gx = boardX + 20; gx < boardX + boardW; gx += 20) {
      ctx.beginPath(); ctx.moveTo(gx, boardY); ctx.lineTo(gx, boardY + boardH); ctx.stroke();
    }
    for (let gy = boardY + 20; gy < boardY + boardH; gy += 20) {
      ctx.beginPath(); ctx.moveTo(boardX, gy); ctx.lineTo(boardX + boardW, gy); ctx.stroke();
    }

    // Draw written whiteboard words & scribbles
    whiteboardRef.current.forEach(word => {
      ctx.save();
      
      // Draw neon glow for text
      ctx.font = 'bold 14px Outfit';
      ctx.fillStyle = word.color;
      ctx.globalAlpha = word.opacity;
      ctx.shadowColor = word.color;
      ctx.shadowBlur = 8;
      ctx.fillText(word.text, word.x, word.y);

      // Draw underline scribble lines
      if (word.underlinePoints.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = word.color;
        ctx.lineWidth = 1.8;
        ctx.moveTo(word.underlinePoints[0].x, word.underlinePoints[0].y);
        for (let i = 1; i < word.underlinePoints.length; i++) {
          ctx.lineTo(word.underlinePoints[i].x, word.underlinePoints[i].y);
        }
        ctx.stroke();
      }

      ctx.restore();
    });

    ctx.restore();

    // Draw parameters panel on the right
    const rightStartX = width * 0.54;
    const rightStartY = boardY;

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Outfit';
    ctx.fillText("Whiteboard Hand-writing & Forget Decay Metaphor", rightStartX, rightStartY - 12);

    ctx.font = '11px Outfit';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText("Active Token:", rightStartX, rightStartY + 15);
    ctx.fillStyle = activeIdx !== -1 ? '#00F2FE' : '#94A3B8';
    ctx.font = 'bold 12px Outfit';
    ctx.fillText(activeIdx !== -1 ? `"${tokensList[activeIdx]}"` : "Not loaded", rightStartX + 75, rightStartY + 15);

    ctx.font = '11px Outfit';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText("Adaptive Decay Rate α_t:", rightStartX, rightStartY + 45);
    ctx.fillStyle = '#FFB000';
    ctx.fillText(`${(alpha * 100).toFixed(0)}%`, rightStartX + 120, rightStartY + 45);

    // visual speed of forgetting explanation
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Outfit';
    if (alpha >= 0.92) {
      ctx.fillStyle = '#34D399';
      ctx.fillText("Slow Decay: High α keeps writing extremely persistent, preserving history", rightStartX, rightStartY + 70);
    } else if (alpha >= 0.75) {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText("Balanced State: Adaptive forget, old writing gradually fades out", rightStartX, rightStartY + 70);
    } else {
      ctx.fillStyle = '#FF5555';
      ctx.fillText("Fast Decay: Low α dims writing instantly, clearing the whiteboard", rightStartX, rightStartY + 70);
    }

    // KV Cache info box
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(rightStartX, rightStartY + 95, width * 0.42, 100);
    ctx.strokeRect(rightStartX, rightStartY + 95, width * 0.42, 100);

    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 11px Outfit';
    ctx.fillText("Whiteboard Erasing Metaphor Principles", rightStartX + 12, rightStartY + 115);
    
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px Outfit';
    ctx.fillText("• Standard Attention: Writing is never erased, keeping history forever (memory explosion)", rightStartX + 12, rightStartY + 138);
    ctx.fillText("• KDA Adaptive Erase: Updates only critical strokes dynamically (constant memory)", rightStartX + 12, rightStartY + 158);
        ctx.fillText("• Writing Persistence: Governed by forget factors; low-value token signals fade quickly", rightStartX + 12, rightStartY + 178);

    ctx.restore();
  }, [activeIdx, alpha]);

  // Calculate memory metrics
  const standardMemory = (contextLength * 0.08).toFixed(2);
  const kdaMemory = "0.08";
  const isOOM = mode === 'standard' && contextLength >= 800;

  return (
    <div className="tab-panel active">
      <header>
        <div className="badge">Chapter 2.1 - Kimi Delta Attention</div>
        <h1>Kimi Delta Attention (KDA) Linear Attention</h1>
        <p className="subtitle">Combating memory explosion for million-token contexts through channel-gated forgetting and delta-conflict elimination</p>
      </header>

      <div className="grid-2">
        
        {/* Left Column: Interactive Simulation */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>KDA State Matrix Computation Interactive Simulator</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${mode === 'standard' ? 'active' : ''}`}
                onClick={() => setMode('standard')}
                style={{ padding: '2px 8px', fontSize: '1.15rem' }}
              >
                Standard Softmax Attention
              </button>
              <button 
                className={`btn ${mode === 'kda' ? 'active' : ''}`}
                onClick={() => setMode('kda')}
                style={{ padding: '2px 8px', fontSize: '1.15rem' }}
              >
                Kimi Delta Attention
              </button>
            </div>
          </div>

          {/* Context length control and warning */}
          <div 
            style={{ 
              background: isOOM ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)', 
              border: isOOM ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.06)',
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '15px',
              animation: isOOM ? 'pulse-red 1.5s infinite' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1.02rem' }}>
              <span style={{ color: '#E2E8F0' }}>Context Sequence Length: <b style={{ color: '#00F2FE' }}>{contextLength}K Tokens</b></span>
              {mode === 'standard' ? (
                <span style={{ color: isOOM ? '#EF4444' : '#F59E0B', fontWeight: 'bold' }}>
                  {isOOM ? '⚠️ OOM! Out Of Memory (Memory Explosion)' : `Predicted KV Cache Memory: ${standardMemory} GB`}
                </span>
              ) : (
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                  ✅ Stable Operation (KV Cache Memory: {kdaMemory} GB Constant)
                </span>
              )}
            </div>
            <input 
              type="range" 
              min="10" 
              max="1000" 
              step="10"
              value={contextLength}
              onChange={(e) => setContextLength(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: isOOM ? '#EF4444' : '#00F2FE' }}
            />
          </div>

          {/* Token track */}
          <div className="kda-token-track" style={{ marginBottom: '10px' }}>
            {tokensList.map((tok, idx) => (
              <div 
                key={idx}
                className={`kda-token ${idx === activeIdx ? 'active' : idx < activeIdx ? 'processed' : ''}`}
                onClick={() => {
                  setActiveIdx(idx);
                  updateWhiteboard(idx);
                }}
              >
                {tok}
              </div>
            ))}
          </div>

          <div className="visualizer-container" style={{ height: '240px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="control-panel" style={{ marginTop: '10px' }}>
            <button className="btn-primary" onClick={handleStep}>
              Step Input Token
            </button>
            <button className="btn-secondary" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>
            <button className="btn-secondary" onClick={handleReset}>Reset</button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>Adaptive Decay Rate (α_t):</span>
              <input 
                type="range" 
                min="0.50" 
                max="0.98" 
                step="0.05"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                style={{ width: '70px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '1.02rem', color: '#FFB000', width: '28px' }}>{alpha.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative explanation & Collapsible Math */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="card-title">Why do we need KDA?</div>
          
          <div style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.6' }}>
            <p>
              When handling long contexts, standard <b>Softmax Attention</b> scales memory requirements linearly with sequence length by saving all historical Keys/Values in the KV Cache. When the context length approaches 1 million tokens, memory consumption surges dramatically, triggering <b>OOM (Out Of Memory)</b> crashes.
            </p>
            <p style={{ marginTop: '8px' }}>
              <b>Kimi Delta Attention (KDA)</b> introduces a revolutionary state matrix design that compresses historical memory into a constant-sized matrix S_t, achieving a spatial complexity of <b>O(1)</b>. The memory footprint remains completely flat regardless of sequence length.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <div style={{ background: '#090D16', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #00F2FE' }}>
                <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Whiteboard Erasing Metaphor (Delta Rule)</span><br />
                It is like writing on a physical whiteboard of finite size. If you keep writing without organizing, the board will quickly be covered (information collision/overwrite). Before writing new info, KDA automatically 'erases' redundant ink that aligns with old info, freeing up clean space for the latest key concepts, ensuring memory remains clean and persistent.
              </div>

              <div style={{ background: '#090D16', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #FFB000' }}>
                <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Adaptive Decay (Lower-bounded Decay)</span><br />
                KDA provides independent 'forget speeds' for different information channels. Important signals (e.g., entity features) can remain persistent while transitional token signals can fade, targeting GPU compute resources efficiently.
              </div>
            </div>
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
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>KDA Recurrent State Transition Equations:</strong>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                    S_t = (I - β_t · k_t · k_tᵀ) · Diag(α_t) · S_t₋₁ + β_t · k_t · v_tᵀ
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Chunkwise Parallel Computation Formula:</strong>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                    O[t] = (Γ_(1→C) ⊙ Q[t]) S[t] + A[t] · (U[t] - W[t]S[t])
                  </div>
                  <div style={{ color: '#818CF8', fontSize: '1.15rem', marginTop: '2px' }}>
                    where A[t] = Tril[(Q[t] ⊙ Γ)(K[t]/Γ)ᵀ]
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Lower-bounded Decay Gated Rate:</strong>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                    g_t = g_min · Sigmoid(e^A · z_t) ∈ (g_min, 0)
                  </div>
                  <div style={{ color: '#10B981', fontSize: '1.15rem', marginTop: '2px' }}>
                    g_min = -5, ensuring that the decay coefficient α_t &gt; e⁻⁵ ≈ 6.7×10⁻³ (Bounded Sigmoid mapping prevents floating-point divergence)
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Full-rank Gate Fusion Gating:</strong>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                    y_t = W_o [ Sigmoid(W_g x_t) ⊙ RMSNorm(ő_t) ]
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Gated MLA Latent Space Compressed Features:</strong>
                  <div style={{ color: '#94A3B8', fontSize: '1.15rem', lineHeight: '1.4' }}>
                    • <b>Low-rank Compression:</b> Compresses KV states into a low-rank latent space using c_t = W_c x_t, dramatically saving communication bandwidth.<br />
                    • <b>NoPE Architecture:</b> Discards position encodings, relying entirely on the recurrence relation of KDA to supply positional awareness.<br />
                    • <b>High Precision:</b> Flash Attention forces internal computation in FP32 to prevent accumulated rounding errors.
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
