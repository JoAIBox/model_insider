import React, { useRef, useState } from 'react';
import { LearningGuide } from './LearningGuide';
import { MacroArchitectureFlow } from './MacroArchitectureFlow';
import { ConceptGlossary } from './ConceptGlossary';
import { TokenInputAnimation } from './TokenInputAnimation';
import { AttentionOperatorAnimation } from './AttentionOperatorAnimation';
import { ExpertPathAnimation } from './ExpertPathAnimation';
import { AttnResAnimation } from './AttnResAnimation';
import { MathRenderer } from './MathRenderer';

interface LayerItem {
  id: number;
  type: 'KDA' | 'MLA';
  hasMoe: boolean;
  blockId: number;
  isInputStage?: boolean;
}

interface DashboardProps {
  onNavigateTab?: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  // Generate 93 layers (Layer 1 to 93)
  const layers: LayerItem[] = Array.from({ length: 93 }, (_, idx) => {
    const layerNum = idx + 1;
    const isMla = layerNum % 4 === 0 || layerNum === 93;
    const blockId = Math.min(24, Math.floor((layerNum - 1) / 4) + 1);
    // Only layer 1 is dense (No MoE), other 92 layers all have MoE
    const hasMoe = layerNum > 1;
    return {
      id: layerNum,
      type: isMla ? 'MLA' : 'KDA',
      hasMoe,
      blockId
    };
  });

