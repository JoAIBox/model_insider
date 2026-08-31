import React, { useState, useEffect, useRef } from 'react';

// Sample Token stream for interactive simulation
const sampleTokens = [
  { text: "Kimi", isKey: true, role: "Subject" },
  { text: "K3", isKey: true, role: "Model ID" },
  { text: "is", isKey: false, role: "Verb" },
  { text: "a", isKey: false, role: "Article" },
  { text: "2.8T", isKey: true, role: "Param Scale" },
  { text: "MoE", isKey: true, role: "Architecture" },
  { text: "model", isKey: false, role: "Noun" }
];

export const KDAOperatorDeepDive: React.FC = () => {
  // Step & Playback Control States
  const [tokenIndex, setTokenIndex] = useState<number>(0); // Token t
  const [subStep, setSubStep] = useState<'decay' | 'write' | 'read'>('decay'); // Animation sub-step
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1800);
  const [viewMode, setViewMode] = useState<'math' | 'analogy'>('analogy'); // Math vs CS Analogy mode
  const [contextLength, setContextLength] = useState<number>(128); // 128K context for ablation
  const [userAlpha, setUserAlpha] = useState<number>(0.85); // Dynamic decay gate alpha_t
  const [patternMode, setPatternMode] = useState<'familiar' | 'novel'>('novel');

  // Simulated Matrix S_t cell values (4x4 representation for visualization)
  const [matrixState] = useState<number[][]>([
    [0.42, 0.15, 0.78, 0.31],
    [0.64, 0.89, 0.22, 0.55],
    [0.11, 0.37, 0.93, 0.46],
    [0.82, 0.05, 0.61, 0.74]
  ]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Automatic playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSubStep((prevSub) => {
          if (prevSub === 'decay') return 'write';
          if (prevSub === 'write') return 'read';
          // Move to next token
          setTokenIndex((prevIdx) => (prevIdx + 1) % sampleTokens.length);
          return 'decay';
        });
      }, speedMs / 3);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs]);

  // Step Controls
  const handlePrevStep = () => {
    setIsPlaying(false);
    if (subStep === 'read') setSubStep('write');
    else if (subStep === 'write') setSubStep('decay');
    else {
      setSubStep('read');
      setTokenIndex((prev) => (prev > 0 ? prev - 1 : sampleTokens.length - 1));
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (subStep === 'decay') setSubStep('write');
    else if (subStep === 'write') setSubStep('read');
    else {
      setSubStep('decay');
      setTokenIndex((prev) => (prev + 1) % sampleTokens.length);
    }
  };

  const currentToken = sampleTokens[tokenIndex];

  // Dynamic alpha value based on token importance
  const computedAlpha = currentToken.isKey ? userAlpha : Math.max(0.2, userAlpha - 0.4);

  // A deliberately small 4D teaching example for the delta rule. The report gives
  // the full matrix recurrence, but not per-token activations for this demo.
  const toyKey = [0.35, 0.55, 0.4, 0.65];
  const retainedState = matrixState.map((row) => row.map((value) => value * computedAlpha));
  const predictedValue = toyKey.map((_, column) => retainedState.reduce((sum, row, rowIndex) => sum + row[column] * toyKey[rowIndex], 0));
  const targetValue = patternMode === 'familiar'
    ? predictedValue.map((value, index) => value + [0.02, -0.015, 0.01, -0.02][index])
    : [0.95, 0.18, 0.82, 0.12];
  const residualVector = targetValue.map((value, index) => value - predictedValue[index]);
  const residualMagnitude = Math.sqrt(residualVector.reduce((sum, value) => sum + value * value, 0));
  const residualMax = Math.max(...residualVector.map((value) => Math.abs(value)), 0.001);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* 1. Header Banner & View Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div className="operator-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              KDA (Kimi Delta Attention): interactive operator principles and applications
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              69-Layer Core Backbone Operator
            </span>
          </div>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            KDA combines a linear recurrent state matrix \(S_t\) with dynamic gated decay. During decoding, the state term does not grow with sequence length; training uses recurrent updates across chunks and parallel computation within each chunk.
          </p>
        </div>

        {/* Math vs CS Analogy Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setViewMode('analogy')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'analogy' ? '#38BDF8' : 'transparent',
              color: viewMode === 'analogy' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            💡 Software-engineering analogy
          </button>
          <button
            onClick={() => setViewMode('math')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'math' ? '#A78BFA' : 'transparent',
              color: viewMode === 'math' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            📐 Technical formula and code mode
          </button>
        </div>
      </div>

      {/* 2. THREE-PANEL SYNCHRONIZED INTERACTIVE CONSOLE */}
      <div className="kda-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* PANEL 1: DATAFLOW ANIMATION & STEP DEBUGGER */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#38BDF8', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎬 Panel 1: dynamic state-matrix evolution
            </h3>
            <span style={{ fontSize: '0.85rem', background: '#0F172A', color: '#38BDF8', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)', fontFamily: 'monospace' }}>
              Token t={tokenIndex + 1}/{sampleTokens.length} | Phase: {subStep.toUpperCase()}
            </span>
          </div>

          {/* Interactive Token Strip */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', background: '#0B0F19', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {sampleTokens.map((tok, idx) => (
              <div
                key={idx}
                onClick={() => { setTokenIndex(idx); setSubStep('decay'); setIsPlaying(false); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: idx === tokenIndex ? (tok.isKey ? '#38BDF8' : '#64748B') : '#0F172A',
                  color: idx === tokenIndex ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  border: idx === tokenIndex ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '60px'
                }}
              >
                <span>"{tok.text}"</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{tok.role}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', color: '#94A3B8', fontSize: '0.88rem' }}>
            <span>Residual teaching input:</span>
            <button onClick={() => setPatternMode('familiar')} style={{ padding: '5px 10px', borderRadius: '5px', border: patternMode === 'familiar' ? '1px solid #10B981' : '1px solid #475569', background: patternMode === 'familiar' ? 'rgba(16, 185, 129, 0.18)' : '#0F172A', color: patternMode === 'familiar' ? '#6EE7B7' : '#CBD5E1', cursor: 'pointer' }}>
              Familiar pattern
            </button>
            <button onClick={() => setPatternMode('novel')} style={{ padding: '5px 10px', borderRadius: '5px', border: patternMode === 'novel' ? '1px solid #F59E0B' : '1px solid #475569', background: patternMode === 'novel' ? 'rgba(245, 158, 11, 0.18)' : '#0F172A', color: patternMode === 'novel' ? '#FCD34D' : '#CBD5E1', cursor: 'pointer' }}>
              Novel concept
            </button>
          </div>

          {/* Step Debugger Control Toolbar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#0F172A', padding: '10px 14px', borderRadius: '8px' }}>
            <button onClick={handlePrevStep} style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⏪ Previous step
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ background: isPlaying ? '#EF4444' : '#10B981', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Auto-play'}
            </button>
            <button onClick={handleNextStep} style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Next step ⏩
            </button>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Speed:</span>
              <input
                type="range"
                min="600"
                max="3000"
                step="200"
                value={speedMs}
                onChange={(e) => setSpeedMs(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.85rem', color: '#38BDF8', marginLeft: '10px' }}>Base α: {userAlpha.toFixed(2)}</span>
              <input
                type="range"
                min="0.3"
                max="0.99"
                step="0.05"
                value={userAlpha}
                onChange={(e) => setUserAlpha(Number(e.target.value))}
                style={{ width: '80px' }}
              />
            </div>
          </div>

          {/* SVG Dataflow Diagram */}
          <div style={{ background: '#02040a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
            <svg viewBox="0 0 540 260" width="100%" height="240">
              
              {/* Step 1: Decay Gate Effect */}
              <g opacity={subStep === 'decay' ? 1 : 0.4}>
                <rect x="20" y="40" width="120" height="70" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth={subStep === 'decay' ? 2.5 : 1} />
                <text x="80" y="68" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">1. Channel-wise decay</text>
                <text x="80" y="86" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">α_t ∈ (0,1)^d_k</text>
                <text x="80" y="102" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">toy scalar: {computedAlpha.toFixed(2)}</text>
              </g>

              {/* State Matrix S_t Visualizer */}
              <rect
                x="180" y="30" width="180" height="180" rx="8"
                fill={subStep === 'decay' ? 'rgba(56, 189, 248, 0.08)' : subStep === 'write' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(16, 185, 129, 0.15)'}
                stroke={subStep === 'decay' ? '#38BDF8' : subStep === 'write' ? '#A78BFA' : '#10B981'}
                strokeWidth="2.5"
                style={{ transition: 'all 0.3s ease' }}
              />
              <text x="270" y="20" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                Toy 4×4 state matrix S_t
              </text>
              <text x="270" y="33" fill="#94A3B8" fontSize="9" textAnchor="middle">
                teaching illustration — not actual K3 head dimensions
              </text>
              <text x="270" y="223" fill="#94A3B8" fontSize="9" textAnchor="middle">
                4×4 view simplifies channel-wise α_t into one scalar per animation state
              </text>

              {/* 4x4 Grid Representation */}
              {matrixState.map((row, r) =>
                row.map((val, c) => {
                  const activeDecay = subStep === 'decay';
                  const activeWrite = subStep === 'write';
                  const displayVal = activeDecay ? (val * computedAlpha).toFixed(2) : val.toFixed(2);

                  return (
                    <g key={`${r}-${c}`}>
                      <rect
                        x={195 + c * 38}
                        y={45 + r * 38}
                        width="34"
                        height="34"
                        rx="4"
                        fill={activeWrite && r === c ? '#A78BFA' : activeDecay ? '#0F172A' : '#0B0F19'}
                        stroke={activeDecay ? '#38BDF8' : '#475569'}
                        strokeWidth="1"
                        opacity={activeDecay ? computedAlpha : 1}
                      >
                        <title>{`Cell S[${r + 1},${c + 1}] · input v_t[${c + 1}] = ${targetValue[c].toFixed(2)} · predicted (S̄ᵀk_t)[${c + 1}] = ${predictedValue[c].toFixed(2)} · residual δ_t[${c + 1}] = ${residualVector[c].toFixed(2)}`}</title>
                      </rect>
                      <text
                        x={212 + c * 38}
                        y={66 + r * 38}
                        fill={activeWrite && r === c ? '#000' : '#E2E8F0'}
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {displayVal}
                      </text>
                    </g>
                  );
                })
              )}

              {/* Step 2: Write Vector (v_t * k_t^T) */}
              <g opacity={subStep === 'write' ? 1 : 0.5}>
                <line x1="390" y1="80" x2="450" y2="80" stroke="#A78BFA" strokeWidth="2" />
                <rect x="450" y="55" width="80" height="50" rx="6" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="2" />
                <text x="490" y="78" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">2. Outer-product write</text>
                <text x="490" y="95" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">β_t · k_t · δ_tᵀ</text>
              </g>

              {/* Step 3: Query Read (o_t = S_tᵀ * q_t) */}
              <g opacity={subStep === 'read' ? 1 : 0.5}>
                <line x1="270" y1="210" x2="270" y2="245" stroke="#10B981" strokeWidth="2.5" />
                <rect x="200" y="225" width="140" height="30" rx="4" fill="#10B981" />
                <text x="270" y="244" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">3. Read output õ_t = S_tᵀ · q_t</text>
              </g>
            </svg>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 0.9fr)', gap: '12px', marginTop: '10px' }}>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: `1px solid ${patternMode === 'familiar' ? '#10B981' : '#F59E0B'}` }}>
                <div style={{ color: patternMode === 'familiar' ? '#6EE7B7' : '#FCD34D', fontWeight: 'bold', marginBottom: '6px' }}>
                  Prediction residual δ_t ({patternMode === 'familiar' ? 'small' : 'large'})
                </div>
                <div style={{ fontFamily: 'monospace', color: '#FFF', fontSize: '0.9rem', lineHeight: '1.55' }}>
                  δ_t = v_t − (Diag(α_t)S_(t−1))ᵀk_t
                  <br />
                  S_t = S̄_t + β_t k_t δ_tᵀ
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: '1.45', margin: '7px 0 0' }}>
                  This 4D vector is a toy probe for intuition, not a hidden K3 activation. A familiar pattern has a small correction; a novel concept requests a larger write. β_t still controls the update magnitude.
                </p>
              </div>
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.82rem', marginBottom: '7px' }}>
                  <span>|δ_t| per value</span>
                  <strong style={{ color: patternMode === 'familiar' ? '#6EE7B7' : '#FCD34D' }}>{residualMagnitude.toFixed(3)} L2</strong>
                </div>
                {residualVector.map((value, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0' }}>
                    <span style={{ width: '24px', color: '#64748B', fontFamily: 'monospace' }}>δ{index + 1}</span>
                    <div style={{ flex: 1, height: '9px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.abs(value) / residualMax * 100)}%`, height: '100%', background: patternMode === 'familiar' ? '#10B981' : '#F59E0B', borderRadius: '4px', transition: 'width 0.25s ease' }} />
                    </div>
                    <span style={{ width: '48px', textAlign: 'right', color: '#E2E8F0', fontFamily: 'monospace', fontSize: '0.8rem' }}>{value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Substep Explainer */}
            <div style={{ background: '#0F172A', padding: '10px 14px', borderRadius: '6px', fontSize: '0.9rem', color: '#94A3B8', marginTop: '6px' }}>
              {subStep === 'decay' && (
                  <span>💡 <b>Step 1 (retention):</b> The historical state is scaled by a channel-wise retention factor \(\alpha_t = {computedAlpha.toFixed(2)}\); different key channels can retain information at different rates.</span>
              )}
              {subStep === 'write' && (
                  <span>💡 <b>Step 2 (delta write):</b> Apply \((I-\beta_t k_tk_t^T)\) to correct the old state for the current key, then write \(\beta_t k_tv_t^T\).</span>
              )}
              {subStep === 'read' && (
                  <span>💡 <b>Step 3 (read):</b> Read the historical features needed by the current query with \(S_t^Tq_t\).</span>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: SYNCHRONIZED MATH, PYTORCH & CS ANALOGY */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <h3 style={{ fontSize: '1.15rem', color: '#A78BFA', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {viewMode === 'analogy' ? '💡 Panel 2: software-engineering analogy' : '📐 Panel 2: live formula and PyTorch code'}
          </h3>

          {/* VIEW MODE A: CS ANALOGY */}
          {viewMode === 'analogy' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #38BDF8' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>🔗 Analogy: fixed-size online buffer</span>
                <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
                  Think of an <b>online accumulator / fixed-size ring buffer</b>. Unlike a token-by-token KV array, KDA keeps a fixed-shape state term for recurrent aggregation.
                </p>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #A78BFA' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>⚡ Gated α_t: content-dependent retention / decay</span>
                <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
                  The current input controls how strongly older state is retained or corrected. The exact value is produced by the learned gate; \(\alpha_t \approx 0.99\) and \(\alpha_t \approx 0.2\) are intuition only, not fixed K3 thresholds.
                </p>
              </div>

              {/* Strict Physical Difference Note */}
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid #EF4444' }}>
                <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.95rem' }}>⚠️ Physical boundary and technical distinction:</span>
                <p style={{ color: '#CBD5E1', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
                  A hash cache performs a <b>discrete lookup</b>; KDA’s \(S_t\) stores a <b>continuous linear transformation of feature vectors</b>, not a string dictionary.
                </p>
              </div>

            </div>
          ) : (
            /* VIEW MODE B: MATH & PYTORCH CODE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Dynamic Highlighted Math Formulas */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px' }}>// Dynamic state-update and read expression:</div>
                
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: subStep === 'decay' || subStep === 'write' ? 'rgba(56, 189, 248, 0.15)' : '#070913',
                  border: subStep === 'decay' || subStep === 'write' ? '1px solid #38BDF8' : 'none',
                  color: '#FFF',
                  fontFamily: 'monospace',
                  fontSize: '1.05rem'
                }}>
                  <span style={{ color: subStep === 'decay' ? '#38BDF8' : '#94A3B8', fontWeight: subStep === 'decay' ? 'bold' : 'normal' }}>
                    S̄_t = Diag(α_t) · S_(t-1)
                  </span>
                  <span style={{ color: subStep === 'write' ? '#A78BFA' : '#94A3B8', fontWeight: subStep === 'write' ? 'bold' : 'normal' }}>
                    {' '} → S_t = S̄_t + β_t · k_t · δ_tᵀ
                  </span>
                </div>
                <div style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.92rem', marginTop: '8px' }}>
                  δ_t = v_t − S̄_tᵀk_t; equivalently S_t = (I − β_t k_t k_tᵀ)S̄_t + β_t k_t v_tᵀ
                </div>

                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: subStep === 'read' ? 'rgba(16, 185, 129, 0.15)' : '#070913',
                  border: subStep === 'read' ? '1px solid #10B981' : 'none',
                  color: subStep === 'read' ? '#10B981' : '#94A3B8',
                  fontFamily: 'monospace',
                  fontSize: '1.05rem',
                  marginTop: '8px'
                }}>
                  y_t = W_o[σ(W_g · x_t) ⊙ RMSNorm(S_tᵀ · q_t)]
                </div>
              </div>

              {/* PyTorch Code Box */}
              <div style={{ background: '#0B0F19', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#64748B', marginBottom: '6px' }}># K3 recurrence (schematic; ShortConv / head assembly omitted):</div>
                <div style={{ color: subStep === 'decay' ? '#38BDF8' : '#64748B', background: subStep === 'decay' ? 'rgba(56,189,248,0.1)' : 'transparent', padding: '2px 4px' }}>
                  alpha_t = torch.exp(g_min * torch.sigmoid(torch.exp(A) * z_t))
                </div>
                <div style={{ color: subStep === 'decay' ? '#38BDF8' : '#64748B', background: subStep === 'decay' ? 'rgba(56,189,248,0.1)' : 'transparent', padding: '2px 4px' }}>
                  S = (I - beta_t * torch.outer(k_t, k_t)) @ (alpha_t[:, None] * S_prev)  # Retain + delta correction
                </div>
                <div style={{ color: subStep === 'write' ? '#A78BFA' : '#64748B', background: subStep === 'write' ? 'rgba(167,139,250,0.1)' : 'transparent', padding: '2px 4px' }}>
                  S = S + beta_t * torch.outer(k_t, v_t)  # Phase 2: Write
                </div>
                <div style={{ color: subStep === 'read' ? '#10B981' : '#64748B', background: subStep === 'read' ? 'rgba(16,185,129,0.1)' : 'transparent', padding: '2px 4px' }}>
                  o_t = torch.matmul(S.T, q_t)  # Phase 3: Read
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 3. PANEL 3: WHY IT MATTERS & ABLATION SANDBOX */}
      <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#10B981', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Panel 3: why it matters (decoding state-memory sandbox)
          </h3>

          {/* Interactive Context Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0F172A', padding: '6px 14px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 'bold' }}>Context length:</span>
            <input
              type="range"
              min="8"
              max="1000"
              step="32"
              value={contextLength}
              onChange={(e) => setContextLength(Number(e.target.value))}
              style={{ width: '160px' }}
            />
            <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>{contextLength}K Tokens</span>
          </div>

          <small style={{ display: 'block', color: '#64748B', lineHeight: '1.45' }}>
            Comparison scope: independent illustrative scales for the full-attention KV-growth term and the KDA decoding-state term. Batch size, layer coverage, head width, dtype, MLA cache, weights, activations, and workspace are not encoded in these displayed coefficients; do not compare the absolute GB values with the Infrastructure panel.
          </small>

        </div>

          {/* Side-by-Side Memory Footprint Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Standard Softmax Attention (Linear Memory Growth) */}
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1rem' }}>Conventional Softmax Attention</span>
              <span style={{ color: '#EF4444', fontFamily: 'monospace', fontWeight: 'bold' }}>full-attention KV-growth toy term</span>
            </div>
            
            {/* Simulated Memory Bar */}
            <div style={{ height: '24px', background: '#070913', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (contextLength / 256) * 100)}%`,
                  background: contextLength > 256 ? '#EF4444' : '#F59E0B',
                  transition: 'width 0.3s ease'
                }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '3px', fontSize: '0.8rem', color: '#FFF', fontFamily: 'monospace' }}>
                {(contextLength * 0.75).toFixed(1)} GB {contextLength > 256 ? '⚠️ illustrative OOM threshold' : ''}
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              These values illustrate growth with sequence length. Actual KV-cache size depends on batch size, head count, dimensions, dtype, and implementation; 750 GB is not a K3 fixed parameter.
            </p>
          </div>

          {/* KDA Gated Delta Attention (O(1) Constant Memory) */}
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>KDA (Kimi Delta Attention)</span>
              <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>KDA state-path toy term</span>
            </div>
            
            {/* Constant Memory Bar */}
            <div style={{ height: '24px', background: '#070913', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <div style={{ height: '100%', width: '12%', background: '#10B981' }} />
              <span style={{ position: 'absolute', right: '10px', top: '3px', fontSize: '0.8rem', color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                approximately constant in sequence length (illustrative 0.04 GB)
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              For an 8K or 1M-token context, the shape of \(S_t\) is determined by model dimensions rather than sequence length. This is only the decoding state term; total inference memory is not constant.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
