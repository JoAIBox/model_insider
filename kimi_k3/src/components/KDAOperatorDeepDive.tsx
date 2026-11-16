import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  computeKdaStep,
  computeK3Gate,
  computeKimiLinearGate,
  l2Normalize,
  calculateMemoryEstimates,
  type KdaStepResult
} from '../utils/toyMath';

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

// Raw token 4D vectors (q and k will be explicitly L2-normalized)
const RAW_TOKEN_VECTORS = [
  { q: [0.50, 0.30, 0.60, 0.40], k: [0.35, 0.55, 0.40, 0.65], v: [0.95, 0.18, 0.82, 0.12] },
  { q: [0.40, 0.60, 0.30, 0.50], k: [0.50, 0.30, 0.70, 0.30], v: [0.88, 0.25, 0.75, 0.20] },
  { q: [0.20, 0.30, 0.40, 0.30], k: [0.30, 0.40, 0.30, 0.40], v: [0.30, 0.30, 0.30, 0.30] },
  { q: [0.20, 0.20, 0.30, 0.30], k: [0.20, 0.30, 0.30, 0.30], v: [0.20, 0.20, 0.30, 0.20] },
  { q: [0.60, 0.50, 0.70, 0.60], k: [0.65, 0.40, 0.60, 0.55], v: [0.92, 0.85, 0.15, 0.70] },
  { q: [0.50, 0.70, 0.40, 0.60], k: [0.55, 0.60, 0.35, 0.70], v: [0.80, 0.90, 0.30, 0.85] },
  { q: [0.30, 0.40, 0.50, 0.30], k: [0.40, 0.45, 0.40, 0.45], v: [0.40, 0.50, 0.45, 0.40] }
];

export type KdaScenario = 'zero_delta' | 'small_delta' | 'large_delta' | 'change_q_only';

