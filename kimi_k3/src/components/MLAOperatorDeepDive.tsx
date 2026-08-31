import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';

export const MLAOperatorDeepDive: React.FC = () => {
  const [compressDim, setCompressDim] = useState<number>(512); // Teaching slider: K3 does not disclose d_c.
  const [ropeDim] = useState<number>(0); // K3 MLA is NoPE: no independent RoPE cache branch.
  const [contextLength, setContextLength] = useState<number>(128000); // Teaching default for the calculator.
  const [batchSize, setBatchSize] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<'philosophy' | 'pipeline' | 'matrixAbsorption' | 'ropeDecouple' | 'memoryCalculator'>('philosophy');
  const [selectedStage, setSelectedStage] = useState<'input' | 'compress' | 'rope' | 'absorption' | 'unproject'>('compress');
  const [isAbsorbed, setIsAbsorbed] = useState<boolean>(true); // Matrix absorption toggle animation state

  // Report-confirmed structural constant; undisclosed widths are teaching estimates only.
  const numHeads = 96;
  const headDim = 128; // d_h: teaching estimate, not a K3 report value.

  // Memory Calculations
  const mhaFloatsPerToken = 2 * numHeads * headDim; // 24,576 floats
  const mlaFloatsPerToken = compressDim + ropeDim; // 576 floats
  const savingsRatio = (mhaFloatsPerToken / mlaFloatsPerToken).toFixed(1);

  // Memory in GB (FP16)
  const mhaMemoryGB = ((batchSize * contextLength * mhaFloatsPerToken * 2) / (1024 * 1024 * 1024)).toFixed(2);
  const mlaMemoryGB = ((batchSize * contextLength * mlaFloatsPerToken * 2) / (1024 * 1024 * 1024)).toFixed(2);

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
              Residual stream + low-rank KV + NoPE global content interaction
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Complete flow: <b>7,168-d residual bypass</b>, <b>low-rank KV latent (width undisclosed)</b>, and <b>NoPE global content interaction</b>.
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
            3. 🧩 NoPE and KDA position / recency roles
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
            MLA complete architecture: residual highway + low-rank latent space + NoPE content attention
              </h3>
            </div>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', margin: 0, lineHeight: '1.6' }}>
              This diagram preserves the complete teaching flow: the <b>7,168-dimensional residual highway</b>, the <b>low-rank KV latent branch whose width is not disclosed in the K3 report</b>, and the <b>NoPE boundary</b>. K3 MLA does not add an independent RoPE cache branch; positional and recency information is supplied by the KDA side of the hybrid block.
            </p>
          </div>

          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#38BDF8', margin: '0 0 12px 0', fontWeight: 'bold' }}>Guided three-step reading path</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '7px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.35)' }}>
                <b style={{ color: '#A78BFA' }}>1. Compress and cache</b>
                <div style={{ marginTop: '5px', color: '#E2E8F0', fontFamily: 'monospace' }}>x_t → c_t^KV = W_c x_t</div>
                <small style={{ display: 'block', marginTop: '5px', color: '#94A3B8', lineHeight: '1.45' }}>A compact latent is stored once per token; its width d_c is not disclosed.</small>
              </div>
              <div style={{ padding: '12px', borderRadius: '7px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)' }}>
                <b style={{ color: '#F59E0B' }}>2. Query and attend</b>
                <div style={{ marginTop: '5px', color: '#E2E8F0', fontFamily: 'monospace' }}>q_t → W_QK → score → Softmax</div>
                <small style={{ display: 'block', marginTop: '5px', color: '#94A3B8', lineHeight: '1.45' }}>Matrix absorption reorders fixed projections; KDA supplies the position / recency role in the hybrid block.</small>
              </div>
              <div style={{ padding: '12px', borderRadius: '7px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.35)' }}>
                <b style={{ color: '#10B981' }}>3. Project and merge</b>
                <div style={{ marginTop: '5px', color: '#E2E8F0', fontFamily: 'monospace' }}>o_t → W_o → Δy → residual</div>
                <small style={{ display: 'block', marginTop: '5px', color: '#94A3B8', lineHeight: '1.45' }}>The attention output is mapped back to the 7,168-d stream and merged with the residual highway.</small>
              </div>
            </div>
          </div>

          <details style={{ background: '#070913', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <summary style={{ cursor: 'pointer', padding: '14px 18px', color: '#E2E8F0', fontWeight: 'bold' }}>Show complete architecture map (all branches and dimensions)</summary>

          {/* MASTER SVG FLOWCHART */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', overflowX: 'auto' }}>
            
            <svg viewBox="0 0 980 480" width="100%" height="480" style={{ overflow: 'visible', minWidth: '980px' }}>
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
                <rect x="20" y="40" width="110" height="50" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                <text x="75" y="62" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Input x_t</text>
                <text x="75" y="80" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ℝ^7,168</text>

                {/* Main Highway Line */}
                <path d="M 130 65 L 830 65" stroke="url(#grad-highway)" strokeWidth="5" fill="none" markerEnd="url(#arrow-master-blue)" />
                <rect x="340" y="40" width="280" height="24" rx="12" fill="#070913" stroke="#00F2FE" strokeWidth="1.5" />
                <text x="480" y="56" fill="#00F2FE" fontSize="11" fontWeight="bold" textAnchor="middle">
                  🛣️ 7,168-d residual highway (bypass path)
                </text>
              </g>

              {/* SPLIT POINT FROM HIGHWAY TO MLA SIDE-BRANCH */}
              <path d="M 130 80 L 170 180" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <circle cx="170" cy="180" r="4" fill="#A78BFA" />
              <circle cx="150" cy="150" r="12" fill="#A78BFA" stroke="#FFF" strokeWidth="1" />
              <text x="150" y="155" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">1</text>

              {/* RMSNORM NODE */}
              <rect x="170" y="155" width="90" height="50" rx="6" fill="#0F172A" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <text x="215" y="178" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">RMSNorm</text>
              <text x="215" y="195" fill="#94A3B8" fontSize="10" textAnchor="middle" fontFamily="monospace">ℝ^7,168</text>

              {/* === TRACK 2: LATENT KV PATH (MIDDLE TRACK) === */}
              {/* Split into Semantic Latent Projection */}
              <path d="M 260 170 L 300 170" stroke="#A78BFA" strokeWidth="2" fill="none" markerEnd="url(#arrow-master-purple)" />
              <rect x="300" y="145" width="160" height="50" rx="6" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
              <text x="380" y="167" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">KV latent c_t^KV = W_c · x_t</text>
              <text x="380" y="185" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">c_t^KV ∈ ℝ^d_c (not disclosed)</text>

              {/* === TRACK 3: NOPE / KDA POSITION BOUNDARY (BOTTOM TRACK) === */}
              <path d="M 260 190 C 260 320, 270 320, 300 320" stroke="#F59E0B" strokeWidth="2" fill="none" markerEnd="url(#arrow-master-amber)" />
              <rect x="300" y="295" width="160" height="50" rx="6" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
              <text x="380" y="317" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">NoPE: no independent positional Key branch</text>
              <text x="380" y="335" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">KDA supplies position / recency signals</text>

              {/* HIGHLIGHT DASHED BOX FOR STORED KV CACHE */}
              <rect x="290" y="125" width="180" height="235" rx="8" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,4" />
              <text x="380" y="375" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">💾 KV cache stores c_t^KV only</text>
              <text x="380" y="390" fill="#10B981" fontSize="10" textAnchor="middle">(d_c is not disclosed; no separate RoPE vector)</text>

              {/* QUERY PROJECTION & UNPROJECTION TO MULTI-HEAD CONTEXT */}
              <path d="M 460 170 L 520 170" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 460 320 L 520 320" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* DOT PRODUCT & MULTI-HEAD ATTENTION SCORE NODE */}
              <g>
                <rect x="520" y="145" width="170" height="200" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#38BDF8" strokeWidth="2" />
                <text x="605" y="170" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">Multi-head Softmax dot product & aggregation</text>

                <text x="605" y="195" fill="#A78BFA" fontSize="11" textAnchor="middle">NoPE content score: q_t^C · K_j^Cᵀ</text>
                <text x="605" y="215" fill="#F59E0B" fontSize="11" textAnchor="middle">Position / recency: supplied by KDA branch</text>
                
                <line x1="535" y1="230" x2="675" y2="230" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                
                <text x="605" y="250" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">Aggregated context o_t</text>
                <text x="605" y="268" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">o_t ∈ ℝ^[96 heads × d_h]</text>
                <text x="605" y="285" fill="#94A3B8" fontSize="10" textAnchor="middle">96 heads; per-head width not disclosed</text>
                <text x="605" y="302" fill="#94A3B8" fontSize="10" textAnchor="middle">Total attention width is not disclosed</text>
              <text x="605" y="325" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">⚡ Matrix absorption avoids materializing K/V</text>
              <circle cx="500" cy="130" r="12" fill="#F59E0B" stroke="#FFF" strokeWidth="1" />
              <text x="500" y="135" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">2</text>
              </g>

              {/* OUTPUT UP-PROJECTION W_o */}
              <path d="M 690 245 L 730 245" stroke="#38BDF8" strokeWidth="2" fill="none" markerEnd="url(#arrow-master-green)" />
              <g>
                <rect x="730" y="220" width="130" height="50" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
                <text x="795" y="242" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">Output projection W_o</text>
              <text x="795" y="260" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Δy ∈ ℝ^7,168</text>
              <circle cx="715" cy="210" r="12" fill="#10B981" stroke="#FFF" strokeWidth="1" />
              <text x="715" y="215" fill="#000" fontSize="13" fontWeight="bold" textAnchor="middle">3</text>
              </g>

              {/* RE-CONVERGENCE UP TO RESIDUAL HIGHWAY */}
              <path d="M 860 245 C 865 245, 865 85, 865 80" stroke="#10B981" strokeWidth="2.5" fill="none" />
              
              {/* SUMMATION NODE */}
              <circle cx="865" cy="65" r="16" fill="#10B981" stroke="#FFF" strokeWidth="2" />
              <text x="865" y="71" fill="#000" fontSize="20" fontWeight="bold" textAnchor="middle">+</text>
              <text x="865" y="35" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">Residual addition</text>

              {/* FINAL OUTPUT NODE (7,168-d) */}
              <line x1="881" y1="65" x2="925" y2="65" stroke="#10B981" strokeWidth="3" />
              <rect x="925" y="40" width="45" height="50" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="2" />
              <text x="947.5" y="64" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">h_l+1</text>
              <text x="947.5" y="80" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">7168d</text>

            </svg>

            {/* Stage Dimension Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', width: '100%' }}>
              
              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #38BDF8' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>1. Main-stream input</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>x_t ∈ ℝ^7,168</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>The residual bypass preserves the main-stream representation.</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #A78BFA' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>2. KV cache representation</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>d_c latent; not disclosed</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>K3 MLA uses NoPE; KDA carries positional / recency information.</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #F59E0B' }}>
                <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.95rem' }}>3. Multi-head context</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>o_t ∈ ℝ^[96 × d_h]</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>K3 confirms 96 heads; head width is not disclosed.</p>
              </div>

              <div style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid #10B981' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>4. Residual output</span>
                <div style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.15rem', marginTop: '4px' }}>h_l+1 ∈ ℝ^7,168</div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>W_o maps the attention output back to the 7,168-d model width.</p>
              </div>

            </div>

          </div>

          </details>

          {/* Theoretical Summary Box */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ color: '#FFF', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Summary: why is the latent width not the model width?
            </h4>
            <ul style={{ color: '#94A3B8', fontSize: '0.98rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
              <li><b>Different roles</b>: the 7,168-d residual stream is the model’s full representation space; the latent KV state is a compact per-token record used by attention.</li>
              <li><b>Compression is not tokenizer design</b>: the latent is created inside MLA after the model representation already exists. It is not the embedding or vocabulary space.</li>
              <li><b>Do not invent a ratio</b>: K3 confirms latent KV compression and NoPE MLA, but the report does not disclose enough dimensions here to calculate a single exact cache-reduction factor.</li>
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
                <text x="200" y="142" fill="#94A3B8" fontSize="11" textAnchor="middle">[d_c × 7,168; d_c undisclosed]</text>
              </g>

              {/* Bottom: NoPE boundary; retained as an interactive teaching node */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('rope')}>
                <path d="M 140 200 L 260 220 L 260 260 L 140 280 Z" fill="rgba(245, 158, 11, 0.15)" stroke={selectedStage === 'rope' ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)'} strokeWidth="2" />
                <text x="200" y="245" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">NoPE boundary</text>
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
                <text x="410" y="95" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">d_c not disclosed</text>
              </g>

              {/* No independent RoPE key is cached in K3 MLA */}
              <g style={{ cursor: 'pointer' }} onClick={() => setSelectedStage('rope')}>
                <rect x="330" y="225" width="80" height="30" rx="4" fill="url(#gradient-rope)" stroke={selectedStage === 'rope' ? '#FFF' : 'none'} strokeWidth="2" />
                <text x="370" y="245" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">KDA position / recency</text>
                <text x="370" y="215" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">not MLA KV cache</text>
              </g>

              {/* HIGHLIGHT BOX AROUND KV CACHE (576 dims total) */}
              <rect x="315" y="70" width="190" height="210" rx="8" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="6,4" />
              <text x="410" y="295" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">💾 KV cache stores the latent</text>
              <text x="410" y="312" fill="#10B981" fontSize="11" textAnchor="middle">(d_c is not disclosed; no +64 positional vector)</text>

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
                <text x="690" y="175" fill="#94A3B8" fontSize="11" textAnchor="middle">[96 heads × d_h; d_h not disclosed]</text>
                <text x="690" y="190" fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle">❌ A logical expansion is not the cached representation.</text>
              </g>
            </svg>

            {/* Bottom Interactive Stage Explanation Card */}
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.3)', width: '100%' }}>
              {selectedStage === 'input' && (
                <div>
                  <h4 style={{ color: '#38BDF8', margin: '0 0 6px 0', fontSize: '1.1rem' }}>1. Model representation x_t (7,168-d)</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    This is the current token’s representation in the Transformer stream. K3 confirms 96 attention heads, while the per-head width is not disclosed. The MHA comparison is a logical tensor view, not a claim about a published head width.
                  </p>
                </div>
              )}
              {selectedStage === 'compress' && (
                <div>
                  <h4 style={{ color: '#A78BFA', margin: '0 0 6px 0', fontSize: '1.1rem' }}>2. Latent projection W_c (7,168-d ➔ d_c)</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    The projection W_c maps the 7,168-d representation to one compact <b>KV latent c_t^KV</b>. It is shared by the Key and Value reconstruction paths and stored once per token. K3 does not disclose d_c, so the slider is an explicit teaching parameter rather than a published 512-d claim or fixed savings percentage.
                  </p>
                </div>
              )}
              {selectedStage === 'rope' && (
                <div>
                  <h4 style={{ color: '#F59E0B', margin: '0 0 6px 0', fontSize: '1.1rem' }}>3. NoPE: no independent MLA positional branch</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    K3 MLA is documented as NoPE: it does not create or cache a separate RoPE positional Key. In the hybrid architecture, KDA provides position-sensitive recurrent mixing and recency information, while MLA supplies global content interaction. The lower lane remains as a teaching checkpoint for this boundary.
                  </p>
                </div>
              )}
              {selectedStage === 'unproject' && (
                <div>
                  <h4 style={{ color: '#EF4444', margin: '0 0 6px 0', fontSize: '1.1rem' }}>4. Logical multi-head view vs. MLA matrix absorption</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.5' }}>
                    In the logical formulation, the latent can be mapped to per-head Key/Value representations. K3 confirms 96 heads but does not disclose d_c or d_h. <b>Matrix absorption reorders fixed projections so inference need not materialize the full cached Key/Value tensors.</b> This is an implementation principle, not a claim that every internal tensor is absent during training.
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

      {/* TAB 3: NOPE / KDA POSITION ROLE GRAPHIC */}
      {activeTab === 'ropeDecouple' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧩 NoPE design and the KDA position / recency role
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, lineHeight: '1.5' }}>
              K3 MLA is documented as NoPE: it does not add an independent positional encoding path to the MLA KV cache. The diagram keeps the two conceptual roles visible: <b>MLA supplies global content interaction</b>, while <b>KDA supplies position-sensitive recurrent mixing and recency</b>.
            </p>
          </div>

          {/* SVG Visual Graphic of RoPE Dual Path */}
          <div style={{ background: '#070913', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="0 0 880 280" width="100%" height="280" style={{ overflow: 'visible' }}>
              
              {/* Input Node */}
              <rect x="20" y="110" width="100" height="60" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
              <text x="70" y="145" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">Input x_t</text>

              {/* Split Paths */}
              <path d="M 120 130 C 180 130, 180 60, 240 60" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 120 150 C 180 150, 180 220, 240 220" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* PATH A: SEMANTIC PATH */}
              <g>
                <rect x="240" y="30" width="340" height="60" rx="8" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="2" />
                <text x="410" y="55" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">Path A: MLA content latent c_t^KV (d_c undisclosed)</text>
                <text x="410" y="75" fill="#94A3B8" fontSize="11" textAnchor="middle">NoPE · fixed projection structure · supports matrix absorption</text>
              </g>

              {/* PATH B: KDA POSITION / RECENCY ROLE */}
              <g>
                <rect x="240" y="190" width="340" height="60" rx="8" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
                <text x="410" y="215" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">Path B: KDA recurrent state</text>
                <text x="410" y="235" fill="#94A3B8" fontSize="11" textAnchor="middle">position-sensitive mixing and recency · not an MLA KV cache vector</text>
              </g>

              {/* CONVERGENCE AT ATTENTION SCORE */}
              <path d="M 580 60 C 660 60, 660 130, 720 130" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <path d="M 580 220 C 660 220, 660 150, 720 140" stroke="#F59E0B" strokeWidth="2" fill="none" />

              {/* Final Score Node */}
              <rect x="720" y="110" width="140" height="60" rx="8" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" />
              <text x="790" y="135" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">Attention Score</text>
              <text x="790" y="155" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">MLA content score + KDA context</text>

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
              Compare the illustrative cache scaling. K3 is trained for a 1M-token context, while the exact cache bytes depend on undisclosed widths, dtype, batch size, and implementation.
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
                  <span style={{ color: '#94A3B8' }}>Latent width d_c (teaching):</span>
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
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>Per-layer KV cache comparison (illustrative GB)</span>

              {/* Bar 1: Standard MHA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#EF4444', fontWeight: 'bold' }}>❌ MHA baseline (96 heads; teaching head width)</span>
                  <span style={{ color: '#EF4444', fontWeight: 'bold', fontFamily: 'monospace' }}>{mhaMemoryGB} GB</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Bar 2: Kimi K3 MLA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>✅ Kimi K3 Gated MLA (latent width is teaching-only)</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{mlaMemoryGB} GB</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, (parseFloat(mlaMemoryGB) / parseFloat(mhaMemoryGB)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)', borderRadius: '4px', transition: 'width 0.3s ease-in-out' }} />
                </div>
              </div>

              <div style={{ marginTop: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', fontWeight: 'bold', fontSize: '1.05rem', textAlign: 'center' }}>
                ℹ️ Illustrative ratio: {savingsRatio}×. It is not a published K3 memory factor; actual bytes depend on undisclosed dimensions and runtime choices.
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
