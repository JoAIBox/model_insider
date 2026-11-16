import React, { useState, useEffect, useRef } from 'react';

// Pipeline steps for the multimodal token alignment teaching graph.
const pipelineSteps = [
  { id: 0, title: "1. Text BPE tokenization and embedding lookup", desc: "Text string ➔ BPE token IDs ➔ W_emb[ID] lookup to produce a 7,168-d text vector", output: "x_text ∈ ℝ^7,168", type: "text" },
  { id: 1, title: "2. Image patchification at 14×14", desc: "Teaching geometry: a 28×28 image ➔ four 14×14×3 (588-value) RGB patches. K3 confirms the 14×14 patch size; this four-patch example is illustrative.", output: "Patch x_p ∈ ℝ^(4 × 588 values) (teaching example)", type: "vision" },
  { id: 2, title: "3. MoonViT-V2 patch feature extraction", desc: "MoonViT-V2 (27 layers, hidden size 1,024) encodes 14×14 patches into 1,024-d visual feature representations.", output: "f_vit ∈ ℝ^(N × 1,024)", type: "vision" },
  { id: 3, title: "4. 2×2 Pixel Shuffle token downsampling", desc: "2×2 spatial pixel shuffle packs 4 adjacent visual patches into a single 4,096-d token (4× spatial sequence compression).", output: "v_4096 ∈ ℝ^(N/4 × 4,096)", type: "vision" },
  { id: 4, title: "5. MLP projector into 7,168-d language space", desc: "Two-layer MLP projector maps the 4,096-d downsampled visual tokens into the 7,168-d LLM hidden state space.", output: "x_img ∈ ℝ^(N/4 × 7,168)", type: "vision" },
  { id: 5, title: "6. Interleaved sequence assembly", desc: "[prefix text ➔ visual tokens ➔ suffix text] is assembled into Stream X and sent through the 93-layer backbone", output: "Stream X ∈ ℝ^(T × 7,168)", type: "backbone" },
  { id: 6, title: "7. 163,840-vocabulary autoregressive decoding", desc: "Backbone output h_t ➔ W_unembed [163,840×7,168] vocabulary logits ➔ sample one next token ↺ append it to context", output: "1 next token (t=N+1)", type: "decoder" }
];

