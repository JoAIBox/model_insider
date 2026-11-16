import React, { useState, useMemo } from 'react';
import { computeBlockAttnRes } from '../utils/toyMath';

type ToyRepresentationPreset = {
  id: string;
  name: string;
  desc: string;
  embedding: number[];
  blockBases: number[][];
  intraBlockOffset: number[];
};

const TOY_REPRESENTATION_PRESETS: ToyRepresentationPreset[] = [
  {
    id: 'early',
    name: 'Toy Input A (Early Representation Emphasis)',
    desc: 'Synthetic input representation where lower-level feature coordinates carry higher magnitude, causing earlier blocks to align with early-focused pseudo-queries.',
    embedding: [0.92, 0.35, 0.18, 0.12],
    blockBases: [
      [0.85, 0.65, 0.28, 0.15], // Block 1
      [0.68, 0.52, 0.45, 0.25], // Block 2
      [0.55, 0.40, 0.60, 0.38], // Block 3
      [0.42, 0.32, 0.72, 0.50], // Block 4
      [0.35, 0.25, 0.78, 0.62], // Block 5
      [0.28, 0.20, 0.82, 0.70], // Block 6
      [0.22, 0.15, 0.85, 0.75], // Block 7
    ],
    intraBlockOffset: [0.08, 0.05, 0.12, 0.18],
  },
  {
    id: 'mid',
    name: 'Toy Input B (Intermediate Representation Balance)',
    desc: 'Synthetic input representation with distributed feature energy across intermediate blocks 3 and 4.',
    embedding: [0.35, 0.42, 0.78, 0.25],
    blockBases: [
      [0.42, 0.75, 0.65, 0.38], // Block 1
      [0.65, 0.88, 0.52, 0.45], // Block 2
      [0.85, 0.82, 0.40, 0.55], // Block 3
      [0.82, 0.78, 0.45, 0.60], // Block 4
      [0.60, 0.65, 0.55, 0.68], // Block 5
      [0.45, 0.50, 0.65, 0.72], // Block 6
      [0.32, 0.38, 0.70, 0.78], // Block 7
    ],
    intraBlockOffset: [0.10, 0.12, 0.08, 0.15],
  },
  {
    id: 'late',
    name: 'Toy Input C (Late Representation Emphasis)',
    desc: 'Synthetic input representation with dominant magnitude in deeper blocks and the current intra-block partial sum.',
    embedding: [0.15, 0.22, 0.35, 0.90],
    blockBases: [
      [0.22, 0.30, 0.45, 0.82], // Block 1
      [0.32, 0.42, 0.60, 0.85], // Block 2
      [0.45, 0.52, 0.72, 0.88], // Block 3
      [0.58, 0.65, 0.80, 0.90], // Block 4
      [0.70, 0.78, 0.85, 0.92], // Block 5
      [0.82, 0.85, 0.88, 0.95], // Block 6
      [0.88, 0.90, 0.90, 0.98], // Block 7
    ],
    intraBlockOffset: [0.12, 0.15, 0.10, 0.20],
  },
];

