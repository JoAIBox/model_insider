import React, { useState } from 'react';

export const AttentionOperatorAnimation: React.FC<{ type: 'KDA' | 'MLA' }> = ({ type }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Steps definition for hover & detail inspection
  const kdaSteps = [
    {
      title: 'RMSNorm Normalization',
      formula: 'x\'_t = RMSNorm(x_t)',
      desc: 'Performs root-mean-square normalization on the hidden layer input features to stabilize data distribution and prevent gradient explosion in deep networks.',
      op: 'RMSNorm Operator'
    },
    {
      title: 'Q / K / V Feature Extraction',
      formula: 'q_t^h, k_t^h = L2Norm(Swish(ShortConv(W_q/k * x\'_t)))',
      desc: 'Uses 1D local convolution (ShortConv) to capture local sequence context, passed through a Swish activation layer, and finally normalized with L2Norm to obtain head-level Query and Key.',
      op: 'Linear Projection + Conv1D + Swish + L2Norm'
    },
    {
      title: 'Decay & Write Gating Logit Prediction',
      formula: 'β_t^h = Sigmoid(W_β * x\'_t) \\quad z_t^h = W_α^↑ * W_α^↓ * x\'_t + b_α^h',
      desc: 'Dynamically predicts write strength β (0-1 gate) and forget gate decay rate z for each channel.',
      op: 'Low-Rank Linear Layers + Sigmoid Gate'
    },
    {
      title: 'State Update (Channel Forget Gate Delta Rule)',
      formula: 'S_t^h = (I - β_t^h * k_t^h * (k_t^h)ᵀ) * Diag(α_t^h) * S_(t-1)^h + β_t^h * k_t^h * (v_t^h)ᵀ',
      desc: 'First applies channel-wise decay S̄_t = Diag(α_t) S_(t-1), predicts value v̂_t = S̄_tᵀ k_t, and adds error correction ΔS = β_t k_t (v_t - v̂_t)ᵀ.',
      op: 'Recurrent Memory Core Matrix Update'
    },
    {
      title: 'Recurrent State Retrieval Output & Gating',
      formula: 'õ_t = S_tᵀ * q_t \\quad y_t = W_o * (Sigmoid(W_g * x\'_t) ⊙ RMSNorm(õ_t))',
      desc: 'Query vector q_t retrieves features from state S_t. Concatenated multi-head outputs are normalized via Head-wise RMSNorm.',
      op: 'Linear Output Projection + Channel Gating'
    }
  ];

  const mlaSteps = [
    {
      title: 'RMSNorm Normalization',
      formula: "x'_t = RMSNorm(x_t)",
      desc: 'Performs root-mean-square normalization on the input token vectors to stabilize gradient flows.',
      op: 'RMSNorm Operator'
    },
    {
      title: 'Key-Value Low-Rank Compression (W_c)',
      formula: 'c_t = W_c * x\'_t',
      desc: 'Compresses hidden features from d = 7,168 dimensions to a low-rank latent vector c_t.',
      op: 'Low-rank KV Compression'
    },
    {
      title: 'Key-Value & Query Reconstruction (Up-projections)',
      formula: 'K_t = W_uk * c_t \\quad V_t = W_uv * c_t \\quad Q_t = W_q * x\'_t',
      desc: 'During attention computation, W_uk and W_uv up-project c_t to reconstruct content Keys and Values.',
      op: 'Latent Cache Up-projection + Query Projection'
    },
    {
      title: 'NoPE Global Attention Softmax Computation',
      formula: 'õ_t = Softmax( (Q_t * K_tᵀ) / √d_h ) * V_t',
      desc: 'Performs dot-product attention on reconstructed high-dimensional features to calculate token associations.',
      op: 'No-Position-Encoding Global Attention Core'
    },
    {
      title: 'Full-Rank Channel Output Gating & Projection',
      formula: 'y_t = W_o * (Sigmoid(W_g * x_t) ⊙ õ_t)',
      desc: 'W_g projects input features and generates a gating vector via Sigmoid, modulating concatenated outputs.',
      op: 'Full-rank Gated Operator + Output Projection'
    }
  ];

  const steps = type === 'KDA' ? kdaSteps : mlaSteps;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '18px', background: '#02040a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Upper Section: Graphic Demonstration */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: type === 'KDA' ? '#00F2FE' : '#C084FC' }}>
            🛰️ {type === 'KDA' ? 'Kimi Delta Attention Dynamic Dataflow Topology' : 'Gated MLA Key-Value Compression & Reconstruction Flow'}
          </span>
          <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>* Hover over steps below to highlight data paths</span>
        </div>

        {/* Dynamic SVG Flowchart with spacious viewBox */}
        <div style={{ background: '#070913', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', padding: '16px', display: 'flex', justifyContent: 'center' }}>
          {type === 'KDA' ? (
            <svg viewBox="0 0 880 320" width="100%" height="300" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-kda" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                </marker>
                <marker id="arrow-kda-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00F2FE" />
                </marker>
                <filter id="glow-kda" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Paths */}
              <line x1="115" y1="160" x2="145" y2="160" stroke={activeStep === 0 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 0 ? 2 : 1.2} markerEnd={`url(#${activeStep === 0 ? 'arrow-kda-active' : 'arrow-kda'})`} />
              
              {/* RMSNorm to QKV and Decay Gates */}
              <path d="M 225 160 L 245 160 C 255 160, 255 80, 265 80" fill="none" stroke={activeStep === 1 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 1 ? 2 : 1.2} markerEnd={`url(#${activeStep === 1 ? 'arrow-kda-active' : 'arrow-kda'})`} />
              <path d="M 225 160 L 245 160 C 255 160, 255 240, 265 240" fill="none" stroke={activeStep === 2 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 2 ? 2 : 1.2} markerEnd={`url(#${activeStep === 2 ? 'arrow-kda-active' : 'arrow-kda'})`} />
              
              {/* Output gating bypass */}
              <path d="M 225 140 C 225 30, 650 30, 675 130" fill="none" stroke={activeStep === 4 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 4 ? 2 : 1.2} strokeDasharray="5,4" markerEnd={`url(#${activeStep === 4 ? 'arrow-kda-active' : 'arrow-kda'})`} />

              {/* QKV and Decay to Recurrent Memory S_t */}
              <path d="M 395 80 L 420 80 C 435 80, 435 145, 445 145" fill="none" stroke={activeStep === 3 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 3 ? 2 : 1.2} markerEnd={`url(#${activeStep === 3 ? 'arrow-kda-active' : 'arrow-kda'})`} />
              <path d="M 395 240 L 420 240 C 435 240, 435 175, 445 175" fill="none" stroke={activeStep === 3 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 3 ? 2 : 1.2} markerEnd={`url(#${activeStep === 3 ? 'arrow-kda-active' : 'arrow-kda'})`} />

              {/* Memory Output to Gating Circle and W_o */}
              <line x1="615" y1="160" x2="645" y2="160" stroke={activeStep === 4 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 4 ? 2 : 1.2} markerEnd={`url(#${activeStep === 4 ? 'arrow-kda-active' : 'arrow-kda'})`} />
              <line x1="705" y1="160" x2="745" y2="160" stroke={activeStep === 4 ? '#00F2FE' : '#475569'} strokeWidth={activeStep === 4 ? 2 : 1.2} markerEnd={`url(#${activeStep === 4 ? 'arrow-kda-active' : 'arrow-kda'})`} />

              {/* Node Boxes */}
              {/* Token Input */}
              <rect x="15" y="130" width="100" height="60" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="65" y="156" fill="#94A3B8" fontSize="14" textAnchor="middle" fontWeight="bold">Input xₜ</text>
              <text x="65" y="176" fill="#64748B" fontSize="12" textAnchor="middle">d = 7,168</text>

              {/* RMSNorm */}
              <rect x="145" y="130" width="80" height="60" rx="6" fill={activeStep === 0 ? 'rgba(0, 242, 254, 0.15)' : '#0F172A'} stroke={activeStep === 0 ? '#00F2FE' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="185" y="165" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">RMSNorm</text>

              {/* Q/K/V Projections */}
              <rect x="265" y="50" width="130" height="60" rx="6" fill={activeStep === 1 ? 'rgba(0, 242, 254, 0.15)' : '#0F172A'} stroke={activeStep === 1 ? '#00F2FE' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="330" y="75" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Q/K/V Proj</text>
              <text x="330" y="95" fill="#64748B" fontSize="12" textAnchor="middle">Conv + Swish + L2Norm</text>

              {/* Decay/Write Gates */}
              <rect x="265" y="210" width="130" height="60" rx="6" fill={activeStep === 2 ? 'rgba(0, 242, 254, 0.15)' : '#0F172A'} stroke={activeStep === 2 ? '#00F2FE' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="330" y="235" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">α_t & β_t Gates</text>
              <text x="330" y="255" fill="#64748B" fontSize="12" textAnchor="middle">Low-rank logit prediction</text>

              {/* Memory Cell St */}
              <rect x="445" y="115" width="170" height="90" rx="8" fill={activeStep === 3 ? 'rgba(16, 185, 129, 0.15)' : '#090D16'} stroke={activeStep === 3 ? '#10B981' : '#475569'} strokeWidth="2" filter={activeStep === 3 ? 'url(#glow-kda)' : 'none'} />
              <text x="530" y="144" fill="#FFF" fontSize="15" textAnchor="middle" fontWeight="bold">Recurrent State Sₜ</text>
              <text x="530" y="167" fill="#10B981" fontSize="12" textAnchor="middle" fontFamily="monospace">S_t = S_t-1 - decay + write</text>
              <text x="530" y="187" fill="#64748B" fontSize="12" textAnchor="middle">dk × dv Head Matrix</text>

              {/* RMSNorm + Gate Multiply Circle */}
              <circle cx="675" cy="160" r="30" fill={activeStep === 4 ? 'rgba(0, 242, 254, 0.15)' : '#0F172A'} stroke={activeStep === 4 ? '#00F2FE' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
              <text x="675" y="162" fill="#FFF" fontSize="18" textAnchor="middle" fontWeight="bold">⊙</text>
              <text x="675" y="180" fill="#64748B" fontSize="11" textAnchor="middle">Output Gate</text>

              {/* Output Projector */}
              <rect x="745" y="130" width="95" height="60" rx="6" fill={activeStep === 4 ? 'rgba(0, 242, 254, 0.15)' : '#0F172A'} stroke={activeStep === 4 ? '#00F2FE' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
              <text x="792" y="165" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">W_o Proj</text>
            </svg>
          ) : (
            <svg viewBox="0 0 880 320" width="100%" height="300" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-mla" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                </marker>
                <marker id="arrow-mla-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#C084FC" />
                </marker>
                <filter id="glow-mla" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connection Lines */}
              <line x1="115" y1="160" x2="145" y2="160" stroke={activeStep === 0 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 0 ? 2 : 1.2} markerEnd={`url(#${activeStep === 0 ? 'arrow-mla-active' : 'arrow-mla'})`} />
              
              {/* RMSNorm to Query Proj and KV Compress */}
              <path d="M 225 160 L 245 160 C 255 160, 255 70, 425 70" fill="none" stroke={activeStep === 2 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 2 ? 2 : 1.2} markerEnd={`url(#${activeStep === 2 ? 'arrow-mla-active' : 'arrow-mla'})`} />
              <path d="M 225 160 L 245 160 C 255 160, 255 240, 265 240" fill="none" stroke={activeStep === 1 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 1 ? 2 : 1.2} markerEnd={`url(#${activeStep === 1 ? 'arrow-mla-active' : 'arrow-mla'})`} />
              
              {/* KV Compress to Latent Cache */}
              <line x1="385" y1="240" x2="425" y2="240" stroke={activeStep === 1 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 1 ? 2 : 1.2} markerEnd={`url(#${activeStep === 1 ? 'arrow-mla-active' : 'arrow-mla'})`} />
              
              {/* Latent Cache to Up Proj */}
              <line x1="555" y1="240" x2="595" y2="240" stroke={activeStep === 2 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 2 ? 2 : 1.2} markerEnd={`url(#${activeStep === 2 ? 'arrow-mla-active' : 'arrow-mla'})`} />

              {/* Output gating bypass */}
              <path d="M 225 140 C 225 25, 720 25, 745 130" fill="none" stroke={activeStep === 4 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 4 ? 2 : 1.2} strokeDasharray="5,4" markerEnd={`url(#${activeStep === 4 ? 'arrow-mla-active' : 'arrow-mla'})`} />

              {/* Query & Up-projections into Global Attention */}
              <path d="M 565 70 L 580 70 C 590 70, 590 135, 600 135" fill="none" stroke={activeStep === 3 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 3 ? 2 : 1.2} markerEnd={`url(#${activeStep === 3 ? 'arrow-mla-active' : 'arrow-mla'})`} />
              <path d="M 705 225 L 720 225 C 730 225, 730 175, 740 175" fill="none" stroke={activeStep === 3 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 3 ? 2 : 1.2} markerEnd={`url(#${activeStep === 3 ? 'arrow-mla-active' : 'arrow-mla'})`} />

              {/* Global Attention into Gate */}
              <line x1="745" y1="160" x2="715" y2="160" stroke={activeStep === 4 ? '#C084FC' : '#475569'} strokeWidth={activeStep === 4 ? 2 : 1.2} markerEnd={`url(#${activeStep === 4 ? 'arrow-mla-active' : 'arrow-mla'})`} />

              {/* Nodes */}
              {/* Input */}
              <rect x="15" y="130" width="100" height="60" rx="6" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="65" y="156" fill="#94A3B8" fontSize="14" textAnchor="middle" fontWeight="bold">Input xₜ</text>
              <text x="65" y="176" fill="#64748B" fontSize="12" textAnchor="middle">d = 7,168</text>

              {/* RMSNorm */}
              <rect x="145" y="130" width="80" height="60" rx="6" fill={activeStep === 0 ? 'rgba(192, 132, 252, 0.15)' : '#0F172A'} stroke={activeStep === 0 ? '#C084FC' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="185" y="165" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">RMSNorm</text>

              {/* Query projection */}
              <rect x="425" y="40" width="140" height="60" rx="6" fill={activeStep === 2 ? 'rgba(192, 132, 252, 0.15)' : '#0F172A'} stroke={activeStep === 2 ? '#C084FC' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="495" y="66" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Query Proj</text>
              <text x="495" y="86" fill="#64748B" fontSize="12" textAnchor="middle">Q_t = W_q * x'</text>

              {/* Low-rank compression */}
              <rect x="265" y="210" width="120" height="60" rx="6" fill={activeStep === 1 ? 'rgba(192, 132, 252, 0.15)' : '#0F172A'} stroke={activeStep === 1 ? '#C084FC' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="325" y="236" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">KV Compress</text>
              <text x="325" y="256" fill="#64748B" fontSize="12" textAnchor="middle">W_c Matrix</text>

              {/* Latent KV Cache */}
              <rect x="425" y="210" width="130" height="60" rx="6" fill={activeStep === 1 ? 'rgba(16, 185, 129, 0.15)' : '#090D16'} stroke={activeStep === 1 ? '#10B981' : '#475569'} strokeWidth="2" />
              <text x="490" y="236" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Latent Cache cₜ</text>
              <text x="490" y="256" fill="#10B981" fontSize="12" textAnchor="middle">d_c dimension</text>

              {/* Up-projections W_uk / W_uv */}
              <rect x="595" y="195" width="110" height="60" rx="6" fill={activeStep === 2 ? 'rgba(192, 132, 252, 0.15)' : '#0F172A'} stroke={activeStep === 2 ? '#C084FC' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="650" y="221" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Up Proj</text>
              <text x="650" y="241" fill="#64748B" fontSize="12" textAnchor="middle">W_uk / W_uv</text>

              {/* Attention dot-product Matrix */}
              <rect x="600" y="125" width="145" height="70" rx="6" fill={activeStep === 3 ? 'rgba(192, 132, 252, 0.15)' : '#0F172A'} stroke={activeStep === 3 ? '#C084FC' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" />
              <text x="672" y="153" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">Global Attention</text>
              <text x="672" y="175" fill="#C084FC" fontSize="12" textAnchor="middle" fontFamily="monospace">Softmax(Q Kᵀ / √d_h) V</text>

              {/* Gated output & Output projection */}
              <circle cx="785" cy="160" r="30" fill={activeStep === 4 ? 'rgba(192, 132, 252, 0.15)' : '#0F172A'} stroke={activeStep === 4 ? '#C084FC' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
              <text x="785" y="162" fill="#FFF" fontSize="18" textAnchor="middle" fontWeight="bold">⊙</text>
              <text x="785" y="180" fill="#64748B" fontSize="11" textAnchor="middle">Gate + W_o</text>
            </svg>
          )}
        </div>
      </div>

      {/* Interactive Mathematical Steps List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {steps.map((step, idx) => {
          const isHovered = activeStep === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setActiveStep(idx)}
              onMouseLeave={() => setActiveStep(null)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: isHovered ? (type === 'KDA' ? '#00F2FE' : '#C084FC') : 'rgba(255,255,255,0.06)',
                background: isHovered ? (type === 'KDA' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(192, 132, 252, 0.08)') : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.92rem', color: type === 'KDA' ? '#00F2FE' : '#C084FC', fontWeight: 'bold', marginBottom: '4px' }}>
                Step 0{idx + 1}
              </div>
              <strong style={{ fontSize: '0.98rem', color: isHovered ? '#FFF' : '#E2E8F0', display: 'block', marginBottom: '6px' }}>{step.title}</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: '#38BDF8', background: 'rgba(0,0,0,0.3)', padding: '4px 6px', borderRadius: '4px', marginBottom: '6px', overflowX: 'auto' }}>
                {step.formula}
              </div>
              <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: 0, lineHeight: '1.45' }}>{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
