import React, { useState } from 'react';

type ArchitectureNode = {
  id: string;
  step: string;
  title: string;
  summary: string;
  detail: string;
  parameters: string;
  specification: string;
  dimensions: string;
  connections: string[];
  operators: Array<{ name: string; output: string; explanation: string }>;
  color: string;
};

const nodes: ArchitectureNode[] = [
  {
    id: 'input', step: '01', title: 'Native Vision & Text Input', summary: 'Images and text become a shared stream of 7,168-d tokens.',
    detail: 'Text tokens enter the shared 7,168-d embedding space directly. Images pass through MoonViT-V2 (27 layers, 1024-d, 12 heads), downsampled 4× via 2×2 Pixel Shuffle (to 4096-d), and projected via a 2-layer MLP into the 7,168-d LLM backbone space.',
    parameters: '401M (MoonViT-V2)', specification: '27 layers · 12 vision-attention heads · patch size 14 · 4× downsample',
    dimensions: 'Patch: 14 × 14 · MoonViT 1024-d → Pixel Shuffle 4096-d → LLM 7,168-d',
    connections: ['Image / Text', 'Patchify (14×14)', 'MoonViT-V2 (27L)', 'Pixel Shuffle (4×)', 'MLP Projector', 'Shared tokens (7,168-d)'], color: '#A78BFA',
    operators: [
      { name: 'Patchify', output: '14 × 14 image patches', explanation: 'Splits visual input using the reported patch size of 14 into visual tokens.' },
      { name: 'MoonViT-V2', output: '1024-d visual features', explanation: 'A 27-layer vision Transformer (401M parameters). Spatial and temporal attention are factorized; images and video share parameters.' },
      { name: '2 × 2 Pixel Shuffle', output: '4096-d downsampled tokens', explanation: '2 × 2 spatial downsampling before projection, reducing visual-token count by 4× while expanding channel dimension to 4096.' },
      { name: '2-layer MLP Projector', output: '7,168-d embedding space', explanation: 'Maps 4096-d visual representations into the 7,168-d LLM token sequence space.' },
    ],
  },
  {
    id: 'attention', step: '02', title: '93 Repeating Backbone Layers', summary: 'Interleaved 69 KDA + 24 Gated MLA sequence-mixing sublayers.',
    detail: 'The 93-layer backbone alternates 3 KDA layers with 1 Gated MLA layer across 23 cycles (plus 1 closing MLA layer). Each layer contains two sublayers: Sublayer 1 (KDA/MLA sequence mixing) and Sublayer 2 (MoE/Dense feed-forward). AttnRes provides the residual connection for both sublayers.',
    parameters: '2.78T total parameters · 104.2B active', specification: '93 layers: 69 KDA + 24 MLA · hidden size 7,168 · 96 heads (d_h=128)',
    dimensions: 'Backbone x ∈ ℝ^7,168 · 96 heads × 128-d = 12,288-d · MLA d_c = 512',
    connections: ['AttnRes Read', 'RMSNorm', 'KDA × 3 / MLA × 1', 'Output Gate', 'AttnRes Partial Sum'], color: '#00F2FE',
    operators: [
      { name: 'RMSNorm', output: 'normalized representation', explanation: 'Applies root-mean-square normalization to stabilize hidden scale before sequence projections.' },
      { name: 'KDA sublayer (69 layers)', output: 'recurrent long-sequence state', explanation: 'Q/K/V projections with ShortConv, Swish, L2 Norm on Q/K, channel-wise lower-bounded decay α_i ≥ exp(-5), and O(1) state updates.' },
      { name: 'Gated MLA sublayer (24 layers)', output: 'global content attention', explanation: 'Compresses KV into d_c = 512 latent cache, applies pure NoPE without RoPE keys, and modulates output channels with an input-dependent full-rank gate.' },
      { name: 'AttnRes partial sum', output: 'within-block accumulation', explanation: 'Accumulates sublayer outputs into the current block sum, avoiding standard monolithic residual dilution.' },
    ],
  },
  {
    id: 'attnres', step: '03', title: 'Cross-layer Block AttnRes', summary: 'Dynamic content attention over historical blocks for every sublayer.',
    detail: 'Rather than passive addition (h_{l+1} = h_l + f(h_l)), AttnRes equips every sublayer with a learned pseudo-query w_l that performs dynamic softmax attention over the input embedding, earlier 12-layer block summaries, and the current partial block sum.',
    parameters: 'w_l ∈ ℝ^7,168 per sublayer', specification: '8 blocks (7 of 12 layers + 1 of 9 layers = 93 layers) · dynamic softmax attention',
    dimensions: 'Block and partial sums b_k ∈ ℝ^7,168 · dynamic weights α_{l,k} sum to 1',
    connections: ['Embedding b_0', 'Historical blocks b_1..b_{k-1}', 'Current partial sum', 'Softmax weighting', 'Sublayer input'], color: '#10B981',
    operators: [
      { name: 'Block grouping', output: '8 coarse-grained blocks', explanation: 'Divides 93 layers into 8 blocks (~12 layers each) so cross-layer attention scales with block count, incurring <2% latency overhead.' },
      { name: 'Dynamic softmax attention', output: 'content-based weights α', explanation: 'Calculates α_{l,k} = softmax_k(w_lᵀ RMSNorm(b_k)), dynamically routing lexical, syntactic, or semantic representations where needed.' },
      { name: 'Online Softmax aggregation', output: 'weighted residual blend', explanation: 'Aggregates historical block representations into the input for the next sublayer (both Attention and MoE).' },
    ],
  },
  {
    id: 'experts', step: '04', title: 'Stable LatentMoE (Sublayer 2)', summary: 'Layer 1 is Dense FFN; Layers 2..93 route tokens across 896 experts.',
    detail: 'Layer 1 uses a 33,792-dim Dense FFN with SiTU activation. Layers 2..93 use Stable LatentMoE: 2 shared experts always run, while 16 of 896 routed experts are selected via Quantile Balancing. The latent bottleneck (l = 3,584 = 0.5d) cuts inter-expert communication in half.',
    parameters: '104.2B activated parameters per token', specification: 'Layer 1 Dense (33,792-d) · Layers 2..93 MoE (896 routed, 16 active + 2 shared) · latent width 3,584 · expert hidden 3,072',
    dimensions: 'x ∈ ℝ^7,168 → W↓ (3,584-d) → expert hidden 3,072-d (SiTU-GLU) → W↑ (7,168-d)',
    connections: ['AttnRes Read', 'Down-projection W↓', '16 / 896 experts + 2 shared', 'SiTU-GLU', 'RMSNorm', 'Up-projection W↑', 'AttnRes Accumulate'], color: '#C084FC',
    operators: [
      { name: 'Router + Quantile Balancing', output: '16 selected experts', explanation: 'Scores 896 routed experts with bias b^{(t+1)} calibrated over token batches to eliminate load imbalance without auxiliary loss penalties.' },
      { name: 'Latent down-projection W↓', output: '3,584-d latent vector', explanation: 'Compresses 7,168-d representation into 3,584-d latent space before dispatching to experts, halving All-to-All dispatch communication.' },
      { name: 'SiTU-GLU expert activation', output: 'expert activations', explanation: 'Applies smooth bounded activation f(x) = (x·sigmoid(x)) / (1 + (x/25)⁴) with output bound 100, suppressing outliers in 896-expert training.' },
      { name: 'Up-projection W↑ & shared sum', output: '7,168-d MoE output', explanation: 'Aggregates 16 routed expert outputs, adds 2 shared experts, projects back to 7,168-d, and feeds the AttnRes accumulation.' },
    ],
  },
  {
    id: 'output', step: '05', title: 'Prediction & Multi-Token Prediction', summary: 'Final AttnRes aggregation scores next token across 163,840 vocab.',
    detail: 'The final layer aggregates block representations across all 8 blocks. An unembedding projection computes logits over the 163,840 vocabulary. 1 MTP (Multi-Token Prediction) layer provides auxiliary lookahead signals to boost inference throughput.',
    parameters: 'Vocab size 163,840 · 1 MTP layer', specification: '163,840 vocabulary (160K display) · 1 MTP layer · 1M context length',
    dimensions: 'Final hidden h ∈ ℝ^7,168 → 163,840 logits',
    connections: ['Final AttnRes Read', 'RMSNorm', 'Unembedding Head (163,840)', 'Softmax / Sampling', 'Next token + MTP'], color: '#FFB000',
    operators: [
      { name: 'Final AttnRes aggregation', output: 'final hidden representation', explanation: 'The final layer uses AttnRes to aggregate representations across all 8 historical blocks.' },
      { name: 'Unembedding projection', output: '163,840 vocabulary logits', explanation: 'Projects 7,168-d representation to 163,840 token logits with tied or independent embedding weights.' },
      { name: 'MTP auxiliary head', output: 'future token prediction', explanation: 'Predicts additional subsequent tokens concurrently during training, enabling speculative decoding during inference.' },
    ],
  },
];