export const MultimodalTokenSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patchEncoder' | 'pixelShuffle' | 'latentSpace' | 'projector'>('overview');
  
  // Interactive Prompt State
  const [prefixText, setPrefixText] = useState<string>('Show me');
  const [suffixText, setSuffixText] = useState<string>('a cat');

  // Dynamic Flow & Animation Control States
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Manual step debugger by default
  const speedMs = 1600; // Fixed animation speed
  const [viewMode, setViewMode] = useState<'math' | 'analogy'>('analogy');
  const [imgRes, setImgRes] = useState<number>(56);

  // Autoregressive Token Generation Queue (Simulating step-by-step token generation)
  const [genStep, setGenStep] = useState<number>(0);
  const vocabSampleTokens = [
    { id: 4891, token: "photo", prob: 0.84, type: "text", color: "#F59E0B" },
    { id: 1024, token: "of", prob: 0.91, type: "text", color: "#10B981" },
    { id: 8931, token: "cat", prob: 0.78, type: "text", color: "#EC4899" }
  ];

  // Interactive Patch selection for Step 2 & 3
  const [selectedPatchGroup, setSelectedPatchGroup] = useState<number>(0);
  const [selectedFilterIdx, setSelectedFilterIdx] = useState<number>(12);
  const [projRes, setProjRes] = useState<number>(448);
  const [selectedProjStage, setSelectedProjStage] = useState<number>(3);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Playback loop for Step Debugger
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((prev) => (prev + 1) % pipelineSteps.length);
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs]);

  // Sample 4x4 Grid images (4 patches of 14x14)
  const samplePatches = [
    { name: 'Top-Left (Ear Pattern)', color: '#FF5555', filterVal: 0.82 },
    { name: 'Top-Right (Sky Background)', color: '#38BDF8', filterVal: 0.15 },
    { name: 'Bottom-Left (Fur Texture)', color: '#10B981', filterVal: 0.94 },
    { name: 'Bottom-Right (Shadow Detail)', color: '#FFB000', filterVal: 0.61 },
  ];

  const currentStep = pipelineSteps[stepIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌟</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              Layer 0 multimodal token flow and autoregressive generation console
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Multimodal Tokenizer Simulator (§2.1)
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            An interactive teaching view of 14×14 patchification, 2×2 Pixel Shuffle token-count reduction, visual projection into the 7,168-d backbone space, and one-token-at-a-time autoregressive decoding.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'overview' ? '#38BDF8' : 'transparent',
              color: activeTab === 'overview' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. Dynamic compute graph and autoregression
          </button>
          <button
            onClick={() => setActiveTab('patchEncoder')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'patchEncoder' ? '#A78BFA' : 'transparent',
              color: activeTab === 'patchEncoder' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. Patch feature extraction (teaching view)
          </button>
          <button
            onClick={() => setActiveTab('pixelShuffle')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'pixelShuffle' ? '#10B981' : 'transparent',
              color: activeTab === 'pixelShuffle' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. 2×2 Pixel Shuffle token packing
          </button>
          <button
            onClick={() => setActiveTab('latentSpace')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'latentSpace' ? '#F59E0B' : 'transparent',
              color: activeTab === 'latentSpace' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            4. 7,168-d shared backbone space
          </button>
          <button
            onClick={() => setActiveTab('projector')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'projector' ? '#EC4899' : 'transparent',
              color: activeTab === 'projector' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            5. MoonViT-V2 &amp; MLP Projector forward flow
          </button>
        </div>
      </div>

      {/* TAB 1: THREE-PANEL SYNCHRONIZED INTERACTIVE CONSOLE WITH DYNAMIC COMPUTATION & AUTOREGRESSIVE ENGINE */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Controls: Dynamic Input Prompt & Autoregressive Decoder Step Controls */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            
            {/* Multimodal Prompt Inputs */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Prefix prompt:</label>
                <input
                  type="text"
                  value={prefixText}
                  onChange={(e) => setPrefixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem', width: '130px' }}
                />
              </div>

              <div style={{ background: 'rgba(167, 139, 250, 0.15)', border: '1px solid #A78BFA', padding: '6px 12px', borderRadius: '6px', color: '#A78BFA', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🖼️ [teaching image geometry]</span>
                <span style={{ fontSize: '0.75rem', background: '#0F172A', color: '#10B981', padding: '2px 6px', borderRadius: '4px' }}>2×2 packing: 4 ➔ 1 visual-token group</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Suffix prompt:</label>
                <input
                  type="text"
                  value={suffixText}
                  onChange={(e) => setSuffixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem', width: '130px' }}
                />
              </div>
            </div>

            {/* Autoregressive Step Control Button */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#0B0F19', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <span style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: 'bold' }}>
                ⏱️ Autoregressive step: {genStep === 0 ? 'Prefill' : `t = N+${genStep}`}
              </span>
              <button
                onClick={() => setGenStep((prev) => (prev < vocabSampleTokens.length ? prev + 1 : 0))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#F59E0B',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {genStep < vocabSampleTokens.length ? `↻ Predict next token from the 163,840 vocabulary (t=N+${genStep + 1})` : '🔄 Reset context'}
              </button>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '6px', background: '#0B0F19', padding: '4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setViewMode('analogy')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'analogy' ? '#38BDF8' : 'transparent',
                  color: viewMode === 'analogy' ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                💡 Analogy mode
              </button>
              <button
                onClick={() => setViewMode('math')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'math' ? '#A78BFA' : 'transparent',
                  color: viewMode === 'math' ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                📐 Technical mode
              </button>
            </div>

          </div>

          {/* 3-Panel Main Grid */}
          <div className="multimodal-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
            
            {/* PANEL 1: END-TO-END COMPUTATION GRAPH & AUTOREGRESSIVE ENGINE SVG */}
            <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
                  🎬 Panel 1: multimodal token flow and 163,840-vocabulary autoregressive graph
                </h3>
                <span style={{ fontSize: '0.85rem', background: '#0F172A', color: '#38BDF8', padding: '3px 10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  Step {stepIdx + 1}/{pipelineSteps.length}: {currentStep.title}
                </span>
              </div>

              {/* Step Navigation Strip */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px', background: '#0B0F19', borderRadius: '8px' }}>
                {pipelineSteps.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => { setStepIdx(idx); setIsPlaying(false); }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: idx === stepIdx ? (s.type === 'text' ? '#38BDF8' : s.type === 'decoder' ? '#EC4899' : '#A78BFA') : '#0F172A',
                      color: idx === stepIdx ? '#000' : '#94A3B8',
                      fontWeight: 'bold',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      border: idx === stepIdx ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.06)',
                      minWidth: '100px',
                      textAlign: 'center'
                    }}
                  >
                    <div>{s.title}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>{s.output}</div>
                  </div>
                ))}
              </div>
              <small style={{ color: '#64748B', lineHeight: '1.4' }}>Swipe or drag this step strip horizontally on a narrow screen; the active step below is enlarged in the explanation panel.</small>

              {/* Step Controls */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#0F172A', padding: '8px 12px', borderRadius: '6px' }}>
                <button
                  onClick={() => { setIsPlaying(false); setStepIdx((prev) => (prev > 0 ? prev - 1 : pipelineSteps.length - 1)); }}
                  style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ⏪ Previous step
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ background: isPlaying ? '#EF4444' : '#10B981', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isPlaying ? '⏸️ Pause animation' : '▶️ Play full flow'}
                </button>
                <button
                  onClick={() => { setIsPlaying(false); setStepIdx((prev) => (prev + 1) % pipelineSteps.length); }}
                  style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Next step ⏩
                </button>
              </div>

              <div aria-live="polite" style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <div style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>Current focus: {currentStep.title}</div>
                <div style={{ color: '#E2E8F0', marginTop: '4px', lineHeight: '1.45' }}>{currentStep.desc}</div>
                <div style={{ color: '#A78BFA', marginTop: '4px', fontFamily: 'monospace', fontSize: '0.9rem' }}>Output: {currentStep.output}</div>
              </div>

              {/* WIDESCREEN END-TO-END COMPUTATION & AUTOREGRESSIVE LOOPBACK GRAPH SVG */}
              <div style={{ background: '#02040a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <svg viewBox="0 0 940 500" width="100%" height="500">
                  <defs>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                    </marker>
                    <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                    </marker>
                    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                    </marker>
                    <marker id="arrow-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EC4899" />
                    </marker>
                    <marker id="arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                    </marker>
                    
                    {/* Linear Gradients for Flow Animation */}
                    <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* === SECTION 1: FORWARD ENCODING COMPUTE GRAPH (TOP HALF) === */}

                  {/* 1. TEXT PREFIX BRANCH: String -> Token ID -> W_emb Lookup */}
                  <g opacity={stepIdx === 0 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="20" y="20" width="160" height="95" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth={stepIdx === 0 ? 3 : 1.5} />
                    <text x="100" y="44" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">1. Prefix text</text>
                    <text x="100" y="64" fill="#FFF" fontSize="11" textAnchor="middle">"{prefixText}"</text>
                    <text x="100" y="80" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle">W_emb[ID] lookup</text>
                    <text x="100" y="96" fill="#FFF" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">x_prefix ∈ ℝ^(T1×7168)</text>
                  </g>

                  {/* 2. VISION BRANCH: patchify -> MoonViT-V2 -> Pixel Shuffle -> projector */}
                  <g opacity={stepIdx >= 1 && stepIdx <= 4 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="200" y="20" width="370" height="95" rx="8" fill="#0F172A" stroke="#A78BFA" strokeWidth={stepIdx >= 1 && stepIdx <= 4 ? 3 : 1.5} />
                    <text x="385" y="42" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">2. Vision branch (MoonViT-V2)</text>
                    <text x="385" y="62" fill="#FFF" fontSize="10" textAnchor="middle">14×14 patches ➔ visual features ➔ 2×2 Pixel Shuffle (tokens ÷ 4)</text>
                    <text x="385" y="80" fill="#10B981" fontSize="10" fontFamily="monospace" textAnchor="middle">projector ➔ 7,168-d shared space</text>
                    <text x="385" y="96" fill="#FFF" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">x_vis ∈ ℝ^7,168 (intermediate widths undisclosed)</text>
                  </g>

                  {/* 3. TEXT SUFFIX BRANCH: String -> Token ID -> W_emb Lookup */}
                  <g opacity={stepIdx === 0 || stepIdx === 5 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="590" y="20" width="160" height="95" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth={stepIdx === 5 ? 3 : 1.5} />
                    <text x="670" y="44" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">3. Suffix text</text>
                    <text x="670" y="64" fill="#FFF" fontSize="11" textAnchor="middle">"{suffixText}"</text>
                    <text x="670" y="80" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle">W_emb[ID] lookup</text>
                    <text x="670" y="96" fill="#FFF" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">x_suffix ∈ ℝ^(T2×7168)</text>
                  </g>

                  {/* === SECTION 2: INTERLEAVED SEQUENCE & BACKBONE (MIDDLE) === */}

                  {/* Flow lines merging down into sequence stream [Prefix Text -> Image -> Suffix Text] */}
                  <line x1="100" y1="115" x2="100" y2="185" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="100" y1="185" x2="160" y2="185" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow-blue)" />

                  <line x1="385" y1="115" x2="385" y2="185" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />

                  <line x1="670" y1="115" x2="670" y2="185" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="670" y1="185" x2="600" y2="185" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow-blue)" />

                  {/* 6. Interleaved physical sequence bar [prefix ➔ visual tokens ➔ suffix] */}
                  <g opacity={stepIdx === 5 || stepIdx === 0 || stepIdx === 4 ? 1 : 0.75} style={{ transition: 'all 0.3s' }}>
                    <rect x="120" y="195" width="620" height="95" rx="8" fill="rgba(15, 23, 42, 0.95)" stroke="#10B981" strokeWidth={stepIdx === 5 ? 3 : 2} />
                    <text x="430" y="218" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                      Stream X = [x_prefix, x_vis, x_suffix] ➔ 93-layer backbone
                    </text>

                    {/* Sequential Order Visual Blocks (Strictly: Prefix Text -> 1 Image Token -> Suffix Text -> Single Next Token y_t) */}
                    <g transform="translate(135, 235)">
                      {/* Block 1: Prefix Text */}
                      <rect x="0" y="0" width="130" height="32" rx="4" fill="#38BDF8" />
                      <text x="65" y="16" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">1. Prefix text</text>
                      <text x="65" y="27" fill="#000" fontSize="8" textAnchor="middle">"{prefixText}"</text>

                      {/* Arrow */}
                      <text x="138" y="20" fill="#94A3B8" fontSize="12">➔</text>

                      {/* Block 2: 1 Image Token */}
                      <rect x="154" y="0" width="170" height="32" rx="4" fill="#10B981" />
                      <text x="239" y="16" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">2. Visual-token group</text>
                      <text x="239" y="27" fill="#000" fontSize="8" textAnchor="middle">Pixel Shuffle: token count ÷ 4</text>

                      {/* Arrow */}
                      <text x="330" y="20" fill="#94A3B8" fontSize="12">➔</text>

                      {/* Block 3: Suffix Text */}
                      <rect x="346" y="0" width="130" height="32" rx="4" fill="#38BDF8" />
                      <text x="411" y="16" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">3. Suffix text</text>
                      <text x="411" y="27" fill="#000" fontSize="8" textAnchor="middle">"{suffixText}"</text>

                      {/* Autoregressive Appended Single Token y_t (1 single next token per step) */}
                      {genStep > 0 && (
                        <>
                          <text x="482" y="20" fill="#F59E0B" fontSize="12">➔</text>
                          <g transform="translate(496, 0)">
                            <rect x="0" y="0" width="90" height="32" rx="4" fill="#F59E0B" />
                            <text x="45" y="16" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">Next Token y_t</text>
                            <text x="45" y="27" fill="#000" fontSize="8" fontFamily="monospace" textAnchor="middle">one token from 163,840</text>
                          </g>
                        </>
                      )}
                    </g>
                  </g>

                  {/* === SECTION 3: AUTOREGRESSIVE VOCABULARY DECODING GRAPH & LOOPBACK === */}
                  <line x1="430" y1="325" x2="430" y2="355" stroke="#EC4899" strokeWidth="2.5" markerEnd="url(#arrow-pink)" />

                  {/* 7. DECODING PIPELINE BOX */}
                  <g opacity={stepIdx === 6 || genStep > 0 ? 1 : 0.6} style={{ transition: 'all 0.3s' }}>
                    <rect x="60" y="360" width="740" height="100" rx="8" fill="rgba(236, 72, 153, 0.1)" stroke="#EC4899" strokeWidth={stepIdx === 6 ? 3 : 1.5} />
                    <text x="430" y="384" fill="#EC4899" fontSize="14" fontWeight="bold" textAnchor="middle">
                      7. One-step 163,840-vocabulary decoding and autoregressive append
                    </text>

                    {/* Left Decoder Branch: 163,840 Vocabulary Text Decoding */}
                    <g transform="translate(80, 396)">
                      <rect x="0" y="0" width="310" height="52" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                      <text x="155" y="20" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">🔤 W_unembed [163,840×7,168] logits</text>
                      <text x="155" y="38" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">
                        {genStep === 0 ? 'h_t ➔ 163,840 logits ➔ Softmax ➔ sample 1 token' : `sampled token (t=N+${genStep}): ${vocabSampleTokens[genStep - 1]?.token}`}
                      </text>
                    </g>

                    {/* Right Decoder Branch: Sampling & Selection */}
                    <g transform="translate(420, 396)">
                      <rect x="0" y="0" width="360" height="52" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
                      <text x="180" y="20" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">🎲 Temperature Softmax &amp; Top-p Sampling</text>
                      <text x="180" y="38" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">P(y_t) = Softmax(z/T) ➔ categorical sampling</text>
                    </g>
                  </g>

                  {/* === AUTOREGRESSIVE GOLDEN LOOPBACK ARROW (Loopback Arc) === */}
                  <path
                    d="M 235 448 C 30 448, 30 280, 130 280"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                    markerEnd="url(#arrow-gold)"
                  />
                  <rect x="25" y="350" width="135" height="26" rx="4" fill="#F59E0B" />
                  <text x="92" y="367" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">
                    ↺ append one sampled token to the context
                  </text>
                </svg>

                <div style={{ background: '#0F172A', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', color: '#94A3B8', marginTop: '6px' }}>
                  💡 <b>Report-grounded facts and architecture invariants:</b>
                  <br />
                  1. <b>Visual-token count</b>: MoonViT-V2 applies 14×14 patchification and 2×2 Pixel Shuffle, which downsamples spatial visual-tokens by 4× before the 2-layer MLP projector.
                  <br />
                  2. <b>One-token autoregression</b>: at each decoding step, W_unembed scores the <b>163,840-token vocabulary (160K display)</b>, one next token is sampled and appended to the context for the next autoregressive step.
                </div>
              </div>

            </div>

            {/* PANEL 2: SYNCHRONIZED MATH / CS ANALOGY */}
            <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <h3 style={{ fontSize: '1.1rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
                {viewMode === 'analogy' ? '💡 Panel 2: software-engineering analogy' : '📐 Panel 2: technical formulas and code'}
              </h3>

              {viewMode === 'analogy' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #38BDF8' }}>
                    <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>🔤 Text embedding: SQL primary-key lookup</span>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      Like retrieving a pre-stored 7,168-d floating-point row by an ID: a discrete lookup, not a learned image transformation.
                    </p>
                  </div>

                  <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #A78BFA' }}>
                    <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>🖼️ Vision projection: learned feature mapping</span>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      The report-grounded path is patchification → MoonViT-V2 feature extraction → 2×2 Pixel Shuffle → a projector into the shared 7,168-d backbone space. The detailed 512-channel example is teaching-only.
                    </p>
                  </div>

                  <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #F59E0B' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.95rem' }}>↺ Autoregressive loopback: iterator and queue append</span>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      Like a generator iterator: each sampled y_t is appended with `queue.append(y_t)` and becomes input to the next decoding step.
                    </p>
                  </div>

                  {/* Strict Boundary Note */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #EF4444' }}>
                    <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.9rem' }}>⚠️ Physical boundaries and important distinctions:</span>
                    <p style={{ color: '#CBD5E1', fontSize: '0.85rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      Text uses a <b>discrete embedding lookup</b>; vision uses a <b>continuous learned projection into the backbone space</b>; autoregression <b>selects one token per step and updates the context / cache</b>.
                    </p>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '6px' }}>// Forward path and autoregressive decoding:</div>
                    <div style={{ color: '#38BDF8', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                      e_text = W_emb[token_id]  ∈ ℝ^(7,168)
                    </div>
                    <div style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '0.92rem', marginTop: '4px' }}>
                      e_img = Projector(PixelShuffle(MoonViT_V2(Patchify(image))))  ∈ ℝ^(7,168)
                    </div>
                    <div style={{ color: '#F59E0B', fontFamily: 'monospace', fontSize: '0.92rem', marginTop: '4px' }}>
                      y_(t+1) = Softmax(W_unembed · h_t), Append y_(t+1) to Context
                    </div>
                  </div>

                  <div style={{ background: '#0B0F19', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ color: '#64748B', marginBottom: '4px' }}># PyTorch-style forward path and autoregressive loopback:</div>
                    <div style={{ color: stepIdx === 0 ? '#38BDF8' : '#64748B' }}>x_txt = self.w_emb(text_ids)  # [B, T_txt, 7168]</div>
                    <div style={{ color: stepIdx === 2 ? '#10B981' : '#64748B' }}>f_vit = self.moonvit_v2(patches)  # [B, N, 1024] (27 layers, hidden 1024)</div>
                    <div style={{ color: stepIdx === 3 ? '#F59E0B' : '#64748B' }}>v = pixel_shuffle(f_vit, r=2)     # [B, N/4, 4096] (4x spatial downsampling)</div>
                    <div style={{ color: stepIdx === 4 ? '#10B981' : '#64748B' }}>x_img = self.projector(v)         # [B, N/4, 7168] (MLP 4096-&gt;4096-&gt;7168)</div>
                    <div style={{ color: genStep > 0 ? '#F59E0B' : '#64748B' }}># Autoregressive loopback:</div>
                    <div style={{ color: genStep > 0 ? '#F59E0B' : '#64748B' }}>y_next = torch.argmax(self.w_unembed(h_t))</div>
                    <div style={{ color: genStep > 0 ? '#F59E0B' : '#64748B' }}>seq_stream.append(self.w_emb(y_next))</div>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* PANEL 3: ABLATION SANDBOX FOR PIXEL SHUFFLE */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#10B981', margin: 0, fontWeight: 'bold' }}>
                📊 Panel 3: why use 2×2 Pixel Shuffle? (ablation sandbox)
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0F172A', padding: '4px 12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: '#FFF' }}>Teaching image resolution:</span>
                <input
                  type="range"
                  min="28"
                  max="224"
                  step="28"
                  value={imgRes}
                  onChange={(e) => setImgRes(Number(e.target.value))}
                  style={{ width: '120px' }}
                />
                <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>{imgRes}×{imgRes} px</span>
              </div>
              <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.45)', background: 'rgba(167, 139, 250, 0.1)', color: '#DDD6FE', fontSize: '0.82rem', lineHeight: '1.45' }}>
                <b>Scale note:</b> this is a teaching canvas limited to 224 px. The K3 report describes inputs up to <b>3,584×3,584 px</b>; with 14×14 patches and 2×2 Pixel Shuffle, one image goes from 65,536 patch tokens to 16,384 visual tokens before other context overhead.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              
              {/* Without Pixel Shuffle */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.95rem' }}>Patch tokens (without 2×2 packing)</span>
                  <span style={{ color: '#EF4444', fontFamily: 'monospace', fontWeight: 'bold' }}>{(imgRes / 14) ** 2} visual tokens</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                  Each 14×14 patch remains a separate token in this comparison. Attention cost scales quadratically with sequence length; the exact end-to-end multiplier depends on the surrounding sequence and implementation.
                </p>
              </div>

              {/* With 2x2 Pixel Shuffle */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>Kimi K3 (2×2 Pixel Shuffle)</span>
                  <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>{((imgRes / 14) ** 2) / 4} visual tokens (count ÷ 4)</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                  The report confirms that 2×2 Pixel Shuffle reduces visual-token count by 4×. The intermediate channel width and any exact quality tradeoff are not disclosed here, so this sandbox illustrates the count relationship only.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PATCH FEATURE EXTRACTION TEACHING SIMULATOR */}
      {activeTab === 'patchEncoder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🔬 Teaching example: how can a 14×14×3 (588-value) patch become a visual feature vector?
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              A 14×14 RGB patch contains 14×14×3 = 588 input values. This panel keeps the original filter-by-filter interaction as a <b>teaching example</b>. K3’s report identifies MoonViT-V2 and the 14×14 patch size, but does not publish a 512-channel Conv2d stage, so 512 must not be read as a K3 parameter.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Left: 14x14 Patch RGB Visualizer */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>1. Raw 14×14 RGB patch (588 input values)</span>
              
              <div style={{ width: '220px', height: '220px', background: '#000', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '1px', padding: '4px', border: '1px solid #334155' }}>
                {Array.from({ length: 196 }).map((_, idx) => {
                  const row = Math.floor(idx / 14);
                  const col = idx % 14;
                  const r = Math.floor(200 - row * 8);
                  const g = Math.floor(100 + col * 10);
                  const b = 220;
                  return (
                    <div
                      key={idx}
                      style={{ background: `rgb(${r},${g},${b})` }}
                      title={`Pixel (${row},${col}): RGB(${r},${g},${b})`}
                    />
                  );
                })}
              </div>

              <div style={{ fontSize: '0.95rem', color: '#94A3B8', textAlign: 'center' }}>
                Pixel values: 196 × 3 channels = <b>588 input values</b>
              </div>
            </div>

            {/* Right: 512 Filter Selector & Output Inspection */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>2. Example filter bank (512 filters; teaching-only)</span>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', color: '#94A3B8' }}>Select filter index:</span>
                <input
                  type="range"
                  min="0"
                  max="511"
                  value={selectedFilterIdx}
                  onChange={(e) => setSelectedFilterIdx(parseInt(e.target.value))}
                  style={{ width: '200px' }}
                />
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'monospace' }}>
                  Filter #{selectedFilterIdx + 1} / 512 (illustrative)
                </span>
              </div>

              {/* Active Filter Details */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: '#FFF', fontWeight: 'bold' }}>Example filter role:</span>
                  <span style={{ color: '#38BDF8' }}>
                    {selectedFilterIdx % 4 === 0 && '🔍 vertical-edge detector'}
                    {selectedFilterIdx % 4 === 1 && '🎨 blue-green contrast detector'}
                    {selectedFilterIdx % 4 === 2 && 'texture-gradient detector'}
                    {selectedFilterIdx % 4 === 3 && '☀️ brightness-gradient detector'}
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#94A3B8' }}>
                  Each example filter has <b>14×14×3 = 588 learned weights</b>. One dot product produces <b>one feature scalar</b> in this teaching model.
                </div>
                <div style={{ fontSize: '1.1rem', color: '#A78BFA', fontWeight: 'bold', marginTop: '4px', fontFamily: 'monospace' }}>
                  Example output value [{selectedFilterIdx}] = {(Math.sin(selectedFilterIdx * 0.4) * 0.85 + 0.12).toFixed(4)}
                </div>
              </div>

              {/* Resulting 512d Vector Bar */}
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '1rem', color: '#FFF', fontWeight: 'bold' }}>3. Example patch feature vector (v_t ∈ ℝ^512)</span>
                <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const isActive = Math.abs(idx * 16 - selectedFilterIdx) < 16;
                    const val = Math.sin(idx * 0.5);
                    const opacity = Math.abs(val);
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          background: isActive ? '#A78BFA' : `rgba(167, 139, 250, ${opacity * 0.6 + 0.1})`,
                          borderRight: '1px solid rgba(0,0,0,0.3)',
                          cursor: 'pointer'
                        }}
                        title={`Dimension [${idx * 16} ~ ${idx * 16 + 15}]`}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px', fontFamily: 'monospace' }}>
                  <span>Index 0</span>
                  <span>Index 255</span>
                  <span>Index 511</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 2x2 PIXEL SHUFFLE SIMULATOR */}
      {activeTab === 'pixelShuffle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧩 2×2 Pixel Shuffle token packing (count relationship; widths are illustrative)
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              Pixel Shuffle groups four spatially adjacent patch features into one group. The report confirms the <b>2×2 grouping and 4× reduction in visual-token count</b>; the 512-d and 2,048-d values below remain an explicit teaching example, not disclosed K3 dimensions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
            {/* Left: 2x2 Grid of 14x14 Patches (28x28 Region) */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>Teaching region (four adjacent patches)</span>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#0B0F19', padding: '10px', borderRadius: '6px', border: '1px solid #10B981' }}>
                {samplePatches.map((patch, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPatchGroup(idx)}
                    style={{
                      background: patch.color + '22',
                      border: `2px solid ${patch.color}`,
                      borderRadius: '6px',
                      padding: '16px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxShadow: selectedPatchGroup === idx ? `0 0 12px ${patch.color}` : 'none'
                    }}
                  >
                    <span style={{ color: patch.color, fontWeight: 'bold', fontSize: '0.95rem' }}>Patch {idx + 1}</span>
                    <span style={{ color: '#FFF', fontSize: '0.85rem', marginTop: '4px' }}>14×14 px</span>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '2px' }}>ℝ^512 (example)</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.4' }}>
                💡 Click any patch to inspect its 512-value example segment on the right.
              </div>
            </div>

            {/* Right: Merged 2,048d Vector Visualizer */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>Packed example vector structure</span>

              {/* 4 Segment Blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {samplePatches.map((patch, idx) => {
                  const isSelected = selectedPatchGroup === idx;
                  const startDim = idx * 512;
                  const endDim = (idx + 1) * 512 - 1;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPatchGroup(idx)}
                      style={{
                        background: isSelected ? patch.color + '33' : '#0F172A',
                        border: `1.5px solid ${patch.color}`,
                        borderRadius: '6px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <span style={{ color: patch.color, fontWeight: 'bold', fontSize: '1rem' }}>
                          [{startDim} ~ {endDim}] ({patch.name})
                        </span>
                        <div style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '2px' }}>
                          Contains the example feature segment for Patch {idx + 1}; packing is a rearrangement in this simulator, not a claim of lossless K3 reconstruction.
                        </div>
                      </div>
                      <span style={{ background: patch.color, color: '#000', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        512 values (example)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Box */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', padding: '12px 16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '1rem' }}>
                  2×2 packed example vector:
                </span>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  512 + 512 + 512 + 512 = 2,048 values (example)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNIFIED 7,168d LATENT SPACE */}
      {activeTab === 'latentSpace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📐 7,168-d shared backbone space (latent geometry and alignment)
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              Text embeddings and projected visual features enter the same 7,168-d backbone space. The exact visual projector internals are not disclosed. The similarity values below are illustrative; the 93-layer backbone uses attention and other operators to integrate the modalities, rather than guaranteeing a particular cosine score.
            </p>
          </div>

          {/* Latent Space Interactive Inspection Canvas */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>
              Illustrative cosine similarity and attention dot-product alignment
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
              {/* Pair 1: Text "cat" vs Image Patch (Cat Ear) */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #10B981', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>Text: "cat" (x_text)</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>Vision: cat-ear patch (x_vis)</span>
                </div>
                <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '92.4%', background: '#10B981', height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Illustrative 7,168-d dot-product similarity:</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>0.924 (example)</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                  💡 This example shows how a text query could align with a relevant visual feature. It is not a measured K3 activation or attention map.
                </p>
              </div>

              {/* Pair 2: Text "cat" vs Image Patch (Sky Background) */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #64748B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>Text: "cat" (x_text)</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>Vision: sky-background patch</span>
                </div>
                <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '12.8%', background: '#64748B', height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Illustrative 7,168-d dot-product similarity:</span>
                  <span style={{ color: '#64748B', fontWeight: 'bold', fontFamily: 'monospace' }}>0.128 (example)</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                  💡 This example contrasts a relevant and irrelevant feature. Real attention weights depend on the input and learned parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MOONVIT-V2 & MLP PROJECTOR FORWARD FLOW */}
      {activeTab === 'projector' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Banner Clarifying Forward Multimodal Architecture */}
          <div style={{ background: '#070913', padding: '16px 20px', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>👁️</span>
                <h3 style={{ fontSize: '1.2rem', color: '#EC4899', margin: 0, fontWeight: 'bold' }}>
                  Forward Vision Pipeline: MoonViT-V2 ➔ 2×2 Pixel Shuffle ➔ MLP Projector
                </h3>
              </div>
              <span style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid #EC4899', padding: '3px 10px', borderRadius: '12px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                Pure Forward Multimodal LLM (No Inverse Image Decoder)
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: '8px 0 0 0', lineHeight: '1.5' }}>
              Kimi-K3 does not employ an inverse image reconstruction decoder (e.g. <code>ConvTranspose2d</code>). It is an autoregressive generative model: visual tokens are extracted forward, compressed by 4× via 2×2 Pixel Shuffle, projected into the 7,168-d language space, and concatenated into the sequence to autoregressively decode text/reasoning tokens via the 163,840-token vocabulary.
            </p>
          </div>

          {/* Interactive Resolution & Pipeline Configurator */}
          <div style={{ background: '#070913', padding: '18px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '1rem' }}>Input Resolution (H × W):</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { label: '224×224 (Fast)', val: 224 },
                    { label: '448×448 (Standard)', val: 448 },
                    { label: '896×896 (High-Res)', val: 896 },
                    { label: '3584×3584 (Max K3)', val: 3584 }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setProjRes(preset.val)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: projRes === preset.val ? '1px solid #EC4899' : '1px solid rgba(255,255,255,0.1)',
                        background: projRes === preset.val ? 'rgba(236, 72, 153, 0.2)' : '#0F172A',
                        color: projRes === preset.val ? '#FFF' : '#94A3B8',
                        fontWeight: projRes === preset.val ? 'bold' : 'normal',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Compression Metric Badge */}
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', padding: '6px 14px', borderRadius: '8px', color: '#10B981', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                ⚡ 4× Sequence Compression: <b>{((projRes / 14) ** 2).toLocaleString()}</b> patches ➔ <b>{(((projRes / 14) ** 2) / 4).toLocaleString()}</b> LLM tokens
              </div>
            </div>

            {/* Visual Pipeline Stage Flow Diagram */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
              {[
                {
                  step: 1,
                  title: '1. 14×14 Patchify',
                  color: '#38BDF8',
                  tensor: `[${((projRes / 14) ** 2).toLocaleString()}, 588]`,
                  desc: `Patches: ${(projRes / 14)}×${(projRes / 14)} = ${((projRes / 14) ** 2).toLocaleString()} (14×14×3 values/patch)`
                },
                {
                  step: 2,
                  title: '2. MoonViT-V2',
                  color: '#A78BFA',
                  tensor: `[${((projRes / 14) ** 2).toLocaleString()}, 1024]`,
                  desc: '401M params, 27 layers, 1024-d, 12 heads. Shared image/video encoder'
                },
                {
                  step: 3,
                  title: '3. 2×2 Pixel Shuffle',
                  color: '#10B981',
                  tensor: `[${(((projRes / 14) ** 2) / 4).toLocaleString()}, 4096]`,
                  desc: '4× spatial compression: 4 patches packed into one 4,096-d token'
                },
                {
                  step: 4,
                  title: '4. 2-Layer MLP Projector',
                  color: '#EC4899',
                  tensor: `[${(((projRes / 14) ** 2) / 4).toLocaleString()}, 7168]`,
                  desc: 'MLP: 4096 ➔ 4096 ➔ 7168. Linear + GELU + Linear projection'
                },
                {
                  step: 5,
                  title: '5. LLM Backbone Stream',
                  color: '#F59E0B',
                  tensor: '[T_total, 7168]',
                  desc: 'Interleaved with text tokens into Stream X ➔ 93-layer backbone ➔ Vocab logits'
                }
              ].map((stage) => {
                const isSelected = selectedProjStage === stage.step;
                return (
                  <div
                    key={stage.step}
                    onClick={() => setSelectedProjStage(stage.step)}
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.06)' : '#090D16',
                      border: isSelected ? `2px solid ${stage.color}` : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: stage.color, fontWeight: 'bold', fontSize: '0.9rem' }}>{stage.title}</span>
                      <span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#FFF' }}>
                        Step {stage.step}
                      </span>
                    </div>
                    <div style={{ color: '#FFF', fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>
                      Tensor: {stage.tensor}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.8rem', lineHeight: '1.4' }}>
                      {stage.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Stage Deep-Dive Card */}
            <div style={{ background: '#090D16', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '6px' }}>
              {selectedProjStage === 1 && (
                <div>
                  <h4 style={{ color: '#38BDF8', margin: '0 0 8px 0', fontSize: '1.05rem' }}>📐 Stage 1: 14×14 Patchification Details</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                    The input image of resolution {projRes}×{projRes} with 3 color channels is split into non-overlapping 14×14 patches.
                    Total patches: <code>({projRes} / 14) × ({projRes} / 14) = {((projRes / 14) ** 2).toLocaleString()}</code> patches.
                    Each patch contains 14 × 14 × 3 = 588 raw RGB values, linearly projected into the 1,024-d MoonViT-V2 embedding space.
                  </p>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '0.85rem', color: '#38BDF8' }}>
                    <span>• Patch size: 14×14 px</span>
                    <span>• Patch grid: {projRes / 14} × {projRes / 14}</span>
                    <span>• Patch dimension: 588-d</span>
                  </div>
                </div>
              )}

              {selectedProjStage === 2 && (
                <div>
                  <h4 style={{ color: '#A78BFA', margin: '0 0 8px 0', fontSize: '1.05rem' }}>🔮 Stage 2: MoonViT-V2 Vision Transformer Specification</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                    MoonViT-V2 is a dedicated 401M-parameter vision foundation model trained from scratch. It features 27 Transformer encoder layers with hidden dimension 1,024, QKV projection width 1,536, and 12 attention heads (head dim 128 = 1,536 / 12). It uses factorized spatial and temporal self-attention to process both static images and dynamic video clips with unified parameters.
                  </p>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '0.85rem', color: '#A78BFA' }}>
                    <span>• Parameters: 401M</span>
                    <span>• Depth: 27 Layers</span>
                    <span>• Hidden Dim: 1,024</span>
                    <span>• Heads: 12 (qkv width: 1,536, head dim: 128)</span>
                    <span>• Output: [{((projRes / 14) ** 2).toLocaleString()}, 1,024]</span>
                  </div>
                </div>
              )}

              {selectedProjStage === 3 && (
                <div>
                  <h4 style={{ color: '#10B981', margin: '0 0 8px 0', fontSize: '1.05rem' }}>🔀 Stage 3: 2×2 Pixel Shuffle Spatial Downsampling</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                    Processing all raw visual patches through the 93-layer language backbone would cause quadratic attention compute bottlenecks. 2×2 Pixel Shuffle packs groups of 2×2 adjacent visual tokens into a single combined token:
                    the spatial sequence length shrinks strictly by <b>4×</b> (from {((projRes / 14) ** 2).toLocaleString()} down to {(((projRes / 14) ** 2) / 4).toLocaleString()} tokens), while the channel dimension expands from 1,024 to <b>4,096</b> (1,024 × 4).
                  </p>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10B981' }}>
                    <span>• Sequence length reduction: 75% savings</span>
                    <span>• Channel expansion: 1,024 ➔ 4,096</span>
                    <span>• Packed token count: {(((projRes / 14) ** 2) / 4).toLocaleString()}</span>
                    <span>• Information loss: 0% (lossless spatial reshape)</span>
                  </div>
                </div>
              )}

              {selectedProjStage === 4 && (
                <div>
                  <h4 style={{ color: '#EC4899', margin: '0 0 8px 0', fontSize: '1.05rem' }}>🚀 Stage 4: 2-Layer MLP Projector Specification</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                    A two-layer multi-layer perceptron (MLP) bridges the vision encoder representation with Kimi-K3’s 7,168-dimensional language backbone hidden state space.
                    The projection computes: <code>x_img = RMSNorm(W₂ · GELU(W₁ · v_packed))</code> where <code>W₁ ∈ ℝ^(4096×4096)</code> and <code>W₂ ∈ ℝ^(7168×4096)</code>, followed by an output RMSNorm (matching official <code>modeling_kimi_k3.py</code> reference implementation).
                  </p>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '0.85rem', color: '#EC4899' }}>
                    <span>• Layer 1: 4,096 ➔ 4,096 with non-linear activation</span>
                    <span>• Layer 2: 7,168 × 4,096 matrix projection (LLM hidden dim 7,168)</span>
                    <span>• Normalization: Output RMSNorm(7,168)</span>
                    <span>• Output: [{(((projRes / 14) ** 2) / 4).toLocaleString()}, 7,168]</span>
                  </div>
                </div>
              )}

              {selectedProjStage === 5 && (
                <div>
                  <h4 style={{ color: '#F59E0B', margin: '0 0 8px 0', fontSize: '1.05rem' }}>🔄 Stage 5: Interleaving &amp; 163,840-Vocabulary Autoregressive Decoding</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                    The projected visual tokens are seamlessly concatenated with text tokens (prefix and suffix prompt embeddings) into a unified sequence Stream X.
                    The combined sequence flows through K3’s 93-layer backbone (MLA / MoE / KDA / AttnRes). At each generation step, the final hidden state <code>h_t ∈ ℝ^7,168</code> is multiplied by the unembedding matrix <code>W_unembed ∈ ℝ^(163,840×7,168)</code> to yield 163,840 logits, from which the next text token is sampled.
                  </p>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '0.85rem', color: '#F59E0B' }}>
                    <span>• Vocabulary Size: 163,840 tokens</span>
                    <span>• Unembedding Matrix: [163,840 × 7,168]</span>
                    <span>• Autoregressive Loop: Sample token ➔ Append to context ↺ Repeat</span>
                  </div>
                </div>
              )}
            </div>

            {/* PyTorch-style implementation snippet */}
            <div style={{ background: '#0B0F19', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '0.82rem', color: '#E2E8F0', overflowX: 'auto' }}>
              <div style={{ color: '#64748B', marginBottom: '6px' }}># Official Kimi-K3 forward vision encoding &amp; projection pipeline (reference implementation):</div>
              <div style={{ color: '#38BDF8' }}>patches = patchify(image, patch_size=14)                     # [B, N_patch={((projRes / 14) ** 2).toLocaleString()}, 588]</div>
              <div style={{ color: '#A78BFA' }}>f_vit = self.moonvit_v2(patches)                             # [B, N_patch={((projRes / 14) ** 2).toLocaleString()}, 1024] (27 layers, 12 heads, head_dim 128)</div>
              <div style={{ color: '#10B981' }}>v_down = pixel_shuffle_downsample(f_vit, scale=2)            # [B, N_visual={(((projRes / 14) ** 2) / 4).toLocaleString()}, 4096] (4x compression)</div>
              <div style={{ color: '#EC4899' }}>x_img = self.projector_norm(self.projector(v_down))         # [B, N_visual={(((projRes / 14) ** 2) / 4).toLocaleString()}, 7168] (MLP + RMSNorm)</div>
              <div style={{ color: '#F59E0B' }}>seq_stream = torch.cat([x_prefix, x_img, x_suffix], dim=1)  # [B, T_total, 7168]</div>
              <div style={{ color: '#94A3B8', marginTop: '4px' }}># ➔ 93-layer backbone ➔ w_unembed(h_t) [B, 163,840] ➔ next token generation</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
