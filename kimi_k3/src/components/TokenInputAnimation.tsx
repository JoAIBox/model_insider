import React, { useState } from 'react';

interface TokenInputAnimationProps {
  mode?: 'multimodal' | 'layer';
  layerId?: number;
}

export const TokenInputAnimation: React.FC<TokenInputAnimationProps> = ({ mode = 'multimodal', layerId = 1 }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  if (mode === 'layer') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '18px', background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Description Panel */}
        <div>
          <h4 style={{ fontSize: '1.15rem', color: '#10B981', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            📥 Layer Input State h_{layerId}
          </h4>
          <p style={{ fontSize: '1.08rem', color: '#94A3B8', lineHeight: '1.5', margin: '0' }}>
            Layer {layerId} directly receives the merged hidden state sequence <b>h_{layerId} ∈ ℝ^(T × 7,168)</b> output by the previous layer.
            In this vector sequence, the text and vision token features have already been arranged sequentially (interleaved chronologically/spatially).
            They are processed as a whole by the attention mechanisms (MLA/KDA) and MoE expert networks in the current layer.
          </p>
        </div>

        {/* Layer Input SVG Diagram */}
        <div style={{ background: '#070913', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 720 120" width="100%" height="110" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
              </marker>
              <style>{`
                @keyframes dash-flow {
                  to { stroke-dashoffset: -20; }
                }
                .flow-line-layer {
                  stroke-dasharray: 4 3;
                  animation: dash-flow 1.5s linear infinite;
                }
              `}</style>
            </defs>

            {/* Connecting paths */}
            <line x1="110" y1="60" x2="210" y2="60" stroke="#10B981" strokeWidth="1.5" className="flow-line-layer" />
            <line x1="330" y1="60" x2="430" y2="60" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrow-green)" className="flow-line-layer" />
            <line x1="550" y1="60" x2="610" y2="60" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrow-green)" />

            {/* Previous Layer Output */}
            <rect x="10" y="30" width="100" height="60" rx="6" fill="#0F172A" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <text x="60" y="56" fill="#64748B" fontSize="13" textAnchor="middle">Output from</text>
            <text x="60" y="74" fill="#94A3B8" fontSize="14" fontWeight="bold" textAnchor="middle">Layer {layerId - 1}</text>

            {/* Incoming Hidden State h_l */}
            <rect x="210" y="30" width="120" height="60" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
            <text x="270" y="56" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">Input h_{layerId}</text>
            <text x="270" y="74" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ℝ^(T × 7,168)</text>

            {/* RMSNorm Operator inside Layer */}
            <rect x="430" y="30" width="120" height="60" rx="6" fill="#0F172A" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <text x="490" y="56" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">RMSNorm</text>
            <text x="490" y="74" fill="#64748B" fontSize="13" textAnchor="middle">Layer Norm</text>

            {/* Rest of the Layer Operators */}
            <rect x="610" y="30" width="100" height="60" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <text x="660" y="56" fill="#94A3B8" fontSize="14" textAnchor="middle" fontWeight="bold">Sublayers</text>
            <text x="660" y="74" fill="#64748B" fontSize="13" textAnchor="middle">Attention & MoE</text>

            {/* Glowing moving particle representing hidden state flow */}
            <circle r="5" fill="#10B981">
              <animateMotion dur="2.5s" repeatCount="indefinite" path="M 110 60 L 210 60 M 330 60 L 430 60" />
            </circle>
          </svg>
        </div>
      </div>
    );
  }

  // Otherwise, render the Multimodal Input Stage (Layer 0) Concat animation with sequential interleaving explanation
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '18px', background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Description Panel */}
      <div>
        <h4 style={{ fontSize: '1.15rem', color: '#38BDF8', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          🌟 Multimodal Alignment & Sequence Concatenation Stage (Layer 0) — Integrating Discrete & Continuous Sequences
        </h4>
        <p style={{ fontSize: '1.08rem', color: '#94A3B8', lineHeight: '1.55', margin: '0' }}>
          Since images <b>cannot be directly converted into vocabulary indices during the discrete tokenization stage</b>, the model adopts the following design:
          text is mapped to embeddings via discrete lookup, while images generate continuous feature vectors through MoonViT-V2 and are projected to align with the backbone hidden size (7,168 dimensions).
          Then, both are spliced (concatenated) along the sequence length dimension according to their <b>chronological order (interleaved layout)</b> in the prompt, forming a unified sequential input feature stream <b>x_t</b>.
        </p>
      </div>

      {/* SVG Animation Block showing spacious sequential alignment */}
      <div style={{ background: '#070913', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '18px', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 840 340" width="100%" height="340" style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrow-blue-in" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
            </marker>
            <marker id="arrow-purple-in" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
            </marker>
            <style>{`
              @keyframes dash-flow {
                to { stroke-dashoffset: -20; }
              }
              .flow-line {
                stroke-dasharray: 4 3;
                animation: dash-flow 1.2s linear infinite;
              }
            `}</style>
          </defs>

          {/* 1. User Input Prompt Level */}
          <text x="15" y="22" fill="#E2E8F0" fontSize="15" fontWeight="bold">Interleaved User Prompt Sequence:</text>
          <rect x="15" y="32" width="810" height="36" rx="6" fill="#0A0F1D" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          
          <text x="30" y="55" fill="#38BDF8" fontSize="14" fontWeight="bold">"Show me this </text>
          <rect x="145" y="38" width="65" height="24" rx="4" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="1" />
          <text x="177.5" y="54" fill="#A78BFA" fontSize="13" textAnchor="middle" fontWeight="bold">[Image]</text>
          <text x="220" y="55" fill="#38BDF8" fontSize="14" fontWeight="bold"> what cat?"</text>

          {/* 2. Embedding & Encoder Branch Cards */}
          {/* Prefix Text tokens: "Show me this " */}
          <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredPart('prefix')} onMouseLeave={() => setHoveredPart(null)}>
            <rect x="15" y="85" width="180" height="65" rx="6" fill="#0F172A" stroke={hoveredPart === 'prefix' ? '#38BDF8' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
            <text x="105" y="112" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">Prefix Text Embedding</text>
            <text x="105" y="134" fill="#94A3B8" fontSize="12" textAnchor="middle" fontFamily="monospace">x_1, x_2, x_3 ∈ ℝ^(3×d)</text>
          </g>
          
          {/* MoonViT Vision Encoder */}
          <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredPart('vision')} onMouseLeave={() => setHoveredPart(null)}>
            <rect x="215" y="85" width="410" height="65" rx="6" fill="#0F172A" stroke={hoveredPart === 'vision' ? '#A78BFA' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
            <text x="420" y="112" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">
              MoonViT-V2 Encoder + Pixel Shuffle + W_proj
            </text>
            <text x="420" y="134" fill="#A78BFA" fontSize="12" textAnchor="middle" fontFamily="monospace">
              v_1, v_2, v_3, v_4 ∈ ℝ^(4×d) (Vision Patch Projection)
            </text>
          </g>

          {/* Suffix Text tokens: " what cat?" */}
          <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredPart('suffix')} onMouseLeave={() => setHoveredPart(null)}>
            <rect x="645" y="85" width="180" height="65" rx="6" fill="#0F172A" stroke={hoveredPart === 'suffix' ? '#38BDF8' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
            <text x="735" y="112" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">Suffix Text Embedding</text>
            <text x="735" y="134" fill="#94A3B8" fontSize="12" textAnchor="middle" fontFamily="monospace">x_8, x_9 ∈ ℝ^(2×d)</text>
          </g>

          {/* Connecting dashed lines from branches down to spliced sequence */}
          <path d="M 105 150 L 105 185" stroke="#38BDF8" strokeWidth="1.5" fill="none" className="flow-line" markerEnd="url(#arrow-blue-in)" />
          <path d="M 420 150 L 420 185" stroke="#A78BFA" strokeWidth="1.5" fill="none" className="flow-line" markerEnd="url(#arrow-purple-in)" />
          <path d="M 735 150 L 735 185" stroke="#38BDF8" strokeWidth="1.5" fill="none" className="flow-line" markerEnd="url(#arrow-blue-in)" />

          {/* 3. Spliced Sequence Level */}
          <text x="15" y="175" fill="#E2E8F0" fontSize="15" fontWeight="bold">Spliced Sequence (Sequentially Interleaved tokens in ℝ^(T × d)):</text>
          
          {/* Spliced Sequence boxes */}
          <g>
            {/* Text Prefix: x1, x2, x3 */}
            <rect x="15" y="185" width="50" height="45" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="40" y="212" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">x_1</text>
            
            <rect x="75" y="185" width="50" height="45" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="100" y="212" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">x_2</text>
            
            <rect x="135" y="185" width="50" height="45" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="160" y="212" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">x_3</text>

            {/* Visual Patches: v1, v2, v3, v4 */}
            <rect x="215" y="185" width="65" height="45" rx="4" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="1.5" />
            <text x="247.5" y="212" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">v_1</text>
            
            <rect x="290" y="185" width="65" height="45" rx="4" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="1.5" />
            <text x="322.5" y="212" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">v_2</text>
            
            <rect x="365" y="185" width="65" height="45" rx="4" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="1.5" />
            <text x="397.5" y="212" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">v_3</text>
            
            <rect x="440" y="185" width="65" height="45" rx="4" fill="rgba(167, 139, 250, 0.15)" stroke="#A78BFA" strokeWidth="1.5" />
            <text x="472.5" y="212" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle">v_4</text>

            {/* Text Suffix: x8, x9 */}
            <rect x="645" y="185" width="50" height="45" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="670" y="212" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">x_8</text>
            
            <rect x="705" y="185" width="50" height="45" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="730" y="212" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">x_9</text>

            {/* Sequence flow link lines */}
            <line x1="185" y1="207.5" x2="215" y2="207.5" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="505" y1="207.5" x2="645" y2="207.5" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3,3" />
          </g>

          {/* Path into backbone */}
          <path d="M 420 230 L 420 265" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-blue-in)" className="flow-line" />

          {/* Unified Output Stream Box */}
          <rect x="15" y="265" width="810" height="55" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
          <text x="420" y="298" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">
            Unified sequence stream X = [x_1, x_2, x_3, v_1, v_2, v_3, v_4, x_8, x_9] ∈ ℝ^(T × 7,168) → Flows into Backbone Layer 1
          </text>
        </svg>
      </div>

      {/* Operator and Sub-layer Breakdown Explanation Table */}
      <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '6px', padding: '14px 16px' }}>
        <span style={{ fontSize: '1.15rem', color: '#94A3B8', fontWeight: 'bold' }}>[ Multimodal Interleaving Design Notes ]</span>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 200px', gap: '8px 16px', marginTop: '10px', fontSize: '1.05rem', color: '#94A3B8' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '6px' }}>Design Concept</div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '6px' }}>Technical Insight</div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 'bold', color: '#E2E8F0', paddingBottom: '6px' }}>Position</div>

          <div style={{ color: '#FFF', fontWeight: 'bold' }}>Interleaved Sequence Input</div>
          <div style={{ lineHeight: '1.55' }}>Text and images are not fused by overlaying in space, but are spliced into a single sequence according to their chronological user input order. For example, when a user inserts an image in the middle of a sentence, the sequence of visual patch vectors (Visual Tokens) will be inserted precisely between the preceding and succeeding text tokens.</div>
          <div style={{ color: '#38BDF8', fontFamily: 'monospace' }}>Sequence Length Dimension T</div>

          <div style={{ color: '#FFF', fontWeight: 'bold' }}>Discrete vs. Continuous Trade-off</div>
          <div style={{ lineHeight: '1.55' }}>Text Token IDs are discrete scalars representing vocabulary indices, while image pixels are transformed into continuous real-valued feature vectors of the same dimension via ViT and linear projection layers. They are aligned to d=7,168 dimensions at the embedding level, solving the vocab-lookup constraint for images.</div>
          <div style={{ color: '#A78BFA', fontFamily: 'monospace' }}>Layer 0 Alignment & Projection</div>

          <div style={{ color: '#FFF', fontWeight: 'bold' }}>Homogeneous Processing in Backbone</div>
          <div style={{ lineHeight: '1.55' }}>Once concatenated, this sequence becomes a homogeneous set of hidden state vectors for all subsequent LLM layers. The backbone layers only perform attention-based feature mixing across the sequence length dimension, without needing to distinguish or merge modalities during computation.</div>
          <div style={{ color: '#10B981', fontFamily: 'monospace' }}>Backbone Layers 1 ~ 93</div>
        </div>
      </div>
    </div>
  );
};
