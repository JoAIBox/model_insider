import React, { useState } from 'react';

export const AttnResOperatorDeepDive: React.FC = () => {
  const [currentLayer, setCurrentLayer] = useState<number>(72);
  const [queryFocus, setQueryFocus] = useState<number>(50);
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'formula' | 'decayCurve' | 'gradientHighway'>('formula');
  const activeBlock = Math.min(7, Math.floor((currentLayer - 1) / 12));
  const attnResBlocks = Array.from({ length: 8 }, (_, index) => ({
    index,
    start: index * 12 + 1,
    end: Math.min(93, (index + 1) * 12),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div className="operator-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔗</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              AttnRes (Cross-Layer Attention Residuals): operator principles and derivation
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Dynamic Layer-to-Layer Signal Retrieval
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Kimi K3’s AttnRes extends sequential residual flow with dynamic cross-layer retrieval: layer l can selectively read hidden states from earlier layers k &lt; l.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('formula')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'formula' ? '#38BDF8' : 'transparent',
              color: activeTab === 'formula' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. Cross-layer retrieval formula and attention matrix
          </button>
          <button
            onClick={() => setActiveTab('decayCurve')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'decayCurve' ? '#A78BFA' : 'transparent',
              color: activeTab === 'decayCurve' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. Illustrative layer-depth weight curve
          </button>
          <button
            onClick={() => setActiveTab('gradientHighway')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'gradientHighway' ? '#10B981' : 'transparent',
              color: activeTab === 'gradientHighway' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. 93-layer gradient highway
          </button>
        </div>
      </div>

      {/* TAB 1: CROSS LAYER RETRIEVAL FORMULA */}
      {activeTab === 'formula' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
              📐 AttnRes cross-layer attention retrieval formula
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. The current layer uses a learned pseudo-query for content-dependent scores.</div>
              <div style={{ color: '#38BDF8' }}>α_l = Softmax( q_l · RMSNorm(K_l)ᵀ )</div>
              <div>// 2. Full AttnRes aggregates the embedding and transformed outputs from earlier layers.</div>
              <div style={{ color: '#10B981' }}>r_l = Σ_(i=0)^(l-1) α_(i→l) · v_i</div>
              <div>// 3. If an outer Transformer residual wrapper is shown, it is a separate operation.</div>
              <div style={{ color: '#A78BFA' }}>x_(l+1) = x_l + F_l(r_l)</div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#FCD34D', lineHeight: '1.45' }}>
              Conceptual Full AttnRes formula; Kimi K3 implements Block AttnRes with 8 block-level groups (the final block is partial), rather than retrieving every earlier layer independently.
            </div>
            <small style={{ color: '#94A3B8', lineHeight: '1.45' }}>
              Here v₀ = h₁ is the token embedding and vᵢ = fᵢ(hᵢ) for earlier layer outputs. The aggregation r_l is shown separately from any outer residual wrapper.
            </small>
            <button className="btn" onClick={() => setShowCode((open) => !open)} style={{ alignSelf: 'flex-start' }}>
              {showCode ? '▼ Hide PyTorch-style minimal sketch' : '▶ Show PyTorch-style minimal sketch'}
            </button>
            {showCode && (
              <div style={{ background: '#02040a', borderRadius: '6px', padding: '12px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <pre style={{ margin: 0, color: '#CBD5E1', fontSize: '0.82rem', lineHeight: '1.5', overflowX: 'auto' }}>{`# Schematic teaching code; K3 weights and dimensions are not published.
keys = torch.nn.functional.normalize(keys, dim=-1)
scores = query @ keys.transpose(-1, -2)
weights = torch.softmax(scores, dim=-1)
retrieved = weights @ values
output = current_layer + retrieved
`}</pre>
                <small style={{ display: 'block', marginTop: '8px', color: '#64748B' }}>
                  This demonstrates the retrieval mechanism, not a drop-in implementation of K3’s full block-level AttnRes.
                </small>
              </div>
            )}
          </div>

          {/* SVG Diagram for AttnRes Flow */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 820 260" width="100%" height="260" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-attnres" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Historical Layers */}
              <rect x="20" y="40" width="100" height="50" rx="6" fill="#0F172A" stroke="#94A3B8" />
              <text x="70" y="70" fill="#94A3B8" fontSize="13" textAnchor="middle">Layer 0 (Input)</text>

              <rect x="160" y="40" width="100" height="50" rx="6" fill="#0F172A" stroke="#94A3B8" />
              <text x="210" y="70" fill="#94A3B8" fontSize="13" textAnchor="middle">Layer 12 (KDA)</text>

              <rect x="300" y="40" width="100" height="50" rx="6" fill="#0F172A" stroke="#94A3B8" />
              <text x="350" y="70" fill="#94A3B8" fontSize="13" textAnchor="middle">Layer 48 (MLA)</text>

              {/* Cross Layer Arc Lines into Layer 72 */}
              <path d="M 70 90 C 70 180, 500 180, 540 140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,3" fill="none" markerEnd="url(#arrow-attnres)" />
              <path d="M 210 90 C 210 160, 500 160, 540 140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,3" fill="none" markerEnd="url(#arrow-attnres)" />
              <path d="M 350 90 C 350 140, 500 140, 540 140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,3" fill="none" markerEnd="url(#arrow-attnres)" />

              {/* Current Layer 72 Target */}
              <rect x="540" y="80" width="240" height="80" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="660" y="115" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">Layer 72 (target)</text>
              <text x="660" y="138" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">dynamic retrieval weights α_72,k</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: DEPTH SIGNAL DECAY CURVE */}
      {activeTab === 'decayCurve' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📈 Illustrative cross-layer retrieval weight curve
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              Drag the target-layer slider to inspect a teaching illustration. Real K3 weights depend on the pseudo-query, RMSNorm keys, and current input; they are not fixed distance decay.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8', fontSize: '1rem' }}>Target layer l:</span>
            <input
              type="range"
              min="1"
              max="93"
              value={currentLayer}
              onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
              style={{ width: '240px' }}
            />
            <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
              Layer {currentLayer}
            </span>
          </div>

          <div style={{ background: '#0F172A', padding: '14px 16px', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.28)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#A78BFA', fontWeight: 'bold' }}>Teaching pseudo-query focus:</span>
            <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>shallow syntax</span>
            <input
              type="range"
              min="0"
              max="100"
              value={queryFocus}
              onChange={(e) => setQueryFocus(Number(e.target.value))}
              style={{ width: '240px', accentColor: '#A78BFA' }}
              aria-label="AttnRes teaching pseudo-query focus"
            />
            <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>deep logic</span>
            <strong style={{ color: '#E9D5FF', fontFamily: 'monospace' }}>{queryFocus}% deep</strong>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '1rem', color: '#FFF', fontWeight: 'bold' }}>
              Retrieval-weight distribution over earlier layers k ∈ [0, {currentLayer - 1}]:
            </span>
            <span style={{ color: '#C4B5FD', fontSize: '0.9rem' }}>
              The slider moves the illustrative retrieval peak toward Layer {Math.round((queryFocus / 100) * (currentLayer - 1))}; this is not a measured K3 attention curve.
            </span>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '4px', background: '#0B0F19', padding: '10px', borderRadius: '6px' }}>
              {Array.from({ length: 24 }).map((_, idx) => {
                const layerIdx = Math.floor((idx / 23) * (currentLayer - 1));
                const preferredLayer = (queryFocus / 100) * (currentLayer - 1);
                const sigma = Math.max(2, currentLayer * 0.18);
                const distance = layerIdx - preferredLayer;
                const weight = Math.exp(-(distance * distance) / (2 * sigma * sigma)) * 0.95 + 0.04;
                const heightPercent = Math.min(100, Math.max(10, weight * 100));
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      background: Math.abs(layerIdx - preferredLayer) < sigma * 0.55 ? '#A78BFA' : '#38BDF8',
                      height: `${heightPercent}%`,
                      borderRadius: '2px 2px 0 0'
                    }}
                    title={`Layer ${layerIdx}: α = ${weight.toFixed(3)}`}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'monospace' }}>
              <span>Layer 0 (Input)</span>
              <span>Layer {Math.floor(currentLayer / 2)}</span>
              <span>Layer {currentLayer - 1} (previous layer)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BLOCK ATTNRES GRADIENT HIGHWAY */}
      {activeTab === 'gradientHighway' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🛣️ Block AttnRes: a gradient highway across 93 layers
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              Kimi K3 groups the 93 backbone layers into 8 block representations. The first seven blocks contain 12 layers; the final block is partial with layers 85–93. The current block forms a sequential partial sum, then includes it with earlier block summaries in one weighted source set.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Current layer:
              <input type="range" min="1" max="93" value={currentLayer} onChange={(e) => setCurrentLayer(parseInt(e.target.value))} style={{ width: '240px', accentColor: '#10B981' }} />
            </label>
            <strong style={{ color: '#10B981', fontFamily: 'monospace' }}>Layer {currentLayer} · Block {activeBlock + 1}</strong>
          </div>

          <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
            <svg viewBox="0 0 960 250" width="100%" height="250" style={{ minWidth: '820px' }} role="img" aria-label="Eight Block AttnRes groups across the 93-layer backbone">
              <defs>
                <marker id="arrow-gradient-highway" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#10B981" />
                </marker>
                <marker id="arrow-gradient-retrieval" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#A78BFA" />
                </marker>
              </defs>
              <text x="20" y="22" fill="#94A3B8" fontSize="12">Embedding + block summaries + current partial sum → one block-level aggregation</text>
              <line x1="24" y1="112" x2="930" y2="112" stroke="#10B981" strokeWidth="2" opacity="0.45" markerEnd="url(#arrow-gradient-highway)" />
              {attnResBlocks.slice(0, activeBlock).map((block) => {
                const x = 20 + block.index * 115;
                const targetX = 20 + activeBlock * 115 + 48;
                return <path key={`retrieval-${block.index}`} d={`M ${x + 48} 78 C ${x + 48} 42, ${targetX} 42, ${targetX} 78`} fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-gradient-retrieval)" />;
              })}
              {attnResBlocks.map((block) => {
                const x = 20 + block.index * 115;
                const selected = block.index === activeBlock;
                return (
                  <g key={block.index}>
                    <rect x={x} y="78" width="96" height="70" rx="8" fill={selected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)'} stroke={selected ? '#10B981' : '#334155'} strokeWidth={selected ? 2 : 1} />
                    <text x={x + 48} y="101" fill={selected ? '#10B981' : '#E2E8F0'} fontSize="13" fontWeight="bold" textAnchor="middle">Block {block.index + 1}</text>
                    <text x={x + 48} y="121" fill="#94A3B8" fontSize="11" textAnchor="middle">L{block.start}–L{block.end}</text>
                    {block.index === 7 && <text x={x + 48} y="138" fill="#F59E0B" fontSize="10" textAnchor="middle">partial block</text>}
                  </g>
                );
              })}
              <text x="24" y="184" fill="#10B981" fontSize="12">Green: sequential intra-block partial-sum path</text>
              <text x="24" y="207" fill="#A78BFA" fontSize="12">Purple: source retrieval into the same block-level aggregation</text>
              <text x="24" y="230" fill="#94A3B8" fontSize="12">Selected target: Layer {currentLayer} in Block {activeBlock + 1}</text>
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <b style={{ color: '#10B981' }}>1. Intra-block partial sum</b>
              <div style={{ color: '#94A3B8', marginTop: '5px', lineHeight: '1.45' }}>Within the current block, sequential sublayer outputs form the current partial sum uₗ.</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <b style={{ color: '#A78BFA' }}>2. Retrieval source set</b>
              <div style={{ color: '#94A3B8', marginTop: '5px', lineHeight: '1.45' }}>The source set contains b₀, earlier block summaries, and uₗ when the current layer has a partial sum.</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <b style={{ color: '#38BDF8' }}>3. One final aggregation</b>
              <div style={{ color: '#94A3B8', marginTop: '5px', lineHeight: '1.45' }}>Block AttnRes computes rₗ = Σ αₗ,ₖvₖ. The diagram’s purple paths are inputs to this sum, not a second result added afterward.</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#E2E8F0', lineHeight: '1.5' }}>
              <b style={{ color: '#10B981' }}>Intra-block sequential flow</b>
              <div style={{ color: '#94A3B8', marginTop: '6px' }}>Each current block accumulates a partial sum sequentially before that partial sum participates in the block-level source set.</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.3)', color: '#E2E8F0', lineHeight: '1.5' }}>
              <b style={{ color: '#A78BFA' }}>Block AttnRes aggregation</b>
              <div style={{ color: '#94A3B8', marginTop: '6px' }}>Learned content-dependent weights combine earlier block summaries and the current partial sum into one representation.</div>
            </div>
          </div>
          <small style={{ color: '#64748B', lineHeight: '1.45' }}>
            Teaching visualization: exact K3 pseudo-query weights and hidden-state values are not published. The block grouping follows the K3 technical report; the arrows illustrate the information-flow principle.
          </small>
        </div>
      )}

    </div>
  );
};