type ArchitectureDetailTab = 'multimodal' | 'kda' | 'op_mla' | 'op_moe' | 'op_attnres' | 'op_unembed';

interface MacroArchitectureFlowProps {
  onNavigateTab?: (tab: ArchitectureDetailTab) => void;
}

export const MacroArchitectureFlow: React.FC<MacroArchitectureFlowProps> = ({ onNavigateTab }) => {
  const [selectedId, setSelectedId] = useState('attention');
  const [openOperator, setOpenOperator] = useState<string | null>(null);
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];

  const nodeTabMapping: Record<string, ArchitectureDetailTab> = {
    input: 'multimodal',
    attention: 'kda',
    attnres: 'op_attnres',
    experts: 'op_moe',
    moe: 'op_moe',
    output: 'op_unembed',
  };

  return (
    <section className="card architecture-flow" aria-labelledby="architecture-flow-title">
      <div className="card-title" id="architecture-flow-title">🧭 System architecture: how one token moves through Kimi K3</div>
      <p className="flow-intro">Every card distinguishes published figures from undisclosed ones. Select a module to reveal its operator-level data path and published dimensions. (💡 Click for a summary | use the buttons below, or double-click a card, to open a detailed derivation)</p>
      <div className="flow-track" role="list">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <button
              className={`flow-node ${selectedId === node.id ? 'active' : ''}`}
              onClick={() => { setSelectedId(node.id); setOpenOperator(null); }}
              onDoubleClick={() => onNavigateTab?.(nodeTabMapping[node.id])}
              style={{ '--node-color': node.color } as React.CSSProperties}
              role="listitem"
              aria-pressed={selectedId === node.id}
              title="Click: switch summary | double-click: open detailed derivation"
            >
              <span className="flow-step">{node.step}</span>
              <strong>{node.title}</strong>
              <span>{node.summary}</span>
              <b className="flow-node-params">{node.parameters}</b>
            </button>
            {index < nodes.length - 1 && <span className="flow-arrow" aria-hidden="true">→</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="flow-detail" style={{ '--node-color': selected.color } as React.CSSProperties} aria-live="polite">
        <div>
          <span className="eyebrow">Selected module · {selected.step}</span>
          <h3>{selected.title}</h3>
          <p>{selected.detail}</p>
          <div className="flow-specification"><span>Parameters</span><strong>{selected.parameters}</strong><span>Structure</span><strong>{selected.specification}</strong><span>Dimensions</span><strong>{selected.dimensions}</strong></div>
        </div>
        <div className="micro-connection" aria-label={`${selected.title} operator-level data path`}>
          <span className="micro-label">Operator-level data path</span>
          <div className="micro-chain">
            {selected.connections.map((connection, index) => (
              <React.Fragment key={connection}>
                <span className="micro-node">{connection}</span>
                {index < selected.connections.length - 1 && <span className="micro-arrow" aria-hidden="true">→</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="operator-list">
            {selected.operators.map((operator) => {
              const operatorId = `${selected.id}-${operator.name}`;
              const isOpen = openOperator === operatorId;
              return (
                <button key={operatorId} className={`operator-item ${isOpen ? 'active' : ''}`} onClick={() => setOpenOperator(isOpen ? null : operatorId)} aria-expanded={isOpen}>
                  <span>{operator.name}</span><b>{operator.output}</b>
                  {isOpen && <small>{operator.explanation}</small>}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            {selected.id === 'attention' && (
              <>
                <button className="btn" onClick={() => onNavigateTab?.('kda')}>Open KDA detail</button>
                <button className="btn" onClick={() => onNavigateTab?.('op_mla')}>Open MLA detail</button>
              </>
            )}
            {selected.id === 'attnres' && <button className="btn" onClick={() => onNavigateTab?.('op_attnres')}>Open AttnRes detail</button>}
            {selected.id === 'experts' && <button className="btn" onClick={() => onNavigateTab?.('op_moe')}>Open Stable LatentMoE detail</button>}
            {selected.id === 'input' && <button className="btn" onClick={() => onNavigateTab?.('multimodal')}>Open multimodal token flow</button>}
            {selected.id === 'output' && <button className="btn" onClick={() => onNavigateTab?.('op_unembed')}>Open decoding detail</button>}
          </div>
        </div>
      </div>
      <p className="architecture-source">Source: Table 1 and Section 2 of the bundled Kimi K3 Technical Report. “Not separately disclosed” means the report does not provide a verifiable module-level breakdown.</p>
    </section>
  );
};
