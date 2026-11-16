import React, { useState, useMemo } from 'react';
import { MathRenderer } from './MathRenderer';
import { calculateMemoryEstimates } from '../utils/toyMath';
import { k3Specs } from '../data/k3Specs';

export const MLAOperatorDeepDive: React.FC = () => {
  const [compressDim, setCompressDim] = useState<number>(k3Specs.mla.dc); // Official config.json: d_c = 512
  const [contextLength, setContextLength] = useState<number>(128000);
  const [batchSize, setBatchSize] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'philosophy' | 'pipeline' | 'matrixAbsorption' | 'ropeDecouple' | 'memoryCalculator'>('philosophy');
  const [selectedStage, setSelectedStage] = useState<'input' | 'compress' | 'rope' | 'absorption' | 'unproject'>('compress');
  const [isAbsorbed, setIsAbsorbed] = useState<boolean>(true); // Matrix absorption toggle animation state

  const numHeads = k3Specs.mla.heads; // 96 heads
  const headDim = k3Specs.mla.dh; // 128 d_h

  // Full-model cache estimates across all 93 layers (24 MLA + 69 KDA)
  const memEst = useMemo(() => {
    return calculateMemoryEstimates(batchSize, contextLength, 2, compressDim);
  }, [batchSize, contextLength, compressDim]);

  const mhaFloatsPerToken = 2 * numHeads * headDim; // 24,576 floats per layer
  const mlaFloatsPerToken = compressDim; // d_c = 512 floats per layer
  const savingsRatio = (mhaFloatsPerToken / mlaFloatsPerToken).toFixed(1);

  // Full model memory in GiB
  const mhaMemoryGB = memEst.standardMhaKvGiB.toFixed(2);
  const mlaMemoryGB = memEst.mlaLatentKvGiB.toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div className="operator-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🧠</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              MLA (Multi-Head Latent Attention): complete architecture and dimension walkthrough
            </h2>
            <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', border: '1px solid #A78BFA', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Residual stream + low-rank KV + NoPE + Full-rank output gate
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Complete flow: <b>7,168-d residual bypass</b>, <b>low-rank KV latent (d_c = 512)</b>, and <b>pure NoPE global content attention with full-rank output gate</b>.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('philosophy')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'philosophy' ? 'linear-gradient(135deg, #38BDF8 0%, #00F2FE 100%)' : 'transparent',
              color: activeTab === 'philosophy' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            0. 🛣️ MLA complete architecture
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'pipeline' ? '#A78BFA' : 'transparent',
              color: activeTab === 'pipeline' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. 🖼️ Latent compression details
          </button>
          <button
            onClick={() => setActiveTab('matrixAbsorption')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'matrixAbsorption' ? '#38BDF8' : 'transparent',
              color: activeTab === 'matrixAbsorption' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. ⚡ Matrix absorption animation (no materialized expansion)
          </button>
          <button
            onClick={() => setActiveTab('ropeDecouple')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'ropeDecouple' ? '#F59E0B' : 'transparent',
              color: activeTab === 'ropeDecouple' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. 🚪 Pure NoPE &amp; full-rank output gate
          </button>
          <button
            onClick={() => setActiveTab('memoryCalculator')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'memoryCalculator' ? '#10B981' : 'transparent',
              color: activeTab === 'memoryCalculator' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            4. 📊 Memory comparison
          </button>
        </div>
      </div>

      {/* TAB 0: MASTER COMPLETE ARCHITECTURE DIAGRAM (WITH RESIDUAL + SEMANTICS + ROPE) */}
      {activeTab === 'philosophy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🏛️</span>
              <h3 style={{ fontSize: '1.3rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
                MLA complete architecture: residual highway + low-rank latent space (d_c=512) + pure NoPE + full-rank output gate
              </h3>
            </div>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', margin: 0, lineHeight: '1.6' }}>
              Official K3 specification: the <b>7,168-dimensional residual highway</b> branches into RMSNorm, compressing key-value tokens into a <b>low-rank KV latent c_t^KV ∈ ℝ^512 (d_c = 512)</b>. K3 MLA applies <b>pure NoPE</b> without an independent RoPE branch; positional and recency information is provided by the alternating KDA layers in the backbone (3 KDA : 1 MLA). Before final projection, attention output õ_t is modulated by an <b>input-dependent full-rank output gate</b>: y_t = W_o [Sigmoid(W_g x_t) ⊙ õ_t].
            </p>
          </div>

          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#38BDF8', margin: '0 0 12px 0', fontWeight: 'bold' }}>Guided four-step reading path</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '7px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.35)' }}>
                <b style={{ color: '#A78BFA' }}>1. Compress and cache (d_c = 512)</b>
                <div style={{ marginTop: '5px', color: '#E2E8F0', fontFamily: 'monospace' }}>x_t → c_t^KV = W_c x_t ∈ ℝ^512</div>
                <small style={{ display: 'block', marginTop: '5px', color: '#94A3B8', lineHeight: '1.45' }}>KV cache stores c_t^KV once per token (48× smaller than standard MHA 24,576 floats).</small>
              </div>
              <div style={{ padding: '12px', borderRadius: '7px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)' }}>
                <b style={{ color: '#F59E0B' }}>2. Pure NoPE global attention</b>
                <div style={{ marginTop: '5px', color: '#E2E8F0', fontFamily: 'monospace' }}>q_t ∈ ℝ^[96×128], NoPE</div>
                <small style={{ display: 'block', marginTop: '5px', color: '#94A3B8', lineHeight: '1.45' }}>No RoPE cache needed; alternating KDA layers supply position and recency across the 1M context.</small>
              </div>
              <div style={{ padding: '12px', borderRadius: '7px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.35)' }}>
                <b style={{ color: '#38BDF8' }}>3. Full-rank output gate</b>
                <div style={{ marginTop: '5px', color: '#E2E8F0', fontFamily: 'monospace' }}>g_t = Sigmoid(W_g x_t) ∈ ℝ^12,288</div>
                <small style={{ display: 'block', marginTop: '5px', color: '#94A3B8', lineHeight: '1.45' }}>Input-dependent full-rank gate modulates each attention channel before output projection.</small>
              </div>
              <div style={{ padding: '12px', borderRadius: '7px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.35)' }}>
                <b style={{ color: '#10B981' }}>4. Project and accumulate</b>
                <div style={{ marginTop: '5px', color: '#E2E8F0', fontFamily: 'monospace' }}>y_t = W_o [g_t ⊙ õ_t] → AttnRes partial_sum</div>
                <small style={{ display: 'block', marginTop: '5px', color: '#94A3B8', lineHeight: '1.45' }}>Maps back to the 7,168-d model stream and accumulates into Block AttnRes partial sum (partial_sum ← partial_sum + y_t; no standard x+y residual shortcut).</small>
              </div>
            </div>
          </div>

          <details open style={{ background: '#070913', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <summary style={{ cursor: 'pointer', padding: '14px 18px', color: '#E2E8F0', fontWeight: 'bold' }}>Show complete architecture map (all branches and dimensions)</summary>

          {/* MASTER SVG FLOWCHART */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', overflowX: 'auto' }}>
            
            <svg viewBox="0 0 980 440" width="100%" height="440" style={{ overflow: 'visible', minWidth: '980px' }}>
              <defs>
                <linearGradient id="grad-highway" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#00F2FE" />
                </linearGradient>
                <marker id="arrow-master-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00F2FE" />
                </marker>
                <marker id="arrow-master-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                </marker>
                <marker id="arrow-master-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
                <marker id="arrow-master-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                </marker>
              </defs>

              {/* === TRACK 1: MAIN RESIDUAL HIGHWAY (TOP PATH) === */}
              <g>
                <rect x="20" y="30" width="110" height="50" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                <text x="75" y="52" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Input x_t</text>
                <text x="75" y="70" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ℝ^7,168</text>

                {/* Main Highway Line */}
                <path d="M 130 55 L 850 55" stroke="url(#grad-highway)" strokeWidth="5" fill="none" markerEnd="url(#arrow-master-blue)" />
                <rect x="340" y="30" width="280" height="24" rx="12" fill="#070913" stroke="#00F2FE" strokeWidth="1.5" />
                <text x="480" y="46" fill="#00F2FE" fontSize="11" fontWeight="bold" textAnchor="middle">
                  🛣️ 7,168-d residual highway (bypass path)
                </text>
              </g>

              {/* SPLIT POINT FROM HIGHWAY TO MLA SIDE-BRANCH */}
              <path d="M 130 70 L 170 170" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <circle cx="170" cy="170" r="4" fill="#A78BFA" />

              {/* RMSNORM NODE */}
              <rect x="170" y="145" width="90" height="50" rx="6" fill="#0F172A" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <text x="215" y="168" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">RMSNorm</text>
              <text x="215" y="185" fill="#94A3B8" fontSize="11" textAnchor="middle" fontFamily="monospace">ℝ^7,168</text>

              {/* PATH A: LATENT KV COMPRESSION (STORED IN KV CACHE) */}
              <path d="M 260 160 L 300 160" stroke="#A78BFA" strokeWidth="2" fill="none" markerEnd="url(#arrow-master-purple)" />
              <rect x="300" y="135" width="165" height="50" rx="6" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
              <text x="382" y="157" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">KV Latent: c_t^KV = W_c x_t</text>
              <text x="382" y="175" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">c_t^KV ∈ ℝ^512 (d_c = 512)</text>

              {/* PATH B: PURE NoPE QUERY PROJECTION */}
              <path d="M 260 180 C 260 230, 270 230, 300 230" stroke="#38BDF8" strokeWidth="2" fill="none" markerEnd="url(#arrow-master-blue)" />
              <rect x="300" y="210" width="165" height="50" rx="6" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="382" y="232" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">Query: q_t (NoPE)</text>
              <text x="382" y="250" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">96 heads × d_h=128</text>

              {/* PATH C: FULL-RANK OUTPUT GATE BRANCH */}
              <path d="M 215 195 C 215 320, 260 320, 300 320" stroke="#F59E0B" strokeWidth="2" fill="none" markerEnd="url(#arrow-master-amber)" />
              <rect x="300" y="295" width="165" height="50" rx="6" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
              <text x="382" y="317" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">Full-rank Gate W_g x_t</text>
              <text x="382" y="335" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">g_t = Sigmoid(W_g x_t) ∈ ℝ^12,288</text>

              {/* HIGHLIGHT DASHED BOX FOR STORED KV CACHE */}
              <rect x="290" y="120" width="185" height="75" rx="8" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,4" />
              <text x="382" y="112" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">💾 KV Cache: c_t^KV ∈ ℝ^512 only</text>

              {/* ATTENTION DOT PRODUCT AND SOFTMAX NODE */}
              <path d="M 465 160 C 490 160, 490 185, 515 185" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 465 230 C 490 230, 490 205, 515 205" stroke="#38BDF8" strokeWidth="2" fill="none" />

              <g>
                <rect x="515" y="145" width="170" height="115" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#38BDF8" strokeWidth="2" />
                <text x="600" y="170" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">Attention Core</text>
                <text x="600" y="190" fill="#A78BFA" fontSize="11" textAnchor="middle">NoPE score: q_t · K_j^T</text>
                <text x="600" y="210" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">õ_t ∈ ℝ^12,288</text>
                <text x="600" y="230" fill="#94A3B8" fontSize="10.5" textAnchor="middle">Matrix absorption avoids K,V alloc</text>
                <text x="600" y="248" fill="#64748B" fontSize="10" textAnchor="middle">(96 heads × 128-d = 12,288)</text>
              </g>

              {/* CHANNEL-WISE MODULATION: õ_t ⊙ g_t */}
              <path d="M 685 200 L 725 200" stroke="#38BDF8" strokeWidth="2" fill="none" />
              <path d="M 465 320 C 725 320, 725 260, 725 220" stroke="#F59E0B" strokeWidth="2" fill="none" />
              <circle cx="725" cy="200" r="14" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
              <text x="725" y="205" fill="#F59E0B" fontSize="15" fontWeight="bold" textAnchor="middle">⊙</text>
              <text x="725" y="180" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">g_t ⊙ õ_t</text>

              {/* OUTPUT UP-PROJECTION W_o */}
              <path d="M 740 200 L 775 200" stroke="#10B981" strokeWidth="2" fill="none" markerEnd="url(#arrow-master-green)" />
              <g>
                <rect x="775" y="175" width="105" height="50" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
                <text x="827" y="197" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">Output W_o</text>
                <text x="827" y="215" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">y_t ∈ ℝ^7,168</text>
              </g>

              {/* RE-CONVERGENCE UP TO RESIDUAL HIGHWAY */}
              <path d="M 880 200 C 890 200, 890 75, 890 70" stroke="#10B981" strokeWidth="2.5" fill="none" />
              
              {/* SUMMATION NODE INTO BLOCK ATTNRES PARTIAL SUM */}
              <circle cx="890" cy="55" r="15" fill="#10B981" stroke="#FFF" strokeWidth="2" />
              <text x="890" y="61" fill="#000" fontSize="18" fontWeight="bold" textAnchor="middle">+</text>
              <text x="890" y="25" fill="#10B981" fontSize="10" fontWeight="bold" textAnchor="middle">partial_sum +</text>

              {/* FINAL OUTPUT NODE (7,168-d) */}
              <line x1="905" y1="55" x2="935" y2="55" stroke="#10B981" strokeWidth="3" />
              <rect x="935" y="30" width="40" height="50" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="2" />
              <text x="955" y="50" fill="#10B981" fontSize="9" fontWeight="bold" textAnchor="middle">Block</text>
              <text x="955" y="63" fill="#FFF" fontSize="8" fontFamily="monospace" textAnchor="middle">AttnRes</text>
              <text x="955" y="74" fill="#38BDF8" fontSize="8" fontFamily="monospace" textAnchor="middle">7168d</text>

            </svg>

            {/* Stage Dimension Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', width: '100%' }}>
              
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #38BDF8' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>1. Main-stream input</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>x_t ∈ ℝ^7,168</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>The 7,168-d residual bypass preserves the model representation across all 93 layers.</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #A78BFA' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>2. KV cache representation</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>c_t^KV ∈ ℝ^512 (d_c = 512)</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Pure NoPE: only the 512-d latent is cached, achieving 48× KV memory savings vs standard MHA.</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #F59E0B' }}>
                <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.95rem' }}>3. Attention &amp; output gate</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>g_t ⊙ õ_t ∈ ℝ^12,288</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>96 heads × d_h=128 = 12,288 dimensions, channel-modulated by full-rank Sigmoid(W_g x_t).</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #10B981' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>4. Residual output</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>h_{'{l+1}'} ∈ ℝ^7,168</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>W_o maps 12,288 channels back to 7,168 and adds to the residual highway.</p>
              </div>

            </div>

          </div>

          </details>

          {/* Theoretical Summary Box */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#FFF', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Summary: official MLA architectural invariants in Kimi K3
            </h4>
            <ul style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
              <li><b>Authoritative dimensions</b>: Model hidden dimension d = 7,168, KV low-rank compression d_c = 512, 96 attention heads, head dimension d_h = 128 (total attention width 12,288).</li>
              <li><b>Pure NoPE design</b>: K3 MLA dispenses with decoupled RoPE key caching entirely. Sequence position and recency are naturally handled by the alternating KDA layers in the backbone (3 KDA : 1 MLA ratio).</li>
              <li><b>Input-dependent full-rank output gate</b>: Unlike standard MLA which projects attention outputs directly, K3 modulates channels via Sigmoid(W_g x_t) ⊙ õ_t where W_g is full rank (12,288 × 7,168).</li>
            </ul>
          </div>

        </div>
      )}

      {/* TAB 1: GRAPHIC TENSOR COMPRESSION PIPELINE */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
                🖼️ Interactive view: how is the 7,168-d representation compressed into a KV latent?
              </h3>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>💡 Click a node to inspect the corresponding transformation.</span>
            </div>
          </div>

          {/* Interactive SVG Diagram displaying visual shapes of matrices & tensors */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <svg viewBox="0 0 940 380" width="100%" height="380" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradient-input" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
                <linearGradient id="gradient-latent" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="gradient-rope" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>

              {/* SECTION 1: INPUT VECTOR (7168 dimensional tall bar) */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('input')}>
                <rect x="20" y="40" width="40" height="280" rx="6" fill="url(#gradient-input)" stroke={selectedStage === 'input' ? '#FFF' : 'none'} strokeWidth="2" />
                <text x="40" y="30" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">x_t</text>
                <text x="40" y="340" fill="#94A3B8" fontSize="12" textAnchor="middle">7,168-d</text>
                <text x="40" y="180" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle" transform="rotate(-90 40 180)">model representation</text>
              </g>

              {/* CONNECTOR ARROW 1: TO COMPRESSION MATRIX */}
              <line x1="70" y1="120" x2="140" y2="120" stroke="#A78BFA" strokeWidth="2" />
              <line x1="70" y1="240" x2="140" y2="240" stroke="#F59E0B" strokeWidth="2" />

              {/* SECTION 2: COMPRESSION MATRIX BLOCKS */}
              {/* Top: W_dkv Matrix Funnel */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('compress')}>
                <path d="M 140 60 L 260 90 L 260 150 L 140 180 Z" fill="rgba(167, 139, 250, 0.15)" stroke={selectedStage === 'compress' ? '#A78BFA' : 'rgba(167, 139, 250, 0.4)'} strokeWidth="2" />
                <text x="200" y="125" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">W_c (latent projection)</text>
                <text x="200" y="142" fill="#94A3B8" fontSize="11" textAnchor="middle">[d_c × 7,168; d_c = 512]</text>
              </g>

              {/* Bottom: NoPE boundary; retained as an interactive teaching node */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('rope')}>
                <path d="M 140 200 L 260 220 L 260 260 L 140 280 Z" fill="rgba(245, 158, 11, 0.15)" stroke={selectedStage === 'rope' ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)'} strokeWidth="2" />
                <text x="200" y="245" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">Pure NoPE boundary</text>
                <text x="200" y="260" fill="#94A3B8" fontSize="11" textAnchor="middle">no independent positional cache</text>
              </g>

              {/* CONNECTOR ARROW 2: TO LATENT VECTORS */}
              <line x1="260" y1="120" x2="330" y2="120" stroke="#A78BFA" strokeWidth="2" />
              <line x1="260" y1="240" x2="330" y2="240" stroke="#F59E0B" strokeWidth="2" />

              {/* SECTION 3: COMPACT LATENT VECTORS (THE KV CACHE DATA!) */}
              {/* Compressed Latent KV Cache c_t^KV */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('compress')}>
                <rect x="330" y="105" width="160" height="30" rx="4" fill="url(#gradient-latent)" stroke={selectedStage === 'compress' ? '#FFF' : 'none'} strokeWidth="2" />
                <text x="410" y="125" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">c_t^KV (content latent)</text>
                <text x="410" y="95" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">d_c = 512 (official)</text>
              </g>

              {/* No independent RoPE key is cached in K3 MLA */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('rope')}>
                <rect x="330" y="225" width="80" height="30" rx="4" fill="url(#gradient-rope)" stroke={selectedStage === 'rope' ? '#FFF' : 'none'} strokeWidth="2" />
                <text x="370" y="245" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">KDA position / recency</text>
                <text x="370" y="215" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">not MLA KV cache</text>
              </g>

              {/* HIGHLIGHT BOX AROUND KV CACHE */}
              <rect x="315" y="70" width="190" height="210" rx="8" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="6,4" />
              <text x="410" y="295" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">💾 KV cache stores the latent</text>
              <text x="410" y="312" fill="#10B981" fontSize="11" textAnchor="middle">(d_c = 512; pure NoPE without RoPE key)</text>

              {/* CONNECTOR ARROW 3: TO UNPROJECTED MULTI-HEAD MATRIX */}
              <line x1="490" y1="120" x2="580" y2="120" stroke="#A78BFA" strokeWidth="2" strokeDasharray="4,2" />
              
              {/* SECTION 4: UNPROJECTED MULTI-HEAD MATRIX (LOGICAL VIEW FOR TRAINING/MHA COMPARISON) */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('unproject')}>
                <rect x="580" y="40" width="220" height="160" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke={selectedStage === 'unproject' ? '#A78BFA' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
                <text x="690" y="65" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">Logical 96-head Key/Value view</text>
                
                {/* 96 Multi-head column grid visualization */}
                <g opacity="0.7">
                  <rect x="595" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="615" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="635" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <text x="665" y="120" fill="#94A3B8" fontSize="16" fontWeight="bold">...</text>
                  <rect x="685" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="705" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                  <rect x="770" y="80" width="16" height="70" rx="2" fill="#38BDF8" />
                </g>
                <text x="690" y="175" fill="#94A3B8" fontSize="11" textAnchor="middle">[96 heads × d_h=128; total 12,288-d]</text>
                <text x="690" y="190" fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle">❌ Logical view only: avoided via matrix absorption</text>
              </g>
            </svg>

            {/* Bottom Interactive Stage Explanation Card */}
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)', width: '100%' }}>
              {selectedStage === 'input' && (
                <div>
                  <h4 style={{ color: '#38BDF8', margin: '0 0 6px 0', fontSize: '1.1rem' }}>1. Model representation x_t (7,168-d)</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    This is the current token’s representation in the Transformer stream (7,168 dimensions). In the 24 MLA layers, this is mapped into 96 attention heads with head dimension d_h = 128 (total attention width 12,288).
                  </p>
                </div>
              )}
              {selectedStage === 'compress' && (
                <div>
                  <h4 style={{ color: '#A78BFA', margin: '0 0 6px 0', fontSize: '1.1rem' }}>2. Latent projection W_c (7,168-d ➔ d_c = 512)</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    The projection W_c maps the 7,168-d representation to one compact <b>KV latent c_t^KV ∈ ℝ^512</b> (official config.json: kv_lora_rank = 512). It is shared by Key and Value reconstruction paths and stored once per token, yielding 48× memory savings vs MHA.
                  </p>
                </div>
              )}
              {selectedStage === 'rope' && (
                <div>
                  <h4 style={{ color: '#F59E0B', margin: '0 0 6px 0', fontSize: '1.1rem' }}>3. Pure NoPE: no independent MLA positional branch</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    K3 MLA is documented as NoPE: it does not create or cache a separate RoPE positional Key. In the hybrid architecture, KDA provides position-sensitive recurrent mixing and recency information, while MLA supplies global content interaction across the 1M context.
                  </p>
                </div>
              )}
              {selectedStage === 'unproject' && (
                <div>
                  <h4 style={{ color: '#EF4444', margin: '0 0 6px 0', fontSize: '1.1rem' }}>4. Logical multi-head view vs. MLA matrix absorption</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    In the logical formulation, the latent can be mapped to 96-head Key/Value representations (96 × 128 = 12,288). <b>Matrix absorption reorders fixed projections so inference computes attention directly against c_j^KV, never materializing the full 12,288-d Key/Value tensors in VRAM.</b>
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: ANIMATED MATRIX ABSORPTION TRICK */}
      {activeTab === 'matrixAbsorption' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                ⚡ Matrix absorption animation — what happens on the GPU?
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
                Toggle matrix absorption to compare explicit logical expansion with the absorbed projection path.
              </p>
            </div>

            <button
              onClick={() => setIsAbsorbed(!isAbsorbed)}
              style={{
                background: isAbsorbed ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' : 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(0,0,0,0.5)'
              }}
            >
              {isAbsorbed ? '✅ State: matrix absorption enabled (no materialized expansion)' : '❌ State: explicit logical expansion (absorption off)'}
            </button>
          </div>

          {/* Visual SVG Animation comparing Unabsorbed vs Absorbed State */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            <svg viewBox="0 0 900 320" width="100%" height="320" style={{ overflow: 'visible' }}>
              
              {!isAbsorbed ? (
                /* UNABSORBED STATE: Query -> W_uq -> (96 Head Q) * (96 Head K^T) <- W_uk <- Latent c_t */
                <g>
                  {/* Query latent */}
                  <rect x="40" y="130" width="100" height="40" rx="6" fill="#38BDF8" />
                  <text x="90" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Query q_t^C</text>
                  
                  {/* W_uq up projection */}
                  <rect x="180" y="110" width="110" height="80" rx="6" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="235" y="155" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">W_uq^T (query projection)</text>

                  {/* 96 Head Uncompressed Q */}
                  <rect x="340" y="80" width="80" height="140" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="380" y="145" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Q_t (96 heads)</text>

                  {/* Multiplication Dot */}
                  <circle cx="450" cy="150" r="14" fill="#FFB000" />
                  <text x="450" y="155" fill="#000" fontSize="16" fontWeight="bold" textAnchor="middle">×</text>

                  {/* 96 Head Uncompressed K^T */}
                  <rect x="480" y="80" width="80" height="140" rx="6" fill="#0F172A" stroke="#A78BFA" strokeWidth="2" />
                  <text x="520" y="145" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">K_j^T (96 heads)</text>

                  {/* W_uk up projection */}
                  <rect x="610" y="110" width="110" height="80" rx="6" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="1.5" />
                  <text x="665" y="155" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">W_uk (Key projection)</text>

                  {/* Latent c_j^KV */}
                  <rect x="760" y="130" width="100" height="40" rx="6" fill="#A78BFA" />
                  <text x="810" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Latent c_j^KV</text>

                  {/* Arrows */}
                  <line x1="140" y1="150" x2="180" y2="150" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="290" y1="150" x2="340" y2="150" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="760" y1="150" x2="720" y2="150" stroke="#A78BFA" strokeWidth="2" />
                  <line x1="610" y1="150" x2="560" y2="150" stroke="#A78BFA" strokeWidth="2" />

                  <text x="450" y="270" fill="#EF4444" fontSize="14" fontWeight="bold" textAnchor="middle">
                    ❌ Explicit expansion materializes intermediate multi-head tensors before the dot product.
                  </text>
                </g>
              ) : (
                /* ABSORBED STATE: Query -> Absorbed W_QK -> Direct Dot with Latent c_t */
                <g>
                  {/* Query latent */}
                  <rect x="80" y="130" width="120" height="40" rx="6" fill="#38BDF8" />
                  <text x="140" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Query q_t^C</text>

                  <line x1="200" y1="150" x2="260" y2="150" stroke="#38BDF8" strokeWidth="2" />

                  {/* Combined W_QK Matrix */}
                  <g>
                    <rect x="260" y="90" width="220" height="120" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2.5" />
                    <text x="370" y="130" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">W_QK (absorbed projection)</text>
                    <text x="370" y="155" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">W_QK = W_uq^T · W_uk^T</text>
                    <text x="370" y="175" fill="#94A3B8" fontSize="11" textAnchor="middle">[fixed projections can be reordered / fused]</text>
                  </g>

                  <line x1="480" y1="150" x2="540" y2="150" stroke="#10B981" strokeWidth="2" />

                  {/* Multiplied Query q'_t */}
                  <rect x="540" y="130" width="130" height="40" rx="6" fill="#10B981" />
                  <text x="605" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">fused Query q'_t</text>

                  <circle cx="710" cy="150" r="14" fill="#FFB000" />
                  <text x="710" y="155" fill="#000" fontSize="16" fontWeight="bold" textAnchor="middle">×</text>

                  <line x1="724" y1="150" x2="760" y2="150" stroke="#A78BFA" strokeWidth="2" />

                  {/* Latent c_j^KV */}
                  <rect x="760" y="130" width="120" height="40" rx="6" fill="#A78BFA" />
                  <text x="820" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">Latent c_j^KV (d_c)</text>

                  <text x="450" y="270" fill="#10B981" fontSize="14" fontWeight="bold" textAnchor="middle">
                    🚀 Efficient path: fixed projections are absorbed, so the cached latent can be used without materializing full K/V tensors.
                  </text>
                </g>
              )}

            </svg>

            {/* Formula Math Box */}
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', width: '100%', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.05rem' }}>Derivation: associativity of matrix multiplication</span>
              <MathRenderer
                color="#10B981"
                formula={`// 1. Explicit logical view: project the latent before the dot product
Score = Q_t · K_j^T = (q_t^C · W_{uq}^T) · (W_{uk} · c_j^{KV})^T

// 2. Associativity: fuse the fixed projections into W_{QK}
Score = q_t^C · (W_{uq}^T · W_{uk}^T) · (c_j^{KV})^T = q_t^C · W_{QK} · (c_j^{KV})^T

// 3. Inference path: avoid materializing the expanded K/V tensors
q'_t = q_t^C · W_{QK} \\quad \\Rightarrow \\quad Score = q'_t · (c_j^{KV})^T`}
              />
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: PURE NOPE & FULL-RANK OUTPUT GATE GRAPHIC */}
      {activeTab === 'ropeDecouple' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🚪 Pure NoPE design &amp; input-dependent full-rank output gate
            </h3>
            <p style={{ color: '#E2E8F0', fontSize: '1rem', margin: 0, lineHeight: '1.6' }}>
              Unlike DeepSeek MLA which caches an extra decoupled 64-d RoPE key vector per token, <b>Kimi K3 adopts pure NoPE (No Position Encoding)</b> in all 24 MLA layers. Because the backbone interleaves 3 KDA layers for every MLA layer, KDA recurrent states provide fine-grained positional and recency information. Furthermore, K3 equips MLA with an <b>input-dependent full-rank output gate</b>:
            </p>
            <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)', fontFamily: 'monospace', color: '#F59E0B' }}>
              y_t = W_o [ Sigmoid(W_g x_t) ⊙ õ_t ] \\quad (W_g \\in \\mathbb&#123;R&#125;^{'{12,288 \\times 7,168}'}, \\text&#123;full rank&#125;)
            </div>
          </div>

          {/* SVG Visual Graphic of NoPE Attention + Full-Rank Output Gate */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="0 0 880 300" width="100%" height="300" style={{ overflow: 'visible' }}>
              
              {/* Input Node */}
              <rect x="20" y="120" width="110" height="60" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
              <text x="75" y="146" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Input x_t</text>
              <text x="75" y="166" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ℝ^7,168</text>

              {/* Split Paths */}
              <path d="M 130 140 C 180 140, 180 70, 230 70" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 130 160 C 180 160, 180 230, 230 230" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* PATH A: PURE NoPE ATTENTION CORE */}
              <g>
                <rect x="230" y="40" width="350" height="60" rx="8" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
                <text x="405" y="65" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">Path A: Pure NoPE Multi-Head Attention</text>
                <text x="405" y="85" fill="#FFF" fontSize="11" textAnchor="middle">q_t · (W_c c_j^KV)ᵀ → Softmax → õ_t ∈ ℝ^12,288 (96 heads × 128)</text>
              </g>

              {/* PATH B: FULL-RANK OUTPUT GATE */}
              <g>
                <rect x="230" y="200" width="350" height="60" rx="8" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
                <text x="405" y="225" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">Path B: Input-dependent Full-Rank Output Gate</text>
                <text x="405" y="245" fill="#FFF" fontSize="11" textAnchor="middle">g_t = Sigmoid(W_g x_t) ∈ ℝ^12,288 (full rank, no low-rank bottleneck)</text>
              </g>

              {/* CONVERGENCE AT MODULATION NODE */}
              <path d="M 580 70 C 640 70, 640 135, 680 142" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 580 230 C 640 230, 640 165, 680 158" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* Element-wise Multiplication Node */}
              <circle cx="680" cy="150" r="16" fill="#0F172A" stroke="#10B981" strokeWidth="2.5" />
              <text x="680" y="156" fill="#10B981" fontSize="18" fontWeight="bold" textAnchor="middle">⊙</text>
              <text x="680" y="125" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">g_t ⊙ õ_t</text>

              {/* Output Projection Node */}
              <line x1="696" y1="150" x2="740" y2="150" stroke="#10B981" strokeWidth="2" />
              <rect x="740" y="120" width="120" height="60" rx="8" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" />
              <text x="800" y="145" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Output W_o</text>
              <text x="800" y="165" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">y_t ∈ ℝ^7,168</text>

            </svg>
          </div>

        </div>
      )}

      {/* TAB 4: MEMORY CALCULATOR & VISUAL VOLUMETRIC COMPARISON */}
      {activeTab === 'memoryCalculator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📊 Interactive memory comparison and calculator
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
              Calculated using authoritative Kimi K3 specifications: 93 layers (69 O(1) KDA recurrent layers + 24 MLA low-rank layers with d_c = {compressDim}), 96 heads, d_h = 128, BF16/FP16 (2 bytes/float).
            </p>
          </div>

          <div className="mla-memory-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            
            {/* Controls */}
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>⚙️ Teaching parameters (sliders)</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Context length:</span>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontFamily: 'monospace' }}>{(contextLength / 1024).toFixed(0)}K tokens</span>
                </div>
                <input
                  type="range"
                  min="8192"
                  max="1024000"
                  step="8192"
                  value={contextLength}
                  onChange={(e) => setContextLength(parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Batch size:</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontFamily: 'monospace' }}>{batchSize}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="32"
                  step="1"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Latent width d_c (official = 512):</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{compressDim}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="1024"
                  step="128"
                  value={compressDim}
                  onChange={(e) => setCompressDim(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Visual Bar Comparison Chart */}
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>Full-Model KV Cache Comparison (GiB in FP16)</span>

              {/* Bar 1: Standard MHA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#EF4444', fontWeight: 'bold' }}>❌ 93-Layer Standard MHA (96 heads, d_h=128, 2×K,V)</span>
                  <span style={{ color: '#EF4444', fontWeight: 'bold', fontFamily: 'monospace' }}>{mhaMemoryGB} GiB</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Bar 2: Kimi K3 MLA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>✅ 24-Layer Kimi K3 Gated MLA (latent KV d_c={compressDim})</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{mlaMemoryGB} GiB</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, (parseFloat(mlaMemoryGB) / Math.max(0.01, parseFloat(mhaMemoryGB))) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)', borderRadius: '4px', transition: 'width 0.3s ease-in-out' }} />
                </div>
              </div>

              <div style={{ marginTop: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', fontWeight: 'bold', fontSize: '1.05rem', textAlign: 'center' }}>
                🚀 Memory Reduction Ratio: {(parseFloat(mhaMemoryGB) / Math.max(0.01, parseFloat(mlaMemoryGB))).toFixed(1)}× less KV Cache footprint for the 24 MLA layers vs standard MHA (per-layer compression {savingsRatio}×). Combined with 69 constant O(1) KDA layers, K3 achieves total cache scalability up to 1M tokens!
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