  // Interactive states
  const [selectedLayer, setSelectedLayer] = useState<LayerItem | null>(layers[71]); // Default to layer 72 (first MLA layer after layer 70, representative)
  const [hoveredLayer, setHoveredLayer] = useState<LayerItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'kda' | 'mla' | 'moe'>('all');
  const [showAllArcs, setShowAllArcs] = useState<boolean>(false);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedMicroNode, setSelectedMicroNode] = useState<'input' | 'attention' | 'path' | 'residual'>('input');
  const topologyViewportRef = useRef<HTMLDivElement>(null);
  
  // Vision tower selection
  const [showVisionDetail, setShowVisionDetail] = useState<boolean>(false);
  
  // Timeline selection
  const [activeTimelineStage, setActiveTimelineStage] = useState<number>(3); // Default 1M

  // Timeline data
  const timelineStages = [
    {
      title: "8K stage",
      tokens: "8K",
      tokenCount: 8192,
      phase: "Pre-training",
      desc: "The report states that pre-training begins with an 8K-token context.",
      whatChanges: "Training sequences are capped at 8K tokens for this curriculum stage. The model weights and 93-layer architecture do not change; the sequence-length limit and data packing do.",
      why: "A shorter window makes early training substantially cheaper and lets the model first learn local syntax, semantics, and basic multimodal sequence processing.",
      memory: "Reference scale: 1× sequence-dependent cache / activation length.",
    },
    {
      title: "64K stage",
      tokens: "64K",
      tokenCount: 65536,
      phase: "Pre-training",
      desc: "The context is extended to 64K tokens during pre-training.",
      whatChanges: "The maximum training sequence is increased from 8K to 64K. This is an 8× longer sequence; exact batch size, number of steps, and parallelism settings are not disclosed.",
      why: "The model is exposed to longer dependencies while remaining in the main pre-training regime, so long-range retrieval is learned before the final long-context refinement.",
      memory: "Illustrative sequence-dependent scale: 8× the 8K reference for an O(N) cache term; KDA's recurrent-state term remains O(1) in N.",
    },
    {
      title: "256K stage",
      tokens: "256K",
      tokenCount: 262144,
      phase: "Cooldown",
      desc: "Cooldown extends the context to 256K tokens.",
      whatChanges: "The cooldown data is packed and trained with sequences up to 256K tokens. The report does not disclose the exact batch-size schedule, sampling mixture, or number of cooldown steps.",
      why: "Cooldown concentrates compute on adapting the already-trained model to much longer sequences and reducing the distribution shift between ordinary training lengths and long-context use.",
      memory: "Illustrative sequence-dependent scale: 32× the 8K reference for an O(N) cache term; KDA recurrent state is still fixed-shape, while MLA latent KV entries still grow with tokens.",
    },
    {
      title: "1M stage",
      tokens: "1M",
      tokenCount: 1000000,
      phase: "Cooldown",
      desc: "Cooldown then extends the context to 1M tokens.",
      whatChanges: "The maximum curriculum length reaches 1M tokens. This describes the training context curriculum, not a claim that every request must contain 1M tokens or that all runtime memory is constant.",
      why: "The final stage teaches the model to preserve and retrieve information across the target ultra-long range, subject to the serving implementation and available memory.",
      memory: "Illustrative sequence-dependent scale: about 122.1× the 8K reference for an O(N) cache term (1,000,000 ÷ 8,192); KDA state remains O(1) in sequence length, but MLA latent KV cache and other runtime buffers grow with N.",
    }
  ];

  const microNodeDetails = selectedLayer?.isInputStage
    ? {
        input: {
          title: 'Multimodal Input & Alignment (Layer 0)',
          text: `In the initial input stage of the model, information from different modalities is extracted and mapped to the same vector space:
[Included Operators]:
1. Token Embedding Lookup: Maps discrete text token indices to dense hidden dimension vectors.
2. MoonViT-V2 Projection: Image frames are processed by a 27-layer ViT to extract features, downsampled by a 2x2 Pixel Shuffle, and finally mapped by an MLP Projector to the backbone dimension.
3. Multimodal Concatenation: Text and visual tokens are spliced chronologically along the sequence length dimension.
[Mathematical Computation]:
* Text Input: x_t_text = Embedding(w_t) ∈ ℝ^d
* Visual Input: x_t_vis = W_proj · PixelShuffle(ViT(v_t)) ∈ ℝ^d
* Spliced Sequence: X = [x_1, x_2, ..., x_T] ∈ ℝ^(T × d)  (where d = 7,168)`,
        },
        attention: {
          title: 'Not applicable',
          text: 'This is the Layer 0 multimodal input alignment stage. Backbone recurrent state / KDA / MLA attention operators are only executed in Layer 1 ~ Layer 93.'
        },
        path: {
          title: 'Not applicable',
          text: 'This is the Layer 0 multimodal input alignment stage. MoE routing and expert feed-forward operators are only executed in Layer 1 ~ Layer 93.'
        },
        residual: {
          title: 'Not applicable',
          text: 'This is the Layer 0 multimodal input alignment stage. Cross-layer Attention Residuals retrieval and standard residual skips are only executed in Layer 1 ~ Layer 93.'
        }
      }[selectedMicroNode]
    : {
        input: {
          title: `Layer Input h_${selectedLayer?.id} — d = 7,168`,
          text: `The hidden state input vector entering layer ${selectedLayer?.id} is represented as h_l ∈ ℝ^d (d = 7,168).
This hidden state vector is forwarded directly from the previous layer or via the sequential residual stream. It already deeply contains the fused multimodal sequence features. Each subsequent Backbone layer receives this unified sequence as a whole and does not perform any new multimodal concatenation during its forward pass.`,
        },
        attention: {
          title: `${selectedLayer?.type ?? 'Hybrid'} attention`,
          text: selectedLayer?.type === 'KDA'
            ? `[Kimi Delta Attention (KDA) Operators & Computation]:
KDA performs sequential mixing along the time dimension using a Delta rule with channel-wise decay:
1. Input Normalization: x'_t = RMSNorm(x_t)
2. Linear Projection & Local Smoothing:
   q_t^h, k_t^h = L2Norm(Swish(ShortConv(W_q/k · x'_t))) ∈ ℝ^(d_k)
   v_t^h = Swish(ShortConv(W_v · x'_t)) ∈ ℝ^(d_v)
3. Decay Factor & Write Strength:
   Write gate: β_t^h = Sigmoid(W_β · x'_t) ∈ (0, 1)
   Forget gate log-space projection: z_t^h = W_α↑ · W_α↓ · x'_t + b_α^h ∈ ℝ^(d_k)
   Forget decay rate: α_t^h = Diag(1 - Sigmoid(z_t^h))
4. Recurrent State Update:
   S_t^h = (I - β_t^h · k_t^h · (k_t^h)ᵀ · α_t^h) · S_(t-1)^h + β_t^h · k_t^h · (v_t^h)ᵀ  (Matrix size: d_k × d_v)
5. Recurrent Output & Gated Projection:
   Raw output: õ_t^h = (S_t^h)ᵀ · q_t^h
   Concatenated head output: õ_t = Concat(õ_t^1, ..., õ_t^H) with Head-wise RMSNorm applied
   Output gating: y_t = W_o · [Sigmoid(W_g · x'_t) ⊙ RMSNorm(õ_t)]`
            : `[Gated MLA Operators & Computation]:
MLA reduces the KV Cache memory footprint via low-rank compression, introducing a data-dependent output gating:
1. Input Normalization: x'_t = RMSNorm(x_t)
2. Low-rank Compression:
   c_t = W_c · x'_t ∈ ℝ^(d_c)  (Compresses current state to low-rank representation for KV-Cache)
3. Key-Value Reconstruction (Up-projections):
   Key recovery: K_t_content = W_uk · c_t
   Value recovery: V_t = W_uv · c_t
4. Query Projection & Attention Score (NoPE):
   Query vector: Q_t = W_q · x'_t
   Attention weighting: õ_t = Softmax( Q_t · (K_t_content)ᵀ / √d_h ) · V_t
5. Full-rank Gated Output:
   y_t = W_o · [Sigmoid(W_g · x_t) ⊙ õ_t]  (Gating matrix W_g filters channels dynamically)`,
        },
        path: {
          title: selectedLayer?.hasMoe ? 'MoE expert routing' : 'Dense feed-forward path',
          text: selectedLayer?.hasMoe
            ? `[Stable LatentMoE Operators & Computation]:
Mixes features along the channel dimension. Each token is distributed to 2 shared experts and 16 sparse experts routed dynamically from a pool of 896:
1. Shared Experts Forward: y_shared = E_1_shared(x_t) + E_2_shared(x_t) (Operates on the full width d=7,168)
2. Latent Space Down-projection: z_t = W_↓ · x_t ∈ ℝ^l (Reduces features from d=7,168 to communication space l=3,584)
3. Quantile Balancing Router (QB Routing):
   s_t = Sigmoid(W_r · x_t); dispatch uses Top-16(s_t + b_t)
   Mixture weights use the selected raw scores only: p_i = s_i / Σ_(j∈T_16) s_j
4. Expert Forward with SiTU-GLU Activation:
   E_i(z_t) = W_up · ( β_1 · tanh(z'_t / β_1) ⊙ Sigmoid(z'_t) ) · W_gate, where z'_t = RMSNorm(W_in · z_t)
   (SiTU-GLU bounds activation scales within |f(x)| ≤ β_1*β_2=100 to prevent activation explosions at 2.8T parameters)
5. Aggregation: u_t = ∑_(i ∈ T_16) p_i · E_i(z_t)
6. Merging & Up-projection:
   y_t = y_shared + W_↑ · RMSNorm(u_t) (RMSNorm before W_↑ reduces sensitivity to routing weight scales, improving stability)`
            : `[Dense Feed-forward Path (Layer 1) Operators & Computation]:
Layer 1 is a dense layer with no sparse MoE routing, using a classic SwiGLU feed-forward network:
1. Input Normalization: x'_t = RMSNorm(x_t)
2. Dual-branch Projection: y_gate = W_gate · x'_t, y_up = W_up · x'_t
3. Gated Activation: y_act = Swish(y_gate) ⊙ y_up
4. Down-projection: y_t = W_down · y_act`,
        },
        residual: {
          title: 'Residual + Attention Residuals (AttnRes)',
          text: `[Residual & AttnRes Operators & Computation]:
Directly reads representations from historical block boundaries using an attention mechanism to prevent signal dilution in deep networks:
1. Block Summation:
   b_n = ∑_(j ∈ B_n) f_j(h_j) (Summation of outputs within block n of length 12; b_0 = h_1 is the input embedding)
2. Query Projection: q_l = W_l · h_l ∈ ℝ^d
3. Normalization & Attention Scoring:
   Retrieval score: α_(i→l) = Softmax( q_lᵀ · RMSNorm(b_i) / √d )
4. Weighted Aggregation:
   h_l_read = ∑_(i=0)^(n-1) α_(i→l) · b_i (+ α_(cur→l) · b_n^(local-1) if within the current block)
5. Separate residual wrapper (if present):
   r_l = h_l_read
   x_(l+1) = x_l + F_l(r_l) (Keeps AttnRes aggregation separate from the outer residual path)`,
        },
      }[selectedMicroNode];

  const getLayerX = (layerId: number) => {
    const blockIdx = Math.min(24, Math.floor((layerId - 1) / 4) + 1) - 1;
    const idxInBlock = (layerId - 1) % 4;
    return 145 + blockIdx * 58 + 9 + idxInBlock * 11;
  };

  const renderAttnResArcs = () => {
    const activeLayer = hoveredLayer || selectedLayer;
    const arcs: React.ReactNode[] = [];
    const boundaries = [12, 24, 36, 48, 60, 72, 84];

    const addArc = (
      key: string,
      srcX: number,
      srcY: number,
      dstX: number,
      dstY: number,
      stroke: string,
      isActive: boolean
    ) => {
      const midX = (srcX + dstX) / 2;
      const distance = Math.abs(dstX - srcX);
      const curveHeight = Math.min(210, 150 + distance * 0.1);
      
      arcs.push(
        <path
          key={key}
          d={`M ${srcX} ${srcY} Q ${midX} ${curveHeight}, ${dstX} ${dstY}`}
          fill="none"
          stroke={stroke}
          strokeWidth={isActive ? "1.2" : "0.5"}
          opacity={isActive ? "0.85" : "0.05"}
          className={isActive ? "attnres-pulse-line" : ""}
          style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
        />
      );
    };

    const addPartialSum = (
      key: string,
      srcX: number,
      dstX: number,
      isActive: boolean
    ) => {
      arcs.push(
        <path
          key={key}
          d={`M ${srcX} 141 L ${dstX} 141`}
          fill="none"
          stroke="#38BDF8"
          strokeWidth={isActive ? "2" : "0.8"}
          strokeLinecap="round"
          opacity={isActive ? "0.75" : "0.06"}
          style={{ transition: 'opacity 0.2s' }}
        />
      );
    };

    // 1. Render all connections as static background paths if showAllArcs is enabled
    if (showAllArcs) {
      layers.forEach((layer) => {
        const targetX = getLayerX(layer.id);
        const targetY = 140;

        // Background embedding arc
        addArc(`bg-emb-${layer.id}`, 130, 140, targetX, targetY, "#10B981", false);

        // Background boundary arcs
        boundaries.forEach((bLayerId) => {
          if (bLayerId < layer.id) {
            addArc(`bg-arc-${layer.id}-${bLayerId}`, getLayerX(bLayerId), 140, targetX, targetY, "#818CF8", false);
          }
        });

        // Background partial sum
        const currentBlockIdx = Math.floor((layer.id - 1) / 12);
        const firstLayerOfBlock = currentBlockIdx * 12 + 1;
        if (firstLayerOfBlock < layer.id) {
          addPartialSum(`bg-partial-${layer.id}`, getLayerX(firstLayerOfBlock), targetX, false);
        }
      });
    }

    // 2. Render active layer's connections with full opacity and animation on top
    if (activeLayer) {
      const targetX = getLayerX(activeLayer.id);
      const targetY = 140;

      // Active embedding arc
      addArc("active-emb", 130, 140, targetX, targetY, "#10B981", true);

      // Active boundary arcs
      boundaries.forEach((bLayerId) => {
        if (bLayerId < activeLayer.id) {
          addArc(`active-arc-${bLayerId}`, getLayerX(bLayerId), 140, targetX, targetY, "#818CF8", true);
        }
      });

      // Active partial sum
      const currentBlockIdx = Math.floor((activeLayer.id - 1) / 12);
      const firstLayerOfBlock = currentBlockIdx * 12 + 1;
      if (firstLayerOfBlock < activeLayer.id) {
        addPartialSum("active-partial", getLayerX(firstLayerOfBlock), targetX, true);
      }
    }

    return arcs;
  };

  return (
    <div className="tab-panel active">
      <header>
        <div className="badge">Chapter 1 — System Overview</div>
        <h1>Kimi K3 Architecture Explorer</h1>
        <p className="subtitle">A 2.78-trillion-parameter Mixture-of-Experts (MoE) model</p>
      </header>

      <LearningGuide />

      <MacroArchitectureFlow onNavigateTab={onNavigateTab} />

      <ConceptGlossary />

      {/* Stats Cards */}
      <div className="stats-container" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-value">2.78T</div>
          <div className="stat-label">Total parameters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">104.2B</div>
          <div className="stat-label">Activated parameters per token</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">1,000,000</div>
          <div className="stat-label">Native context window</div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-value">896</div>
          <div className="stat-label">Routed experts</div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Architecture Panel */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span>🛠️ Interactive topology: 93-layer hybrid attention and MoE</span>
            
            {/* Control Panel Filters */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button 
                className={`btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
                style={{ padding: '4px 10px', fontSize: '1.02rem' }}
              >
                Show all
              </button>
              <button 
                className={`btn ${filterType === 'kda' ? 'active' : ''}`}
                onClick={() => setFilterType('kda')}
                style={{ padding: '4px 10px', fontSize: '1.02rem' }}
              >
                KDA only
              </button>
              <button 
                className={`btn ${filterType === 'mla' ? 'active' : ''}`}
                onClick={() => setFilterType('mla')}
                style={{ padding: '4px 10px', fontSize: '1.02rem' }}
              >
                MLA only
              </button>
              <button 
                className={`btn ${filterType === 'moe' ? 'active' : ''}`}
                onClick={() => setFilterType('moe')}
                style={{ padding: '4px 10px', fontSize: '1.02rem' }}
              >
                MoE only
              </button>

              <button 
                className={`btn ${showAllArcs ? 'active' : ''}`}
                onClick={() => setShowAllArcs(!showAllArcs)}
                style={{ padding: '4px 10px', fontSize: '1.02rem', borderColor: showAllArcs ? '#10B981' : '', color: showAllArcs ? '#10B981' : '' }}
              >
                {showAllArcs ? 'Hide connections' : 'Show connections'}
              </button>
            </div>
          </div>

          <p style={{ fontSize: '1.08rem', color: '#94A3B8', marginBottom: '10px' }}>
            The topology shows the 27-layer MoonViT vision encoder and 93-layer backbone (69 KDA + 24 MLA). The backbone has 23 complete “3 KDA + 1 MLA” cycles (92 layers) plus one final MLA layer. Select any layer to inspect its data path.
          </p>
          <small style={{ display: 'block', color: '#64748B', marginBottom: '6px' }}>
            Use the visible arrows, scrollbar, or swipe/drag horizontally to explore the full topology.
          </small>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '6px' }}>
            <button
              type="button"
              className="btn"
              aria-label="Scroll topology left"
              onClick={() => topologyViewportRef.current?.scrollBy({ left: -420, behavior: 'smooth' })}
              style={{ alignSelf: 'center', padding: '8px 10px', flex: '0 0 auto' }}
            >
              ←
            </button>
            <div
              ref={topologyViewportRef}
              tabIndex={0}
              aria-label="Scrollable 93-layer architecture topology"
              style={{ overflowX: 'auto', overflowY: 'hidden', minWidth: 0, flex: 1, scrollbarWidth: 'auto' }}
            >
            <svg width="100%" height="230" viewBox="0 0 1600 230" preserveAspectRatio="xMinYMin meet" style={{ minWidth: '900px' }}>
                {/* Defs for arrow markers */}
                <defs>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#00F2FE" />
                  </marker>
                  <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#A78BFA" />
                  </marker>
                  <style>{`
                    @keyframes attnres-pulse {
                      to {
                        stroke-dashoffset: -20;
                      }
                    }
                    .attnres-pulse-line {
                      stroke-dasharray: 6 4;
                      animation: attnres-pulse 1.2s linear infinite;
                    }
                  `}</style>
                </defs>

                {/* Standard sequential residual skip connection baseline (L1 -> L93) */}
                <path 
                  d={layers.map((layer, idx) => `${idx === 0 ? 'M' : 'L'} ${getLayerX(layer.id)} 140`).join(' ')} 
                  fill="none" 
                  stroke="rgba(255, 176, 0, 0.4)" 
                  strokeWidth="1.2" 
                  strokeDasharray="3 3"
                />

                {/* Dynamic Block-level Attention Residual (AttnRes) curves */}
                {renderAttnResArcs()}

                {/* 23 full 3-KDA + 1-MLA cycles, followed by the final MLA layer */}
                {Array.from({ length: 24 }).map((_, blockIdx) => {
                  const blockId = blockIdx + 1;
                  const startX = 145 + blockIdx * 58;
                  const width = 53;
                  const isHighlighted = selectedBlockId === blockId || (hoveredLayer && hoveredLayer.blockId === blockId) || (selectedLayer && selectedLayer.blockId === blockId);
                  
                  return (
                    <g
                      key={blockId}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${blockId === 24 ? 'final MLA block' : `Cycle ${blockId}`}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const representativeLayer = layers.find((layer) => layer.blockId === blockId);
                        if (representativeLayer) setSelectedLayer(representativeLayer);
                        setSelectedBlockId(blockId);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          const representativeLayer = layers.find((layer) => layer.blockId === blockId);
                          if (representativeLayer) setSelectedLayer(representativeLayer);
                          setSelectedBlockId(blockId);
                        }
                      }}
                    >
                      <rect 
                        x={startX} 
                        y="65" 
                        width={width} 
                        height="85" 
                        rx="2" 
                        fill={isHighlighted ? 'rgba(0, 242, 254, 0.04)' : 'transparent'} 
                        stroke={isHighlighted ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.02)'} 
                        strokeWidth="1"
                      />
                      <text 
                        x={startX + width / 2} 
                        y="168" 
                        fill={isHighlighted ? '#00F2FE' : '#94A3B8'} 
                        fontSize="12" 
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {blockId === 24 ? 'Final MLA' : `Cycle ${blockId}`}
                      </text>
                    </g>
                  );
                })}

                {/* Left side: MoonViT vision tower (27 layers) */}
                <g 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => setShowVisionDetail(!showVisionDetail)}
                >
                  <rect 
                    x="10" 
                    y="40" 
                    width="95" 
                    height="125" 
                    rx="6" 
                    fill="rgba(167, 139, 250, 0.06)" 
                    stroke={showVisionDetail ? '#A78BFA' : 'rgba(167, 139, 250, 0.3)'} 
                    strokeWidth="1.5"
                  />
                  <text x="57" y="66" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">MoonViT vision</text>
                  <text x="57" y="86" fill="#94A3B8" fontSize="12" textAnchor="middle">27-layer ViT</text>
                  <text x="57" y="106" fill="#64748B" fontSize="17" textAnchor="middle">401M params</text>
                  <text x="57" y="132" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">[ Details ]</text>
                  
                  {/* Connect arrow to main input */}
                  <path d="M 105 107 L 122 107" stroke="#A78BFA" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-purple)" />
                </g>

                <g 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedLayer({
                      id: 0,
                      type: 'KDA',
                      hasMoe: false,
                      blockId: 0,
                      isInputStage: true
                    });
                    setSelectedMicroNode('input');
                  }}
                >
                  <rect 
                    x="126" 
                    y="75" 
                    width="8" 
                    height="65" 
                    rx="1"
                    fill="#38BDF8"
                    stroke={selectedLayer?.isInputStage ? '#FFFFFF' : 'none'}
                    strokeWidth="1"
                  />
                  <text 
                    x="130" 
                    y="168" 
                    fill={selectedLayer?.isInputStage ? '#38BDF8' : '#94A3B8'} 
                    fontSize="12" 
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Input (L0)
                  </text>
                </g>

                {/* 5. Data Flow Arrow line showing direction */}
                <path 
                  d="M 130 75 L 130 58 L 1545 58 L 1545 102 L 1560 102" 
                  fill="none" 
                  stroke="rgba(0, 242, 254, 0.4)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4,2" 
                  markerEnd="url(#arrow-blue)" 
                />
                <text x="845" y="50" fill="rgba(0, 242, 254, 0.9)" fontSize="13" fontWeight="bold" textAnchor="middle">Main backbone data flow</text>

                {/* Output node */}
                <circle cx="1565" cy="102" r="5" fill="#10B981" />
                <text x="1565" y="125" fill="#94A3B8" fontSize="12" fontWeight="bold" textAnchor="middle">Output Token</text>

                {/* Draw 93 Layers inside 24 blocks */}
                {layers.map((layer) => {
                  const blockIdx = layer.blockId - 1;
                  const idxInBlock = (layer.id - 1) % 4; // 0 to 3 layers per block
                  const layerWidth = 8;
                  const layerHeight = 65;
                  
                  // Calculate coordinates
                  const blockStartX = 145 + blockIdx * 58;
                  const x = blockStartX + 5 + idxInBlock * 11;
                  const y = 75;

                  // Apply filter styling
                  let opacity = 1.0;
                  if (filterType === 'kda' && layer.type !== 'KDA') opacity = 0.15;
                  if (filterType === 'mla' && layer.type !== 'MLA') opacity = 0.15;
                  if (filterType === 'moe' && !layer.hasMoe) opacity = 0.15;

                  const isSelected = selectedLayer && selectedLayer.id === layer.id;
                  const isHovered = hoveredLayer && hoveredLayer.id === layer.id;

                  // Green-cyan for KDA + MoE, Magenta for MLA + MoE. Cyan for KDA (No MoE) which is layer 1.
                  let color = layer.type === 'KDA' ? '#00F2FE' : '#C084FC';
                  if (layer.hasMoe) {
                    color = layer.type === 'KDA' ? '#10B981' : '#E100FF';
                  }

                  return (
                    <g 
                      key={layer.id}
                      style={{ cursor: 'pointer', opacity }}
                      onClick={() => setSelectedLayer(layer)}
                      onMouseEnter={() => {
                        setHoveredLayer(layer);
                        setSelectedBlockId(layer.blockId);
                      }}
                      onMouseLeave={() => {
                        setHoveredLayer(null);
                        setSelectedBlockId(null);
                      }}
                    >
                      {/* Interactive rect stick representing layer */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={layerWidth} 
                        height={layerHeight} 
                        rx="0.5"
                        fill={color}
                        stroke={isSelected ? '#FFFFFF' : isHovered ? 'rgba(255,255,255,0.7)' : 'none'}
                        strokeWidth="1"
                      />
                      
                      {/* Dot indicating MoE expert router present */}
                      {layer.hasMoe && (
                        <circle cx={x + layerWidth / 2} cy={y + 5} r="1.2" fill="#FFFF00" />
                      )}
                    </g>
                  );
                })}

                {/* Legends */}
                <g transform="translate(145, 215)" fontSize="13" fontWeight="bold" fill="#94A3B8">
                  <rect x="0" y="0" width="10" height="10" rx="1" fill="#00F2FE" />
                  <text x="16" y="9">KDA layer (L1 dense)</text>

                  <rect x="180" y="0" width="10" height="10" rx="1" fill="#10B981" />
                  <text x="196" y="9">KDA + MoE</text>

                  <rect x="310" y="0" width="10" height="10" rx="1" fill="#E100FF" />
                  <text x="326" y="9">MLA + MoE</text>

                  <circle cx="440" cy="5" r="3" fill="#FFFF00" />
                  <text x="450" y="9">MoE router</text>

                  <line x1="560" y1="5" x2="590" y2="5" stroke="rgba(255, 176, 0, 0.6)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="598" y="9">Sequential Residual</text>

                  <path d="M 760 5 Q 775 14, 790 5" fill="none" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="798" y="9">AttnRes Retrieval (Hover layer to animate)</text>
                </g>
              </svg>
            </div>
            <button
              type="button"
              className="btn"
              aria-label="Scroll topology right"
              onClick={() => topologyViewportRef.current?.scrollBy({ left: 420, behavior: 'smooth' })}
              style={{ alignSelf: 'center', padding: '8px 10px', flex: '0 0 auto' }}
            >
              →
            </button>
          </div>

          {/* Model Params summary box */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.02rem', color: '#64748B', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
            <span>Total: 2.78T | activated per token: 104.2B | depth: 93 backbone + 27 vision layers</span>
            {hoveredLayer && (
              <span style={{ color: '#00F2FE', fontWeight: 'bold' }}>
                Hovered: layer {hoveredLayer.id} ({hoveredLayer.type}) | {hoveredLayer.blockId === 24 ? 'Final MLA' : `Cycle ${hoveredLayer.blockId}`} | MoE: {hoveredLayer.hasMoe ? 'yes' : 'no'}
              </span>
            )}
          </div>
        </div>

        {/* Detailed Modal/Info Panels based on clicks - Vertical Stack for Full Width */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Inner Layer Breakdown Panel */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#38BDF8' }}>
                🔍 Operator view: {selectedLayer?.isInputStage ? 'Multimodal input alignment (Layer 0)' : `layer ${selectedLayer?.id}`}
              </span>
              <span className="badge" style={{ background: selectedLayer?.isInputStage ? '#38BDF8' : selectedLayer?.type === 'KDA' ? '#00F2FE' : '#C084FC', color: '#000' }}>
                {selectedLayer?.isInputStage ? 'Input Stage' : selectedLayer?.type}
              </span>
            </div>

            <p style={{ fontSize: '1.15rem', color: '#94A3B8', marginBottom: '15px' }}>
              Select a vertical layer marker above to inspect the published attention, MoE, and shared-expert data paths for that layer.
            </p>

            {/* Inner representation chart */}
            <div style={{ background: '#02040a', borderRadius: '6px', padding: '15px', border: '1px solid rgba(255,255,255,0.04)' }}>
              {selectedLayer ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* 7. SVG-based dynamic micro-flowchart */}
                  {selectedLayer?.isInputStage ? (
                    <svg width="100%" height="95" viewBox="0 0 700 95" style={{ background: '#070913', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '4px' }}>
                      <defs>
                        <marker id="flow-arrow-l0" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                        </marker>
                      </defs>
                      <line x1="135" y1="49" x2="165" y2="49" stroke="#475569" strokeWidth="1.5" markerEnd="url(#flow-arrow-l0)" />
                      <line x1="315" y1="49" x2="345" y2="49" stroke="#475569" strokeWidth="1.5" markerEnd="url(#flow-arrow-l0)" />
                      <line x1="505" y1="49" x2="535" y2="49" stroke="#475569" strokeWidth="1.5" markerEnd="url(#flow-arrow-l0)" />

                      <rect x="15" y="26" width="120" height="46" rx="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                      <text x="75" y="53" fill="#38BDF8" fontSize="15" textAnchor="middle" fontWeight="bold">Text / Vision</text>
                      
                      <rect x="165" y="26" width="150" height="46" rx="5" fill="#0F172A" stroke="#A78BFA" strokeWidth="1.5" />
                      <text x="240" y="53" fill="#FFF" fontSize="15" textAnchor="middle" fontWeight="bold">Embedding & ViT</text>

                      <rect x="345" y="26" width="160" height="46" rx="5" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                      <text x="425" y="53" fill="#10B981" fontSize="15" textAnchor="middle" fontWeight="bold">Multimodal Concat</text>

                      <rect x="535" y="26" width="140" height="46" rx="5" fill="#1e293b" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                      <text x="605" y="53" fill="#FFF" fontSize="15" textAnchor="middle" fontWeight="bold">Unified x_t ∈ ℝ^d</text>
                    </svg>
                  ) : (
                    <svg width="100%" height="110" viewBox="0 0 760 110" style={{ background: '#070913', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '4px' }}>
                      <defs>
                        <marker id="flow-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
                        </marker>
                      </defs>

                      <line x1="125" y1="62" x2="155" y2="62" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                      <line x1="295" y1="62" x2="325" y2="62" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                      <line x1="490" y1="62" x2="520" y2="62" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                      <line x1="665" y1="62" x2="685" y2="62" stroke="#64748B" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                      {/* Comparison-only reference path: intentionally ends before the K3 aggregation node. */}
                      <path d="M 67 36 C 67 12, 500 12, 500 28" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4,3" />
                      <text x="285" y="16" fill="#94A3B8" fontSize="12" fontWeight="bold" textAnchor="middle">comparison only: sequential residual skip</text>

                      {/* Node 1: Layer Input */}
                      <rect x="10" y="36" width="115" height="52" rx="5" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                      <text x="67" y="58" fill="#94A3B8" fontSize="14" textAnchor="middle" fontWeight="bold">Layer input</text>
                      <text x="67" y="76" fill="#64748B" fontSize="13" textAnchor="middle">h_l ∈ ℝ^7168</text>

                      {/* Node 2: Attention */}
                      <rect 
                        x="155" 
                        y="36" 
                        width="140" 
                        height="52" 
                        rx="5" 
                        fill={selectedLayer?.type === 'KDA' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(192, 132, 252, 0.08)'} 
                        stroke={selectedLayer?.type === 'KDA' ? '#00F2FE' : '#C084FC'} 
                        strokeWidth="1.5" 
                      />
                      <text x="225" y="58" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">{selectedLayer?.type} attention</text>
                      <text x="225" y="76" fill={selectedLayer?.type === 'KDA' ? '#00F2FE' : '#C084FC'} fontSize="13" textAnchor="middle">
                        {selectedLayer?.type === 'KDA' ? 'recurrent state' : 'latent KV cache'}
                      </text>

                      {/* Node 3: MoE */}
                      <rect 
                        x="325" 
                        y="36" 
                        width="165" 
                        height="52" 
                        rx="5" 
                        fill={selectedLayer?.hasMoe ? 'rgba(16, 185, 129, 0.08)' : 'rgba(148, 163, 184, 0.05)'} 
                        stroke={selectedLayer?.hasMoe ? '#10B981' : 'rgba(148, 163, 184, 0.3)'} 
                        strokeWidth="1.5" 
                      />
                      <text x="407" y="58" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">
                        {selectedLayer?.hasMoe ? 'MoE expert routing' : 'Dense path'}
                      </text>
                      <text x="407" y="76" fill={selectedLayer?.hasMoe ? '#10B981' : '#94A3B8'} fontSize="12" textAnchor="middle">
                        {selectedLayer?.hasMoe ? '16 / 896 experts + 2 shared' : 'dense feed-forward path'}
                      </text>

                      {/* Node 4: AttnRes */}
                      <rect x="520" y="36" width="145" height="52" rx="5" fill="rgba(16, 185, 129, 0.08)" stroke="#10B981" strokeWidth="1.5" />
                      <text x="592" y="58" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Block AttnRes aggregation</text>
                      <text x="592" y="76" fill="#10B981" fontSize="12" textAnchor="middle">partial sum + block sources</text>

                      {/* Node 5: Output */}
                      <rect x="685" y="36" width="70" height="52" rx="5" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                      <text x="720" y="58" fill="#94A3B8" fontSize="14" textAnchor="middle" fontWeight="bold">Output</text>
                      <text x="720" y="76" fill="#64748B" fontSize="13" textAnchor="middle">h_l+1</text>

                      {/* Click Targets for Micro-nodes */}
                      <rect x="10" y="36" width="115" height="52" fill="transparent" style={{ cursor: 'pointer' }} onClick={() => setSelectedMicroNode('input')} onDoubleClick={() => onNavigateTab?.('multimodal')} />
                      <rect x="155" y="36" width="140" height="52" fill="transparent" style={{ cursor: 'pointer' }} onClick={() => setSelectedMicroNode('attention')} onDoubleClick={() => onNavigateTab?.(selectedLayer?.type === 'KDA' ? 'kda' : 'op_mla')} />
                      <rect x="325" y="36" width="165" height="52" fill="transparent" style={{ cursor: 'pointer' }} onClick={() => setSelectedMicroNode('path')} onDoubleClick={() => onNavigateTab?.('moe')} />
                      <rect x="520" y="36" width="145" height="52" fill="transparent" style={{ cursor: 'pointer' }} onClick={() => setSelectedMicroNode('residual')} onDoubleClick={() => onNavigateTab?.('attnres')} />
                    </svg>
                  )}

                  <div className="micro-detail-card">
                    <span className="eyebrow">Selected operator</span>
                    <h4>{microNodeDetails?.title}</h4>
                    <p>{microNodeDetails?.text}</p>
                  </div>

                  {selectedMicroNode === 'input' && (
                    selectedLayer?.isInputStage ? (
                      <TokenInputAnimation mode="multimodal" onNavigateTab={onNavigateTab} />
                    ) : (
                      <TokenInputAnimation mode="layer" layerId={selectedLayer?.id} onNavigateTab={onNavigateTab} />
                    )
                  )}
                  {selectedMicroNode === 'attention' && selectedLayer && !selectedLayer.isInputStage && (
                    <AttentionOperatorAnimation type={selectedLayer.type} />
                  )}
                  {selectedMicroNode === 'path' && selectedLayer && !selectedLayer.isInputStage && (
                    <ExpertPathAnimation />
                  )}
                  {selectedMicroNode === 'residual' && selectedLayer && !selectedLayer.isInputStage && (
                    <AttnResAnimation />
                  )}
                  
                  {selectedLayer?.isInputStage ? (
                    <>
                      {/* Layer 0 Step 1: Text Embedding */}
                      <div style={{ border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '6px', padding: '14px', background: 'rgba(56, 189, 248, 0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(56, 189, 248, 0.1)', paddingBottom: '8px' }}>
                          <span>1. Text & Vision Multimodal Alignment (Layer 0)</span>
                          <span style={{ color: '#38BDF8', fontSize: '0.88rem' }}>💡 Tip: double-click a module to open its detailed derivation.</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.08rem', color: '#E2E8F0', marginTop: '4px', lineHeight: '1.5' }}>
                            BPE Tokenizer → Vocab Indexing → Embedding Matrix Lookup (W_emb)
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          <MathRenderer 
                            color="#38BDF8"
                            formula={`// Text Embedding Lookup
x_t_text = Embedding(w_t)`}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: '6px 12px', marginTop: '6px', fontSize: '1.02rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Dimension</div>
                            <div>w_t</div><div>Discrete text token ID at sequence index t</div><div style={{ fontFamily: 'monospace' }}>Scalar [1]</div>
                            <div>x_t_text</div><div>Mapped dense text feature vector</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                          </div>
                        </div>
                      </div>

                      {/* Layer 0 Step 2: MoonViT-V2 Vision Encoder */}
                      <div style={{ border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '6px', padding: '14px', background: 'rgba(167, 139, 250, 0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(167, 139, 250, 0.1)', paddingBottom: '8px' }}>
                          <span>2. MoonViT-V2 Vision Encoder</span>
                          <span style={{ color: '#A78BFA' }}>Vision Encoding Stage</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.08rem', color: '#E2E8F0', marginTop: '4px', lineHeight: '1.5' }}>
                            Image Patch Segmentation → ViT Attention Encoder (27 layers)
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          <MathRenderer 
                            color="#A78BFA"
                            formula={`// Visual feature extraction
v_t_feat = ViT(v_t)`}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: '6px 12px', marginTop: '6px', fontSize: '1.02rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Dimension</div>
                            <div>v_t</div><div>Input image frame pixel grid</div><div style={{ fontFamily: 'monospace' }}>[H_img * W_img * C]</div>
                            <div>v_t_feat</div><div>Visual token sequence output by ViT</div><div style={{ fontFamily: 'monospace' }}>[Patches * d_vit]</div>
                          </div>
                        </div>
                      </div>

                      {/* Layer 0 Step 3: Space Downsampling & Projection */}
                      <div style={{ border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '6px', padding: '14px', background: 'rgba(167, 139, 250, 0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(167, 139, 250, 0.1)', paddingBottom: '8px' }}>
                          <span>3. Space Downsampling & Projection</span>
                          <span style={{ color: '#A78BFA' }}>Vision Alignment Stage</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.08rem', color: '#E2E8F0', marginTop: '4px', lineHeight: '1.5' }}>
                            2x2 Pixel Shuffle Space Downsampler → Linear Projection W_proj
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          <MathRenderer 
                            color="#A78BFA"
                            formula={`// Visual feature alignment & projection
x_t_vis = W_proj * PixelShuffle(v_t_feat)`}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: '6px 12px', marginTop: '6px', fontSize: '1.02rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Dimension</div>
                            <div>W_proj</div><div>Projection weight matrix for vision alignment</div><div style={{ fontFamily: 'monospace' }}>[7,168 * 2,048]</div>
                            <div>x_t_vis</div><div>Continuous visual feature vector mapped to LLM dimension</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                          </div>
                        </div>
                      </div>

                      {/* Layer 0 Step 4: Multimodal Concat */}
                      <div style={{ border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', padding: '14px', background: 'rgba(16, 185, 129, 0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '8px' }}>
                          <span>4. Multimodal Sequence Concatenation</span>
                          <span style={{ color: '#10B981' }}>Sequence Interleaving Stage</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.08rem', color: '#E2E8F0', marginTop: '4px', lineHeight: '1.5' }}>
                            Sequence Concatenation (Splicing along the sequence length dimension)
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          <MathRenderer 
                            color="#10B981"
                            formula={`// Interleaved Sequence Concatenation
X = [X_prefix, X_vision, X_suffix]`}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: '6px 12px', marginTop: '6px', fontSize: '1.02rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Dimension</div>
                            <div>X_prefix</div><div>Text feature embedding matrix before the image</div><div style={{ fontFamily: 'monospace' }}>[L_prefix * 7,168]</div>
                            <div>X_vision</div><div>Continuous vision feature matrix from ViT & projection</div><div style={{ fontFamily: 'monospace' }}>[L_vis * 7,168]</div>
                            <div>X_suffix</div><div>Text feature embedding matrix after the image</div><div style={{ fontFamily: 'monospace' }}>[L_suffix * 7,168]</div>
                            <div>X</div><div>Unified sequence input feature stream (T = L_prefix + L_vis + L_suffix)</div><div style={{ fontFamily: 'monospace' }}>[T * 7,168]</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Step 1: Input & Attention Sub-layer */}
                      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '14px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                          <span>1. Attention sub-layer</span>
                          <span style={{ color: selectedLayer.type === 'KDA' ? '#00F2FE' : '#C084FC' }}>
                            {selectedLayer.type === 'KDA' ? 'KDA decay and delta-update gates' : 'Gated MLA (24 layers)'}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.08rem', color: '#E2E8F0', marginTop: '4px', lineHeight: '1.5' }}>
                            {selectedLayer.type === 'KDA'
                              ? 'RMSNorm → Linear projection (W_q/k/v) → ShortConv1D (1D convolution) → Swish → L2Norm → Sigmoid gating (W_β) → Low-rank dual-layer projection (W_α) → Delta recurrent state update → Sigmoid output gating (W_g) → element-wise product ⊙ → Output projection (W_o)'
                              : 'RMSNorm → Low-rank latent compression projection (W_c) → Key-value reconstruction projection (W_uk/uv) → Query projection (W_q) → NoPE global attention Softmax → Sigmoid full-rank gating (W_g) → element-wise product ⊙ → Output projection (W_o)'}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          {selectedLayer.type === 'KDA' ? (
                            <MathRenderer 
                              color="#00F2FE"
                              formula={`// Q, K, V with convolution and L2Norm normalization
   q_t, k_t = L2Norm(Swish(ShortConv(W_q/k * x'_t)))
// Delta recurrent update with channel-wise decay and write strength (S_t size: d_k x d_v)
S_t = (I - β_t * k_t * k_tᵀ) * Diag(α_t) * S_t-1 + β_t * k_t * v_tᵀ
// Gated fusion and final projection
y_t = W_o * (Sigmoid(W_g * x_t) ⊙ RMSNorm(S_tᵀ * q_t))`}
                            />
                          ) : (
                            <MathRenderer 
                              color="#C084FC"
                              formula={`// Low-rank latent compression (d_c dimensional KV Cache)
c_t = W_c * x'_t
// Key-value reconstruction and global attention calculation (NoPE with no absolute position encoding)
K_t = W_uk * c_t, V_t = W_uv * c_t, Q_t = W_q * x'_t
õ_t = Softmax(Q_t * K_tᵀ / √d_h) * V_t
// Input-dependent full-rank output gating
y_t = W_o * (Sigmoid(W_g * x_t) ⊙ õ_t)`}
                            />
                          )}
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: '6px 12px', marginTop: '6px', fontSize: '1.02rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Dimension</div>
                            
                            {selectedLayer.type === 'KDA' ? (
                              <>
                                <div>x_t / x'_t</div><div>Input token raw feature / RMSNorm normalized feature</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                                <div>q_t / k_t</div><div>Head-wise retrieval query / key vector (with L2Norm)</div><div style={{ fontFamily: 'monospace' }}>[H = 96; d_k not disclosed]</div>
                                <div>v_t</div><div>Head-wise write value vector</div><div style={{ fontFamily: 'monospace' }}>[H = 96; d_v not disclosed]</div>
                                <div>S_t / S_t-1</div><div>Recurrent accumulated memory state matrix</div><div style={{ fontFamily: 'monospace' }}>[96 head states; d_k × d_v not disclosed]</div>
                                <div>α_t / β_t</div><div>Channel-wise retention factor / write strength</div><div style={{ fontFamily: 'monospace' }}>[H = 96; channel width not disclosed]</div>
                                <div>y_t</div><div>KDA attention sub-layer final gated projection output</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                              </>
                            ) : (
                              <>
                                <div>x_t / x'_t</div><div>Input token raw feature / RMSNorm normalized feature</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                                <div>c_t</div><div>Low-rank latent compression intermediate representation (KV Cache node)</div><div style={{ fontFamily: 'monospace' }}>[d_c not disclosed]</div>
                                <div>Q_t</div><div>Query feature for NoPE global attention</div><div style={{ fontFamily: 'monospace' }}>[H = 96; head width not disclosed]</div>
                                <div>K_t / V_t</div><div>Reconstructed content key / value feature</div><div style={{ fontFamily: 'monospace' }}>[H = 96; head width not disclosed]</div>
                                <div>õ_t</div><div>Global NoPE multi-head attention Softmax output</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                                <div>y_t</div><div>Full-rank gating Sigmoid(W_g) combined with output projection W_o</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Mixture-of-Experts sub-layer */}
                      <div style={{ border: selectedLayer.hasMoe ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', padding: '14px', background: selectedLayer.hasMoe ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                          <span>2. Mixture-of-Experts sub-layer</span>
                          <span style={{ color: selectedLayer.hasMoe ? '#10B981' : '#64748B' }}>
                            {selectedLayer.hasMoe ? 'Active (top 16 of 896 routed experts)' : 'Not present (dense layer)'}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.08rem', color: '#E2E8F0', marginTop: '4px', lineHeight: '1.5' }}>
                            {selectedLayer.hasMoe
                              ? 'Quantile Balancing Router (QB routing) → Down-projection (W_↓) → Top-16 experts distribution → SiTU-GLU activation inside experts → Weighted sum of 16 experts'
                              : 'SwiGLU dense feed-forward network: Linear projection (W_gate/W_up) → Swish → element-wise product ⊙ → Down-projection (W_down)'}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          {selectedLayer.hasMoe ? (
                            <MathRenderer 
                              color="#10B981"
                              formula={`// Shared path and latent routed path
y_shared = E_1_shared(x_t) + E_2_shared(x_t)
z_t = W_↓ * x_t   (z_t ∈ R^3584)
s_t = Sigmoid(W_r * x_t); T_16 = Top16(s_t + b_t)
p_i = s_i / Σ_{j∈T_16} s_j   (QB bias is not used in p_i)
u_t = ∑_{i ∈ T_16} p_i * E_i(z_t)
// Routed result returns to backbone width after normalization
y_t = y_shared + W_↑ * RMSNorm(u_t)`}
                            />
                          ) : (
                            <MathRenderer 
                              color="#94A3B8"
                              formula={`// Classic SwiGLU FFN calculation (dense Layer 1 only)
y_gate = W_gate * x'_t, y_up = W_up * x'_t
y_act = Swish(y_gate) ⊙ y_up
y_t = W_down * y_act`}
                            />
                          )}
                        </div>
                        <div>
                          <span style={{ fontSize: '1.08rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: '6px 12px', marginTop: '6px', fontSize: '1.02rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '4px' }}>Dimension</div>
                            
                            {selectedLayer.hasMoe ? (
                              <>
                                <div>x_t</div><div>Residual input entering feed-forward sub-layer</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                                <div>z_t</div><div>Down-projected communication channel hidden vector (reduced space)</div><div style={{ fontFamily: 'monospace' }}>[l = 3,584]</div>
                                <div>p_i</div><div>Softmax routing probability assigned to the i-th expert</div><div style={{ fontFamily: 'monospace' }}>Scalar [0, 1]</div>
                                <div>E_i(z)</div><div>Forward output of the i-th active expert</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                                <div>u_t</div><div>Weighted normalized aggregation of 16 routed experts</div><div style={{ fontFamily: 'monospace' }}>[l = 3,584]</div>
                              </>
                            ) : (
                              <>
                                <div>x_t / x'_t</div><div>Input token raw feature / RMSNorm normalized feature</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                                <div>y_gate / y_up</div><div>Dual-branch gate / up projection in GLU</div><div style={{ fontFamily: 'monospace' }}>[d_ffn = 19,456]</div>
                                <div>y_act</div><div>Gated activation value (element-wise product of Swish and linear projection)</div><div style={{ fontFamily: 'monospace' }}>[d_ffn = 19,456]</div>
                                <div>y_t</div><div>Classic SwiGLU output feature mapped via W_down</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Shared Experts */}
                      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '12px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '1.02rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                          3. Shared experts (2)
                        </div>
                        <div>
                          <span style={{ fontSize: '1.15rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.15rem', color: '#E2E8F0', marginTop: '2px', lineHeight: '1.4' }}>
                            Parallel execution of 2 full-dimension FFN shared experts → RMSNorm normalization on sparse routing aggregation → combine with up-projection (W_↑) → vector sum and accumulation
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.15rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          <MathRenderer 
                            color="#C084FC"
                            formula={`// Shared experts (Ns=2) wide path processing (d = 7168)
y_shared = E_1_shared(x_t) + E_2_shared(x_t)
// Normalize routed aggregation u_t and merge via up-projection
y_ffn = y_shared + W_↑ * RMSNorm(u_t)`}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '1.15rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 140px', gap: '4px 6px', marginTop: '4px', fontSize: '1.15rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '3px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '3px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '3px' }}>Dimension</div>
                            
                            <div>x_t</div><div>Input feature entering shared expert paths</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                            <div>y_shared</div><div>Sum of forward outputs of both shared experts (channel width d)</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                            <div>u_t</div><div>Aggregated features from Step 2 routed experts</div><div style={{ fontFamily: 'monospace' }}>[l = 3,584]</div>
                            <div>y_ffn</div><div>Final FFN output after merging parallel shared and routed paths</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                          </div>
                        </div>
                      </div>

                      {/* Step 4: Block AttnRes aggregation */}
                      <div style={{ border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', padding: '12px', background: 'rgba(16, 185, 129, 0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.02rem', fontWeight: 'bold', color: '#FFF', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '6px' }}>
                          <span>4. Block AttnRes aggregation</span>
                          <span style={{ color: '#10B981' }}>one weighted source set</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.15rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Included Operators ]</span>
                          <p style={{ fontSize: '1.15rem', color: '#E2E8F0', marginTop: '2px', lineHeight: '1.4' }}>
                            Retrieval query linear projection (W_l) → RMSNorm normalization on block representations → dot-product Softmax weights → one aggregation of b₀, earlier block summaries, and the current partial sum. Any outer residual wrapper is a separate operation.
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '1.15rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Mathematical Computation / Formula ]</span>
                          <MathRenderer 
                            color="#10B981"
                            formula={`// 12-layer block architecture: layer l in Block n with local index i (1-indexed)
V = [b_0, b_1, ..., b_n-1]ᵀ           (if i = 1)
V = [b_0, b_1, ..., b_n-1, b_n^(i-1)]ᵀ (if i ≥ 2)
// Retrieval weight calculation and accumulation (K, V generated from Block representations)
α_k = Softmax(q_lᵀ * RMSNorm(k_b) / √d)
                            r_l = ∑ α_k * v_k  // AttnRes aggregation
x_(l+1) = x_l + F_l(r_l)  // separate outer residual wrapper`}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '1.15rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Variable Definitions & Dimensions ]</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 140px', gap: '4px 6px', marginTop: '4px', fontSize: '1.15rem', color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '3px' }}>Variable</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '3px' }}>Physical Meaning</div>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '3px' }}>Dimension</div>
                            
                            <div>h_l</div><div>Main backbone residual input feature entering layer l</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                            <div>b_k</div><div>Boundary node feature of the k-th completed Block (b_0 is input embedding)</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                            <div>q_l</div><div>AttnRes retrieval query vector generated by current layer</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                            <div>α_k</div><div>Retrieval score for the k-th Block representation (Softmax weight)</div><div style={{ fontFamily: 'monospace' }}>Scalar [0, 1]</div>
                            <div>r_l</div><div>Block AttnRes output after the weighted source aggregation</div><div style={{ fontFamily: 'monospace' }}>[d = 7,168]</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ color: '#64748B', fontSize: '1.02rem', textAlign: 'center', padding: '40px 0' }}>
                  Select a layer marker above to inspect its data path.
                </div>
              )}
            </div>
          </div>

          {/* MoonViT Vision Details Panel */}
          <div className="card">
            <div className="card-title" style={{ color: '#A78BFA' }}>
              👁️ MoonViT vision encoder (27 layers): operator view
            </div>
            
            <p style={{ fontSize: '1.15rem', color: '#94A3B8', marginBottom: '15px' }}>
              Select the vision tower to inspect the published visual-input path into the language-model embedding space.
            </p>

            <div style={{ background: '#02040a', borderRadius: '6px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF' }}>1. Patch embedding</span>
                <p style={{ fontSize: '1.08rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
                  Visual inputs are split into patches with the published patch size of 14, then transformed into visual-token features. The report does not specify a fixed example image resolution here.
                </p>
              </div>

              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF' }}>2. 27-layer vision Transformer</span>
                <p style={{ fontSize: '1.08rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
                  This 401M-parameter vision encoder uses factorized spatial and temporal attention, with parameters shared between images and video.
                </p>
              </div>

              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#FFF' }}>3. Projector</span>
                <p style={{ fontSize: '1.08rem', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
                  A lightweight MLP projector maps visual features into the LLM embedding space. Its exact output width and parameter count are not separately disclosed.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Part 1.5 Context Timeline stages */}
        <div className="card">
          <div className="card-title">📅 Progressive context-extension timeline</div>
          <p style={{ fontSize: '1.02rem', color: '#94A3B8', marginBottom: '15px' }}>
            The report describes a four-stage context curriculum: 8K → 64K during pre-training, then 256K → 1M in cooldown. This is a training strategy for gradually teaching longer dependencies; it is not four different model architectures. Select a stage to inspect what changes, why it is useful, and which memory terms grow with sequence length.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {timelineStages.map((stage, idx) => {
              const isActive = idx === activeTimelineStage;
              return (
                <div 
                  key={idx}
                  style={{ 
                    border: isActive ? '1.5px solid #00F2FE' : '1px solid rgba(255,255,255,0.06)',
                    background: isActive ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255,255,255,0.01)',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onClick={() => setActiveTimelineStage(idx)}
                >
                  <div style={{ fontSize: '1.02rem', fontWeight: 'bold', color: isActive ? '#00F2FE' : '#E2E8F0' }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: '1.15rem', color: '#64748B', marginTop: '5px', fontFamily: 'monospace' }}>
                    {stage.tokens} · {stage.phase}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: '#02040a', padding: '14px', borderRadius: '6px', marginTop: '12px', fontSize: '1.02rem', borderLeft: '3px solid #00F2FE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ color: '#FFF', fontWeight: 'bold' }}>{timelineStages[activeTimelineStage].title} · {timelineStages[activeTimelineStage].phase}</span>
              <span style={{ color: '#00F2FE', fontFamily: 'monospace', fontWeight: 'bold' }}>max sequence: {timelineStages[activeTimelineStage].tokens}</span>
            </div>
            <p style={{ color: '#E2E8F0', marginTop: '6px', lineHeight: '1.45' }}>
              {timelineStages[activeTimelineStage].desc}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', marginTop: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.07)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <b style={{ color: '#38BDF8' }}>What is configured?</b>
                <div style={{ color: '#94A3B8', marginTop: '5px', lineHeight: '1.45' }}>{timelineStages[activeTimelineStage].whatChanges}</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <b style={{ color: '#10B981' }}>Why extend gradually?</b>
                <div style={{ color: '#94A3B8', marginTop: '5px', lineHeight: '1.45' }}>{timelineStages[activeTimelineStage].why}</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.07)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <b style={{ color: '#F59E0B' }}>Memory implication</b>
                <div style={{ color: '#94A3B8', marginTop: '5px', lineHeight: '1.45' }}>{timelineStages[activeTimelineStage].memory}</div>
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', background: '#0B0F19', border: '1px solid rgba(56, 189, 248, 0.2)', overflowX: 'auto' }}>
              <div style={{ color: '#38BDF8', fontWeight: 'bold', marginBottom: '7px' }}>KV-cache record count across the curriculum</div>
              <table style={{ width: '100%', minWidth: '560px', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#CBD5E1' }}>
                <thead>
                  <tr style={{ color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign: 'left', padding: '5px' }}>Stage</th>
                    <th style={{ textAlign: 'right', padding: '5px' }}>Tokens N</th>
                    <th style={{ textAlign: 'right', padding: '5px' }}>MLA latent KV records</th>
                    <th style={{ textAlign: 'right', padding: '5px' }}>Relative to 8K</th>
                    <th style={{ textAlign: 'right', padding: '5px' }}>KDA recurrent state</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineStages.map((stage, idx) => {
                    const relativeCacheRecords = stage.tokenCount / timelineStages[0].tokenCount;
                    return (
                      <tr key={stage.title} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx === activeTimelineStage ? 'rgba(56, 189, 248, 0.07)' : 'transparent' }}>
                        <td style={{ padding: '5px', color: idx === activeTimelineStage ? '#38BDF8' : '#E2E8F0', fontWeight: idx === activeTimelineStage ? 'bold' : 'normal' }}>{stage.title}</td>
                        <td style={{ padding: '5px', textAlign: 'right', fontFamily: 'monospace' }}>{stage.tokenCount.toLocaleString()}</td>
                        <td style={{ padding: '5px', textAlign: 'right', fontFamily: 'monospace' }}>N × 24 × d_c</td>
                        <td style={{ padding: '5px', textAlign: 'right', color: '#F59E0B', fontFamily: 'monospace' }}>{relativeCacheRecords.toFixed(1)}×</td>
                        <td style={{ padding: '5px', textAlign: 'right', color: '#10B981', fontFamily: 'monospace' }}>69 × d_k × d_v</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ color: '#94A3B8', marginTop: '8px', lineHeight: '1.45' }}>
                Counting model: for the 24 MLA layers, one logical latent KV record is retained per token, so <span style={{ color: '#E2E8F0', fontFamily: 'monospace' }}>C_MLA(N) = N × 24 × d_c</span>; K3 does not disclose <span style={{ fontFamily: 'monospace' }}>d_c</span>. The 69 KDA layers keep fixed-shape recurrent state matrices, so their state count is approximately <span style={{ color: '#E2E8F0', fontFamily: 'monospace' }}>C_KDA = 69 × d_k × d_v</span>, independent of N. For a conventional full K/V cache, the comparable logical count is <span style={{ color: '#E2E8F0', fontFamily: 'monospace' }}>C_fullKV(N) = N × L × 2 × H × d_h</span>, which also doubles whenever N doubles. These are logical record counts, not byte estimates and not total inference memory.
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', background: '#0B0F19', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span>Illustrative O(N) KV-cache record term</span>
                <span style={{ color: '#F59E0B', fontFamily: 'monospace' }}>{(timelineStages[activeTimelineStage].tokenCount / timelineStages[0].tokenCount).toFixed(1)}× of 8K reference</span>
              </div>
              <div style={{ height: '12px', background: '#1E293B', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.max(4, Math.log2(timelineStages[activeTimelineStage].tokenCount / timelineStages[0].tokenCount + 1) / 7 * 100))}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)', transition: 'width 0.3s ease' }} />
              </div>
              <small style={{ display: 'block', color: '#64748B', marginTop: '6px', lineHeight: '1.45' }}>
                This bar shows only relative sequence scaling, not total GPU memory. Standard per-token KV terms and MLA latent KV cache grow with N; KDA’s recurrent state term stays fixed in shape. Weights do not grow merely because the context window is longer, while training activations and runtime workspace depend on implementation.
              </small>
            </div>

            <div style={{ marginTop: '10px', color: '#64748B', fontSize: '0.9rem', lineHeight: '1.45' }}>
              Evidence boundary: the report publishes the four context stages and their curriculum order, but does not publish exact per-stage batch sizes, step counts, data mixture, or parallelism configuration. Those details should not be inferred from this timeline.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