export const AttnResOperatorDeepDive: React.FC = () => {
  const [currentLayer, setCurrentLayer] = useState<number>(72);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(0);
  const [learnedQuery, setLearnedQuery] = useState<number[]>([0.5, 0.8, 0.2, 0.4]);
  const [activeTab, setActiveTab] = useState<'formula' | 'decayCurve' | 'gradientHighway'>('formula');
  const [showCode, setShowCode] = useState(false);
  const [hoveredSourceIdx, setHoveredSourceIdx] = useState<number | null>(null);

  const activePreset = TOY_REPRESENTATION_PRESETS[selectedTokenIdx];

  // Block partitioning: 8 blocks total across 93 layers
  // Blocks 1..7 have 12 layers (L1-12, L13-24, ..., L73-84), Block 8 has 9 layers (L85-93)
  const activeBlock = Math.min(7, Math.floor((currentLayer - 1) / 12));
  const sealedBlocksCount = activeBlock;

  // Authoritative visible sources strictly valid at Layer l:
  // 1. b_0: Input Embedding (always present)
  // 2. b_1 .. b_B: Sealed prior block representations (0 sealed at Block 1)
  // 3. u_l: Intra-block partial sum representation at current layer
  const currentSources = useMemo(() => {
    const sources: Array<{
      label: string;
      name: string;
      vec: number[];
      type: 'embedding' | 'sealed' | 'partial';
    }> = [];

    // 1. b_0 (Embedding)
    sources.push({
      label: 'b_0 (Input Embedding)',
      name: 'b_0',
      vec: activePreset.embedding,
      type: 'embedding',
    });

    // 2. Sealed prior blocks b_1 .. b_B
    for (let b = 0; b < sealedBlocksCount; b++) {
      sources.push({
        label: `b_${b + 1} (Block ${b + 1} Summary: L${b * 12 + 1}–L${(b + 1) * 12})`,
        name: `b_${b + 1}`,
        vec: activePreset.blockBases[b],
        type: 'sealed',
      });
    }

    // 3. u_l (Current intra-block partial sum)
    const layerInBlock = ((currentLayer - 1) % 12) + 1;
    const baseForBlock = activeBlock === 0 ? activePreset.embedding : activePreset.blockBases[activeBlock - 1];
    const partialVec = baseForBlock.map(
      (v, i) => v + (layerInBlock / 12) * activePreset.intraBlockOffset[i]
    );
    sources.push({
      label: `u_${currentLayer} (Current Partial: Block ${activeBlock + 1} Layer ${currentLayer})`,
      name: `u_${currentLayer}`,
      vec: partialVec,
      type: 'partial',
    });

    return sources;
  }, [currentLayer, activePreset, sealedBlocksCount, activeBlock]);

  // Unified calculation driving all 3 views
  const liveBlockAttn = useMemo(() => {
    return computeBlockAttnRes(
      currentSources.map((s) => s.vec),
      learnedQuery
    );
  }, [currentSources, learnedQuery]);

  const attnResBlocks = Array.from({ length: 8 }, (_, index) => ({
    index,
    start: index * 12 + 1,
    end: Math.min(93, (index + 1) * 12),
  }));

  const totalSumWeights = liveBlockAttn.weights.reduce((acc, w) => acc + w, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div className="operator-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔗</span>
            <h2 style={{ fontSize: '1.4rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              AttnRes (Cross-Layer Attention Residuals): Operator Principles &amp; Derivation
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Dynamic Layer-to-Layer Signal Retrieval
            </span>
          </div>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Kimi K3’s AttnRes replaces standard sequential addition (<code style={{ color: '#F87171' }}>x + y</code>) with dynamic pseudo-query retrieval: layer <i>l</i> selectively aggregates earlier block summaries and the current intra-block partial sum via learned <code style={{ color: '#38BDF8' }}>w_l</code>.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('formula')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'formula' ? '#38BDF8' : 'transparent',
              color: activeTab === 'formula' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            1. Cross-Layer Retrieval Formula &amp; Table
          </button>
          <button
            onClick={() => setActiveTab('decayCurve')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'decayCurve' ? '#A78BFA' : 'transparent',
              color: activeTab === 'decayCurve' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            2. Source Attention Weight Distribution
          </button>
          <button
            onClick={() => setActiveTab('gradientHighway')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'gradientHighway' ? '#10B981' : 'transparent',
              color: activeTab === 'gradientHighway' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            3. 93-Layer Block Highway Diagram
          </button>
        </div>
      </div>

      {/* GLOBAL CONTROLS BAR: Layer scrubber & Token Presets (Linked to all tabs) */}
      <div style={{ background: '#070913', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>
              Active Target Layer <i>l</i>:
            </span>
            <input
              type="range"
              min="1"
              max="93"
              value={currentLayer}
              onChange={(e) => setCurrentLayer(Number(e.target.value))}
              style={{ width: '220px', accentColor: '#10B981' }}
              aria-label="Active target layer slider"
            />
            <strong style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '1rem' }}>
              Layer {currentLayer} (Block {activeBlock + 1} / 8)
            </strong>
          </div>

          {/* Quick Boundary Jumps */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Boundary jumps:</span>
            <button
              onClick={() => setCurrentLayer(1)}
              style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: currentLayer === 1 ? '#10B981' : '#1E293B', color: currentLayer === 1 ? '#000' : '#CBD5E1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              L1 (Init)
            </button>
            <button
              onClick={() => setCurrentLayer(12)}
              style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: currentLayer === 12 ? '#10B981' : '#1E293B', color: currentLayer === 12 ? '#000' : '#CBD5E1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              L12 (End B1)
            </button>
            <button
              onClick={() => setCurrentLayer(13)}
              style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: currentLayer === 13 ? '#10B981' : '#1E293B', color: currentLayer === 13 ? '#000' : '#CBD5E1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              L13 (Sealed b₁)
            </button>
            <button
              onClick={() => setCurrentLayer(85)}
              style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: currentLayer === 85 ? '#10B981' : '#1E293B', color: currentLayer === 85 ? '#000' : '#CBD5E1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              L85 (Block 8)
            </button>
            <button
              onClick={() => setCurrentLayer(93)}
              style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: currentLayer === 93 ? '#10B981' : '#1E293B', color: currentLayer === 93 ? '#000' : '#CBD5E1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              L93 (Final)
            </button>
          </div>
        </div>

        {/* Input Representation Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.88rem' }}>
              🔤 Choose Toy Input Representation:
            </span>
            <span style={{ color: '#94A3B8', fontSize: '0.78rem', fontStyle: 'italic' }}>
              (Educational Toy Vectors: Illustrates attention weighting; not empirical weights from a trained checkpoint)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TOY_REPRESENTATION_PRESETS.map((preset, idx) => (
              <button
                key={preset.id}
                onClick={() => setSelectedTokenIdx(idx)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '5px',
                  border: selectedTokenIdx === idx ? '1px solid #A78BFA' : '1px solid rgba(255,255,255,0.12)',
                  background: selectedTokenIdx === idx ? 'rgba(167, 139, 250, 0.22)' : 'rgba(255,255,255,0.04)',
                  color: selectedTokenIdx === idx ? '#FFF' : '#94A3B8',
                  fontWeight: selectedTokenIdx === idx ? 'bold' : 'normal',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: FORMULA & NUMERICAL TABLE */}
      {activeTab === 'formula' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
              📐 Block AttnRes Mathematical Equations &amp; Live Step Execution
            </h3>
            
            <div style={{ background: '#0F172A', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '0.95rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>// 1. Learned layer pseudo-query parameter w_l ∈ ℝ^d (d = 7,168):</div>
              <div style={{ color: '#38BDF8' }}>s_k = w_lᵀ · RMSNorm(b_k),   α_k = exp(s_k) / ∑_j exp(s_j)</div>
              <div>// 2. Visible sources at Layer {currentLayer}: V = [b_0, b_1 .. b_{sealedBlocksCount}, u_{currentLayer}] (Total: {currentSources.length} sources)</div>
              <div style={{ color: '#10B981' }}>h_l = ∑_k α_k · b_k   (values b_k remain un-normalized!)</div>
              <div>// 3. Direct module input (no outer residual bypass):</div>
              <div style={{ color: '#A78BFA' }}>y_l = SubLayer(h_l),   partial_sum ← partial_sum + y_l</div>
            </div>

            {/* Pseudo-Query Parameter Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: '#0B0F19', padding: '10px 14px', borderRadius: '6px' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.88rem' }}>
                🎯 Layer Pseudo-Query w_l Parameter:
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'monospace', marginRight: '6px' }}>
                  w_l = [{learnedQuery.map((v) => v.toFixed(2)).join(', ')}]
                </span>
                <button
                  onClick={() => setLearnedQuery([0.5, 0.8, 0.2, 0.4])}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#CBD5E1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Default
                </button>
                <button
                  onClick={() => setLearnedQuery([0.85, 0.60, 0.15, 0.10])}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#CBD5E1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Early-Focus
                </button>
                <button
                  onClick={() => setLearnedQuery([0.15, 0.20, 0.65, 0.90])}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#CBD5E1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Deep-Focus
                </button>
              </div>
            </div>

            {/* Live Inspection Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse', color: '#CBD5E1' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94A3B8' }}>
                    <th style={{ padding: '6px' }}>Visible Source Node</th>
                    <th style={{ padding: '6px' }}>Type</th>
                    <th style={{ padding: '6px' }}>Raw Value b_k (un-normalized)</th>
                    <th style={{ padding: '6px' }}>Key RMSNorm(b_k)</th>
                    <th style={{ padding: '6px' }}>Logit s_k</th>
                    <th style={{ padding: '6px' }}>Weight α_k</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSources.map((src, idx) => (
                    <tr
                      key={src.name}
                      onMouseEnter={() => setHoveredSourceIdx(idx)}
                      onMouseLeave={() => setHoveredSourceIdx(null)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: hoveredSourceIdx === idx ? 'rgba(56, 189, 248, 0.08)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '6px', fontWeight: 'bold', color: src.type === 'embedding' ? '#38BDF8' : src.type === 'sealed' ? '#10B981' : '#A78BFA' }}>
                        {src.label}
                      </td>
                      <td style={{ padding: '6px', fontSize: '0.76rem', color: '#94A3B8' }}>
                        {src.type}
                      </td>
                      <td style={{ padding: '6px', fontFamily: 'monospace' }}>
                        [{src.vec.map((v) => v.toFixed(2)).join(', ')}]
                      </td>
                      <td style={{ padding: '6px', fontFamily: 'monospace', color: '#94A3B8' }}>
                        [{liveBlockAttn.normalizedKeys[idx].map((v) => v.toFixed(2)).join(', ')}]
                      </td>
                      <td style={{ padding: '6px', fontFamily: 'monospace', color: '#F59E0B' }}>
                        {liveBlockAttn.logits[idx].toFixed(3)}
                      </td>
                      <td style={{ padding: '6px', fontFamily: 'monospace', color: '#10B981', fontWeight: 'bold' }}>
                        {(liveBlockAttn.weights[idx] * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Aggregated Output Banner */}
            <div style={{ marginTop: '6px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#E2E8F0', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                <b>Aggregated Representation h_{currentLayer} = ∑ α_k · b_k:</b>
              </span>
              <span style={{ fontFamily: 'monospace', color: '#10B981', fontWeight: 'bold' }}>
                [{liveBlockAttn.output.map((v) => v.toFixed(3)).join(', ')}]
              </span>
            </div>

            <button className="btn" onClick={() => setShowCode((open) => !open)} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              {showCode ? '▼ Hide PyTorch Implementation Sketch' : '▶ Show PyTorch Implementation Sketch'}
            </button>
            {showCode && (
              <div style={{ background: '#02040a', borderRadius: '6px', padding: '12px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <pre style={{ margin: 0, color: '#CBD5E1', fontSize: '0.8rem', lineHeight: '1.45', overflowX: 'auto' }}>{`# Kimi-K3 Block AttnRes PyTorch execution for Layer l:
# w_l: torch.nn.Parameter of shape [d=7168] (learned layer pseudo-query)
# block_keys: Tensor of shape [num_sources, d] (embedding b_0, completed blocks, intra-block partial)

norm_keys = block_keys / torch.sqrt(torch.mean(block_keys ** 2, dim=-1, keepdim=True) + 1e-6)
logits = torch.einsum('d, bd -> b', w_l, norm_keys)  # dot-product attention score
alpha = torch.softmax(logits, dim=-1)

# Single aggregated representation with un-normalized block values
h_l = torch.einsum('b, bd -> d', alpha, block_keys)
# h_l directly inputs to layer l submodules (Attention and MoE)
`}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ATTENTION WEIGHT DISTRIBUTION (BAR CHART) */}
      {activeTab === 'decayCurve' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
                  📊 Softmax Attention Weights α_k across Visible Sources (Layer {currentLayer})
                </h3>
                <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                  Driven strictly by actual computation against visible sources: b₀, sealed blocks, and current partial sum.
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#10B981', fontWeight: 'bold' }}>
                Total Sum: {(totalSumWeights * 100).toFixed(2)}% (Floating-Point Exact)
              </div>
            </div>

            {/* True Normalized Bar Chart */}
            <div style={{ background: '#0B0F19', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '12px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                {currentSources.map((src, idx) => {
                  const weight = liveBlockAttn.weights[idx];
                  const weightPct = weight * 100;
                  const isHovered = hoveredSourceIdx === idx;
                  const barColor = src.type === 'embedding' ? '#38BDF8' : src.type === 'sealed' ? '#10B981' : '#A78BFA';

                  return (
                    <div
                      key={src.name}
                      onMouseEnter={() => setHoveredSourceIdx(idx)}
                      onMouseLeave={() => setHoveredSourceIdx(null)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      {/* Weight Label above bar */}
                      <span style={{ color: isHovered ? '#FFF' : barColor, fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '4px' }}>
                        {weightPct.toFixed(1)}%
                      </span>

                      {/* Bar Fill */}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '48px',
                          height: `${Math.max(2, weightPct)}%`,
                          background: barColor,
                          borderRadius: '4px 4px 0 0',
                          opacity: isHovered ? 1.0 : 0.85,
                          transition: 'height 0.3s ease, opacity 0.2s ease',
                          boxShadow: isHovered ? `0 0 12px ${barColor}` : 'none'
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Source Labels below Bar Chart */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {currentSources.map((src, idx) => (
                  <div
                    key={src.name}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: hoveredSourceIdx === idx ? '#FFF' : '#94A3B8'
                    }}
                  >
                    {src.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation box */}
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.45', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px' }}>
              💡 <b>Why dynamic routing matters:</b> Unlike fixed residual connections that enforce uniform addition (weight = 1.0 for each step), AttnRes assigns content-dependent attention probabilities α_k. Notice how changing the input token representation modifies the logits and softmax distribution, allowing deep layers to bypass intermediate noise and directly retrieve clean embedding or boundary representations.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 93-LAYER & 8-BLOCK HIGHWAY */}
      {activeTab === 'gradientHighway' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#10B981', margin: '0 0 6px 0', fontWeight: 'bold' }}>
              🛣️ Block AttnRes: 93 Layers Grouped into 8 Sealed Blocks
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
              The 93 layers are grouped into 8 block representations (Blocks 1–7 have 12 layers; Block 8 has 9 layers). Inside each block, layers accumulate into a sequential partial sum. When a block boundary is crossed, the completed block is sealed and stored as a static source b_k.
            </p>
          </div>

          {/* SVG Architecture Diagram */}
          <div style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
            <svg viewBox="0 0 960 250" width="100%" height="250" style={{ minWidth: '780px' }} role="img" aria-label="Eight Block AttnRes groups across the 93-layer backbone">
              <defs>
                <marker id="arrow-gradient-highway" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#10B981" />
                </marker>
                <marker id="arrow-gradient-retrieval" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#A78BFA" />
                </marker>
              </defs>
              <text x="20" y="24" fill="#94A3B8" fontSize="12">
                Embedding b₀ + Sealed Blocks (b₁..b_{sealedBlocksCount}) + Current Intra-block Partial Sum u_{currentLayer} → Layer {currentLayer} Input
              </text>
              <line x1="24" y1="112" x2="930" y2="112" stroke="#10B981" strokeWidth="2" opacity="0.45" markerEnd="url(#arrow-gradient-highway)" />
              
              {/* Retrieval Arcs from sealed blocks to active block */}
              {attnResBlocks.slice(0, activeBlock).map((block) => {
                const x = 20 + block.index * 115;
                const targetX = 20 + activeBlock * 115 + 48;
                return (
                  <path
                    key={`retrieval-${block.index}`}
                    d={`M ${x + 48} 78 C ${x + 48} 40, ${targetX} 40, ${targetX} 78`}
                    fill="none"
                    stroke="#A78BFA"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrow-gradient-retrieval)"
                  />
                );
              })}

              {/* Block Cards */}
              {attnResBlocks.map((block) => {
                const x = 20 + block.index * 115;
                const isCurrent = block.index === activeBlock;
                const isSealed = block.index < activeBlock;

                return (
                  <g key={block.index} onClick={() => setCurrentLayer(block.start)} style={{ cursor: 'pointer' }}>
                    <rect
                      x={x}
                      y="78"
                      width="96"
                      height="70"
                      rx="8"
                      fill={isCurrent ? 'rgba(16, 185, 129, 0.22)' : isSealed ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)'}
                      stroke={isCurrent ? '#10B981' : isSealed ? '#38BDF8' : '#334155'}
                      strokeWidth={isCurrent ? 2 : 1}
                    />
                    <text x={x + 48} y="100" fill={isCurrent ? '#10B981' : isSealed ? '#38BDF8' : '#64748B'} fontSize="13" fontWeight="bold" textAnchor="middle">
                      Block {block.index + 1}
                    </text>
                    <text x={x + 48} y="120" fill={isCurrent ? '#FFF' : '#94A3B8'} fontSize="11" textAnchor="middle">
                      L{block.start}–L{block.end}
                    </text>
                    <text x={x + 48} y="137" fill={isCurrent ? '#10B981' : isSealed ? '#38BDF8' : '#475569'} fontSize="9" textAnchor="middle">
                      {isCurrent ? 'Active (Accumulating)' : isSealed ? `Sealed (b_${block.index + 1})` : 'Future (Unvisited)'}
                    </text>
                  </g>
                );
              })}

              <text x="24" y="184" fill="#10B981" fontSize="12">Green: Intra-block sequential partial-sum accumulation (partial_sum ← partial_sum + y_l)</text>
              <text x="24" y="207" fill="#A78BFA" fontSize="12">Purple Arcs: Dynamic Attention Retrieval strictly from completed &amp; sealed blocks</text>
              <text x="24" y="230" fill="#38BDF8" fontSize="12">Active Snapshot: Layer {currentLayer} in Block {activeBlock + 1} ({sealedBlocksCount} prior sealed blocks available)</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
