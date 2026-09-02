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
    id: 'input', step: '01', title: 'Native Vision Input', summary: 'Images and text become a shared stream of tokens.',
    detail: 'Text tokens enter the shared embedding space directly. Images first pass through MoonViT-V2, trained from scratch, and then a lightweight projector maps visual features into that same space.',
    parameters: '401M (MoonViT-V2)', specification: '27 layers · 12 vision-attention heads · patch size 14',
    dimensions: 'Patch: 14 × 14 · projector output width: not separately disclosed',
    connections: ['Image', 'Patchify', 'MoonViT', 'Projector', 'Shared tokens'], color: '#A78BFA',
    operators: [
      { name: 'Patchify', output: '14 × 14 image patches', explanation: 'Splits visual input using the reported patch size of 14.' },
      { name: 'MoonViT-V2', output: 'visual features', explanation: 'A 27-layer vision Transformer. Spatial and temporal attention are factorized; images and video share parameters.' },
      { name: '2 × 2 Pixel Shuffle', output: 'one quarter as many visual tokens', explanation: 'A 2 × 2 downsampling before projection; the report says it reduces visual-token count by a factor of four.' },
      { name: 'MLP Projector', output: 'shared embedding space', explanation: 'A lightweight MLP maps visual features into the LLM embedding space. Its parameter count is not separately disclosed.' },
    ],
  },
  {
    id: 'attention', step: '02', title: 'Hybrid-attention Backbone', summary: '93 layers progressively relate tokens to one another.',
    detail: 'Every four layers use three KDA layers followed by one Gated MLA layer; a final MLA layer closes the backbone. KDA handles long sequences efficiently while MLA periodically provides stronger global interaction.',
    parameters: '2.78T total parameters (whole-model figure)', specification: '93 layers: 69 KDA + 24 MLA · hidden size 7,168 · 96 heads',
    dimensions: 'Backbone token x ∈ R^7,168 · Q/K/V head widths: not separately disclosed',
    connections: ['Input x', 'RMSNorm', 'KDA × 3', 'Gated MLA', 'Residual add'], color: '#00F2FE',
    operators: [
      { name: 'RMSNorm', output: 'normalized representation', explanation: 'Controls numerical scale in several subpaths. Per-layer parameter counts are not separately disclosed.' },
      { name: 'KDA path', output: 'long-sequence mixing', explanation: 'Q/K/V projections feed ShortConv and Swish; Q and K additionally use L2 Norm, while decay and write gates update state.' },
      { name: 'Gated MLA path', output: 'global content interaction', explanation: 'Compresses KV into a low-dimensional latent cache and reconstructs it with up-projections. K3 MLA uses NoPE and a full-rank output gate.' },
      { name: 'Residual add', output: 'next-layer input', explanation: 'Attention and later MoE results are retained through residual paths and passed to the next layer.' },
    ],
  },
  {
    id: 'attnres', step: '03', title: 'Cross-layer AttnRes', summary: 'Layers can retrieve earlier representations, not only the prior layer.',
    detail: 'A standard residual mainly adds the previous layer back to the current layer. AttnRes lets the current module selectively retrieve the embedding, its current block, and preceding blocks, improving information flow through depth.',
    parameters: 'parameter count not separately disclosed', specification: '12-layer retrieval blocks · 8 blocks across 93 backbone layers (the last is partial)',
    dimensions: 'Layer and block representations hₗ, bₙ ∈ R^7,168',
    connections: ['Embedding', 'Earlier block states', 'Current block state', 'Selective attention', 'Current layer'], color: '#10B981',
    operators: [
      { name: 'Intra-block sum', output: 'block representation', explanation: 'Layer outputs in the same 12-layer block are summed into one representation.' },
      { name: 'RMSNorm + attention scoring', output: 'cross-layer weights', explanation: 'A learnable pseudo-query for the current layer selectively reads the embedding, earlier blocks, and the current partial block sum.' },
      { name: 'Online Softmax merge', output: 'cross-block residual', explanation: 'Merges parallel cross-block results with the sequential within-block partial sum. Weights depend on the input and no fixed values are disclosed.' },
    ],
  },
  {
    id: 'experts', step: '04', title: 'Stable LatentMoE', summary: 'Each token is dispatched to the most suitable experts.',
    detail: 'Shared experts always process the full representation. The routed branch first compresses it to half width, sends it to a small set of experts, then aggregates and projects it back to backbone width. This keeps total capacity high without calling every expert per token.',
    parameters: '104.2B activated parameters per token', specification: '896 routed experts, 16 selected · 2 shared experts per layer · latent width 3,584 · expert hidden width 3,072',
    dimensions: 'x ∈ R^7,168 → z ∈ R^3,584 → expert hidden 3,072 → R^3,584 → R^7,168',
    connections: ['x (7,168)', 'Down-projection', '16 / 896 experts', 'Weighted aggregate', 'RMSNorm', 'Up-projection', 'Add shared experts'], color: '#C084FC',
    operators: [
      { name: 'Router + Quantile Balancing', output: '16 selected experts', explanation: 'Selects 16 of 896 routed experts for each token. Quantile balancing regulates expert load.' },
      { name: 'Down-projection W↓', output: '3,584-dimensional latent', explanation: 'Moves the 7,168-dimensional backbone representation into a narrower expert communication and compute space.' },
      { name: 'SiTU-GLU experts', output: 'expert outputs', explanation: 'Each expert has a hidden width of 3,072. SiTU-GLU bounds large activations to reduce numerical blow-ups.' },
      { name: 'Aggregate + RMSNorm + up-projection W↑', output: 'backbone-width result', explanation: 'Aggregates expert outputs with router weights, normalizes them, projects them back, and adds the output from two shared experts.' },
    ],
  },
  {
    id: 'output', step: '05', title: 'Prediction and Generation', summary: 'The final representation becomes the next token.',
    detail: 'The final layer aggregates block representations and scores the next token from a 160K vocabulary. Each generated token returns to the context for the next step; MTP and speculative decoding improve generation efficiency.',
    parameters: 'output-head parameter count not separately disclosed', specification: '160K vocabulary · 1 MTP layer · maximum 1M-token context',
    dimensions: 'Final hidden representation ∈ R^7,168 → 160K vocabulary logits',
    connections: ['Final representation', 'Vocabulary scores', 'Next token', 'Write back to context'], color: '#FFB000',
    operators: [
      { name: 'Final AttnRes aggregation', output: 'final-layer representation', explanation: 'The final output layer aggregates block-level representations.' },
      { name: 'Vocabulary projection', output: '160K candidate scores', explanation: 'Scores candidate tokens in the vocabulary. The output-head parameter count is not separately disclosed.' },
      { name: 'Sampling / decoding', output: 'next token', explanation: 'Chooses one token, writes it into context, and proceeds to the next generation step.' },
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