export const KDAOperatorDeepDive: React.FC = () => {
  // Step & Playback Control States
  const [tokenIndex, setTokenIndex] = useState<number>(0); // Token t
  const [subStep, setSubStep] = useState<'decay' | 'write' | 'read'>('decay');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1800);
  const [viewMode, setViewMode] = useState<'math' | 'analogy'>('math');
  const [contextLength, setContextLength] = useState<number>(128); // 128K context for ablation
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 0 });

  // Four educational comparative scenarios
  const [scenario, setScenario] = useState<KdaScenario>('small_delta');

  // Gating parameter state (K3 Eq. 2.114 - 2.120)
  // Default z provides realistic non-saturated channel decay: alpha ~ [0.82, 0.66, 0.42, 0.22]
  const [userA, setUserA] = useState<number>(0.0);
  const [channelZ, setChannelZ] = useState<number[]>([-3.2, -2.4, -1.6, -0.8]);

  // Compute exact channel-wise retention vector alpha
  const alphaVector = useMemo(() => {
    return channelZ.map(z => computeK3Gate(z, userA).alpha);
  }, [channelZ, userA]);

  // Real step-by-step state matrix evolution across tokens using computeKdaStep
  const kdaSteps = useMemo(() => {
    // Initial state S_0 (Teaching Initial State)
    let currentS: number[][] = [
      [0.42, 0.15, 0.78, 0.31],
      [0.64, 0.89, 0.22, 0.55],
      [0.11, 0.37, 0.93, 0.46],
      [0.82, 0.05, 0.61, 0.74]
    ];

    const steps: Array<
      KdaStepResult & {
        tokenText: string;
        tokenRole: string;
        isInitialState: boolean;
        alphaVector: number[];
        q: number[];
        k: number[];
        v: number[];
        prevState: number[][];
      }
    > = [];

    for (let i = 0; i < sampleTokens.length; i++) {
      const tok = sampleTokens[i];
      const prevState = currentS.map(row => [...row]);

      // 1. Q and K are explicitly L2-normalized (Eq. 2.53)
      const kNorm = l2Normalize(RAW_TOKEN_VECTORS[i].k);
      let qNorm = l2Normalize(RAW_TOKEN_VECTORS[i].q);

      if (scenario === 'change_q_only') {
        // Permute query to demonstrate that read output changes, but state S_t is unchanged!
        qNorm = l2Normalize([RAW_TOKEN_VECTORS[i].q[3], RAW_TOKEN_VECTORS[i].q[2], RAW_TOKEN_VECTORS[i].q[1], RAW_TOKEN_VECTORS[i].q[0]]);
      }

      // 2. Pre-compute predicted value to synthesize educational scenarios
      const decayedState = currentS.map((row, r) => row.map(val => val * alphaVector[r]));
      const predictedV = [0, 1, 2, 3].map(c => decayedState.reduce((sum, row, r) => sum + row[c] * kNorm[r], 0));

      // 3. Select target value v based on scenario
      let v: number[];
      if (scenario === 'zero_delta') {
        // Zero residual error: v_t = v_hat exactly => delta = 0, deltaS = 0, but state decays!
        v = [...predictedV];
      } else if (scenario === 'small_delta') {
        // Small residual error: slight variation
        v = predictedV.map((pv, idx) => pv + [0.03, -0.02, 0.025, -0.015][idx]);
      } else {
        // 'large_delta' or 'change_q_only': large new target value
        v = RAW_TOKEN_VECTORS[i].v;
      }

      const beta = tok.isKey ? 0.85 : 0.40;

      // Pass arguments in exact mathematical order: prevState, k, v, q, alphaVector, beta
      const stepRes = computeKdaStep(currentS, kNorm, v, qNorm, alphaVector, beta);

      steps.push({
        ...stepRes,
        tokenText: tok.text,
        tokenRole: tok.role,
        isInitialState: i === 0,
        alphaVector,
        q: qNorm,
        k: kNorm,
        v,
        prevState
      });

      currentS = stepRes.nextS;
    }
    return steps;
  }, [alphaVector, scenario]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Automatic playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSubStep((prevSub) => {
          if (prevSub === 'decay') return 'write';
          if (prevSub === 'write') return 'read';
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

  const currentStep = kdaSteps[tokenIndex];

  // Unified memory calculation from toyMath
  const memEst = useMemo(() => {
    return calculateMemoryEstimates(1, contextLength * 1024);
  }, [contextLength]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 12px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* 1. Header Banner & View Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div className="operator-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              KDA (Kimi Delta Attention): Interactive Operator Principles
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              69-Layer Core Backbone Operator (§2.1)
            </span>
          </div>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            KDA integrates channel-wise bounded decay with delta-rule associative memory updates. Unlike standard MHA with O(N) cache growth, KDA maintains a strict O(1) recurrent state matrix S_t during autoregressive decoding.
          </p>
        </div>

        {/* Math vs CS Analogy Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
            📐 Technical formula &amp; live math
          </button>
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
            💡 CS Analogy &amp; Buffer view
          </button>
        </div>
      </div>

      {/* 2. SECTION 1: ASSOCIATIVE MEMORY STEP-BY-STEP EVOLUTION */}
      <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
              🔬 Part 1: Associative Memory Recurrence (S_old ➔ S̄_t ➔ ΔS_t ➔ S_new)
            </h3>
            <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
              Observe the exact four-matrix transition at token t: channel retention, prediction residual, outer-product write, and query read.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#E2E8F0', fontSize: '0.9rem' }}>Sub-step:</span>
            <span style={{ 
              background: subStep === 'decay' ? '#38BDF8' : subStep === 'write' ? '#A78BFA' : '#10B981', 
              color: '#000', 
              padding: '4px 10px', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}>
              {subStep === 'decay' ? '1. Decay S̄_t = Diag(α_t) · S_{t-1}' : subStep === 'write' ? '2. Delta Write S_t = S̄_t + β_t · k_t · δ_tᵀ' : '3. Read Output y_t = S_tᵀ · q_t'}
            </span>
          </div>
        </div>

        {/* Token Selector Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1', fontSize: '0.9rem' }}>
            <span>Input token stream (t = 1 .. 7):</span>
            <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>Active Token {tokenIndex + 1} / {sampleTokens.length}</span>
          </div>
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

          {/* Educational Scenarios Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 'bold' }}>
              Select Teaching Input Scenario (inspecting mathematical invariants):
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                {
                  id: 'zero_delta',
                  title: '1. δ = 0 (Zero Residual)',
                  desc: 'Target matches prediction: ||ΔS||=0, but S changes via decay!',
                  color: '#38BDF8'
                },
                {
                  id: 'small_delta',
                  title: '2. Small δ Residual',
                  desc: 'Familiar pattern: subtle correction write (||δ|| ≈ 0.04)',
                  color: '#10B981'
                },
                {
                  id: 'large_delta',
                  title: '3. Large δ Residual',
                  desc: 'Novel concept: strong corrective state write (||δ|| ≈ 0.85)',
                  color: '#F59E0B'
                },
                {
                  id: 'change_q_only',
                  title: '4. Alter Query q Only',
                  desc: 'Query changes: output y_t changes, but state S_t is 100% invariant!',
                  color: '#EC4899'
                }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setScenario(item.id as KdaScenario)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: scenario === item.id ? `2px solid ${item.color}` : '1px solid rgba(255,255,255,0.1)',
                    background: scenario === item.id ? 'rgba(255,255,255,0.08)' : '#0F172A',
                    color: scenario === item.id ? item.color : '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>{item.title}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Playback Controls Toolbar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', background: '#0F172A', padding: '10px 14px', borderRadius: '8px', marginTop: '6px' }}>
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
            
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
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
            </div>
          </div>

          {/* SIDE-BY-SIDE FOUR-MATRIX RECURRENT DISPLAY */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' }}>
            
            {/* 1. S_old (S_{t-1}) */}
            <div style={{ background: '#0B0F19', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '0.9rem' }}>1. S_old (S_{'{t-1}'})</span>
                <span style={{ background: currentStep.isInitialState ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)', color: currentStep.isInitialState ? '#38BDF8' : '#94A3B8', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px' }}>
                  {currentStep.isInitialState ? 'Teaching Initial S₀' : `From Token ${tokenIndex}`}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {currentStep.prevState.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`prev-${r}-${c}`}
                      onClick={() => setSelectedCell({ r, c })}
                      style={{
                        background: selectedCell?.r === r && selectedCell?.c === c ? 'rgba(56, 189, 248, 0.3)' : '#0F172A',
                        border: selectedCell?.r === r && selectedCell?.c === c ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.05)',
                        padding: '6px 2px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        color: '#CBD5E1',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', textAlign: 'center' }}>
                Frobenius: {Math.sqrt(currentStep.prevState.flat().reduce((s, x) => s + x * x, 0)).toFixed(2)}
              </div>
            </div>

            {/* 2. Decayed State S̄_t = Diag(α_t) · S_{t-1} */}
            <div style={{ background: '#0B0F19', padding: '12px', borderRadius: '8px', border: subStep === 'decay' ? '2px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.9rem' }}>2. Decayed S̄_t</span>
                <span style={{ color: '#38BDF8', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  Δ_decay: {currentStep.decayChangeNorm.toFixed(3)}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {currentStep.decayedS.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`decay-${r}-${c}`}
                      onClick={() => setSelectedCell({ r, c })}
                      style={{
                        background: selectedCell?.r === r && selectedCell?.c === c ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.08)',
                        border: selectedCell?.r === r && selectedCell?.c === c ? '1px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.2)',
                        padding: '6px 2px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        color: '#FFF',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px', textAlign: 'center' }}>
                α channels: [{currentStep.alphaVector.map(a => a.toFixed(2)).join(', ')}]
              </div>
            </div>

            {/* 3. Delta Write Matrix ΔS_t = β_t · k_t · δ_tᵀ */}
            <div style={{ background: '#0B0F19', padding: '12px', borderRadius: '8px', border: subStep === 'write' ? '2px solid #A78BFA' : '1px solid rgba(167, 139, 250, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.9rem' }}>3. Delta Write ΔS_t</span>
                <span style={{ color: '#A78BFA', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  ||ΔS||_F: {currentStep.deltaWriteNorm.toFixed(3)}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {currentStep.deltaS.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`delta-${r}-${c}`}
                      onClick={() => setSelectedCell({ r, c })}
                      style={{
                        background: selectedCell?.r === r && selectedCell?.c === c ? 'rgba(167, 139, 250, 0.4)' : Math.abs(val) > 0.001 ? 'rgba(167, 139, 250, 0.15)' : '#0F172A',
                        border: selectedCell?.r === r && selectedCell?.c === c ? '1px solid #A78BFA' : '1px solid rgba(167, 139, 250, 0.2)',
                        padding: '6px 2px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        color: Math.abs(val) > 0.001 ? '#DDD6FE' : '#64748B',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px', textAlign: 'center' }}>
                residual ||δ||: {currentStep.deltaNorm.toFixed(3)}
              </div>
            </div>

            {/* 4. New State S_t = S̄_t + ΔS_t */}
            <div style={{ background: '#0B0F19', padding: '12px', borderRadius: '8px', border: subStep === 'read' ? '2px solid #10B981' : '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.9rem' }}>4. Updated State S_t</span>
                <span style={{ color: '#10B981', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)' }}>
                  Inherited by t+1
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {currentStep.nextS.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`next-${r}-${c}`}
                      onClick={() => setSelectedCell({ r, c })}
                      style={{
                        background: selectedCell?.r === r && selectedCell?.c === c ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.1)',
                        border: selectedCell?.r === r && selectedCell?.c === c ? '1px solid #10B981' : '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '6px 2px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        color: '#FFF',
                        fontWeight: 'bold',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', textAlign: 'center' }}>
                Frobenius: {Math.sqrt(currentStep.nextS.flat().reduce((s, x) => s + x * x, 0)).toFixed(2)}
              </div>
            </div>

          </div>

          {/* Cell-Level Arithmetic Inspector */}
          {selectedCell && (
            <div style={{ background: '#0F172A', padding: '12px 16px', borderRadius: '6px', border: '1px solid #38BDF8', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ color: '#FFF', fontSize: '0.88rem' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>Cell S[{selectedCell.r + 1}, {selectedCell.c + 1}] Exact Equation: </span>
                <span style={{ fontFamily: 'monospace' }}>
                  S_t[{selectedCell.r + 1},{selectedCell.c + 1}] = S̄_t[{selectedCell.r + 1},{selectedCell.c + 1}] + ΔS[{selectedCell.r + 1},{selectedCell.c + 1}]
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.86rem', color: '#10B981', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}>
                {currentStep.nextS[selectedCell.r][selectedCell.c].toFixed(3)} = ({currentStep.alphaVector[selectedCell.r].toFixed(3)} × {currentStep.prevState[selectedCell.r][selectedCell.c].toFixed(3)}) + ({currentStep.deltaS[selectedCell.r][selectedCell.c] >= 0 ? '+' : ''}{currentStep.deltaS[selectedCell.r][selectedCell.c].toFixed(3)})
              </div>
            </div>
          )}

          {/* Read Vector Numerical Box */}
          <div style={{ background: '#090D16', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.92rem' }}>
                5. Query Read Output Vector: y_t = S_tᵀ · q_t ∈ ℝ⁴
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '2px' }}>
                Input q (L2-norm=1.0): [{currentStep.q.map(x => x.toFixed(2)).join(', ')}]
              </div>
            </div>
            <div style={{ background: '#0F172A', border: '1px solid #10B981', padding: '6px 14px', borderRadius: '6px', fontFamily: 'monospace', color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>
              [{currentStep.output.map(x => x.toFixed(3)).join(', ')}]
            </div>
          </div>

        </div>

      </div>

      {/* 3. SECTION 2: K3 LOWER-BOUNDED GATING & 16-TOKEN TILE PARALLELISM (§2.1.1) */}
      <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(167, 139, 250, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
              📐 Part 2: K3 Lower-Bounded Gating &amp; 16-Token Tile Parallelism (§2.1.1)
            </h3>
            <span style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
              Official Eq. 2.114–2.120: g_min = -5 bounds cumulative log-decay to (-80, 0), eliminating diagonal intra-chunk bottlenecks.
            </span>
          </div>
          <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', border: '1px solid #A78BFA', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            α_i ≥ exp(-5) ≈ 0.006738
          </span>
        </div>

        {/* Interactive Channel Gating Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Left: Interactive Gating Formula & Logit Controls */}
          <div style={{ background: '#090D16', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '8px' }}>
              Interactive Decay Logits z_i &amp; Log-scale A_h
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Per-head log-scale A:</span>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.1"
                value={userA}
                onChange={(e) => setUserA(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '0.85rem', width: '40px' }}>{userA.toFixed(1)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {channelZ.map((z, chIdx) => {
                const { g, alpha } = computeK3Gate(z, userA);
                const linearRes = computeKimiLinearGate(z, userA);
                return (
                  <div key={chIdx} style={{ background: '#0F172A', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                      <span style={{ color: '#E2E8F0', fontWeight: 'bold' }}>Channel {chIdx + 1} logit z: {z.toFixed(1)}</span>
                      <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>α = {alpha.toFixed(3)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="range"
                        min="-5.0"
                        max="2.0"
                        step="0.2"
                        value={z}
                        onChange={(e) => {
                          const newZ = [...channelZ];
                          newZ[chIdx] = Number(e.target.value);
                          setChannelZ(newZ);
                        }}
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '3px' }}>
                      <span>K3 g = {g.toFixed(2)} (bounded ≥ -5)</span>
                      <span>Kimi Linear g = {linearRes.g.toFixed(2)} {linearRes.g < -10 ? '⚠️ unbounded' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Numerical Stability & BF16 Tile Dynamic Range */}
          <div style={{ background: '#090D16', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>
              Why Lower-Bounded Decay Enables Dense Tensor Core GEMM
            </div>
            
            <div style={{ background: '#0F172A', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#E2E8F0', lineHeight: '1.55' }}>
              <div style={{ color: '#38BDF8' }}>// 16-Token Secondary Tile Rescaling Invariant:</div>
              <div>• Minimum decay logit: g_min = -5.0</div>
              <div>• Cumulative decay over 16 tokens: Σ g_i ≥ -5 × 16 = -80</div>
              <div>• Reciprocal rescaling: 1 / Γ ≤ exp(80) ≈ 5.54 × 10³⁴</div>
              <div style={{ color: '#10B981' }}>• BF16 Max Representable: 3.39 × 10³⁸ (Safe! No Overflow)</div>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.45', margin: 0 }}>
              In Kimi Linear, unbounded negative-Softplus decay caused 1/Γ to explode beyond BF16 range, forcing slow position-pair custom kernels on diagonal tiles. By bounding g_i ≥ -5, Kimi-K3 guarantees that all diagonal tiles can be executed using dense Tensor Core matrix multiplication!
            </p>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #F59E0B', padding: '8px 12px', borderRadius: '6px', color: '#FCD34D', fontSize: '0.8rem' }}>
              💡 <b>Chunkwise Parallelism:</b> Across 16-token chunks, KDA is recurrent; within each chunk, causal interactions are computed in parallel via causal masking and dense GEMM.
            </div>
          </div>

        </div>

      </div>

      {/* 4. SECTION 3: DECODING STATE-MEMORY ABLATION SANDBOX */}
      <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#10B981', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Part 3: Memory Footprint Sandbox (O(1) Recurrent State vs O(N) KV Cache)
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
        </div>

        {/* Side-by-Side Memory Footprint Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          
          {/* Standard Softmax Attention (Linear Memory Growth) */}
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.95rem' }}>Conventional 93-Layer MHA</span>
              <span style={{ color: '#EF4444', fontFamily: 'monospace', fontWeight: 'bold' }}>O(N) full KV-cache</span>
            </div>
            
            <div style={{ height: '22px', background: '#070913', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (memEst.standardMhaKvGiB / 600) * 100)}%`,
                  background: memEst.standardMhaKvGiB > 80 ? '#EF4444' : '#F59E0B',
                  transition: 'width 0.3s ease'
                }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '2px', fontSize: '0.78rem', color: '#FFF', fontFamily: 'monospace' }}>
                {memEst.standardMhaKvGiB.toFixed(1)} GiB (FP16, batch=1)
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              Linear KV explosion: 93 layers × 2 (K,V) × 96 heads × 128 d_h × {contextLength}K tokens × 2 bytes.
            </p>
          </div>

          {/* Kimi-K3 Hybrid Attention (69 KDA O(1) + 24 MLA) */}
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>Kimi-K3 Hybrid Cache (69 KDA + 24 MLA)</span>
              <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>{(memEst.standardMhaKvGiB / Math.max(0.01, memEst.totalK3CacheGiB)).toFixed(1)}× Savings</span>
            </div>
            
            <div style={{ height: '22px', background: '#070913', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(4, Math.min(100, (memEst.totalK3CacheGiB / 600) * 100))}%`,
                  background: '#10B981',
                  transition: 'width 0.3s ease'
                }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '2px', fontSize: '0.78rem', color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                Total {memEst.totalK3CacheGiB.toFixed(2)} GiB (69 KDA: {memEst.kdaRecurrentGiB.toFixed(2)} GiB fixed)
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              69 KDA layers maintain fixed-shape recurrent states ({memEst.kdaRecurrentGiB.toFixed(2)} GiB). Only 24 MLA layers store compressed low-rank KV latent vectors (d_c=512).
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
