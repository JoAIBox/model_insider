import React, { useState, useRef } from 'react';

export const PreTrainingSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [sliderVal, setSliderVal] = useState<number>(3); // 1 = K1, 2 = K2, 3 = K3
  const [hoveredSpecCard, setHoveredSpecCard] = useState<number | null>(null);

  // Interactive Scaling Law coordinates state
  const [lawCoords, setLawCoords] = useState<{ x: number; y: number; flop: string; loss: string } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Curriculum stages details
  const curriculumStages = [
    { 
      name: "Stage 1 (Pre-Training)", 
      length: "8 K Context", 
      params: "2.78T Total Params (104B Active)",
      loss: "1.82",
      ratios: [
        { label: "CN/EN Web Pages", val: 55, color: '#38BDF8' },
        { label: "Math & Code", val: 25, color: '#10B981' },
        { label: "Images & Multimodal", val: 20, color: '#FFB000' }
      ]
    },
    { 
      name: "Stage 2 (Pre-Training)", 
      length: "64 K Context", 
      params: "2.78T Total Params (104B Active)",
      loss: "1.45",
      ratios: [
        { label: "Long Text & Web", val: 50, color: '#38BDF8' },
        { label: "Math & Code", val: 22, color: '#10B981' },
        { label: "Multimodal & Long Video", val: 28, color: '#FFB000' }
      ]
    },
    { 
      name: "Stage 3 (Cooldown)", 
      length: "256 K Context", 
      params: "2.78T Total Params (104B Active)",
      loss: "1.18",
      ratios: [
        { label: "Multimodal Long Context", val: 40, color: '#38BDF8' },
        { label: "Synthetic Academic Reasoning", val: 35, color: '#10B981' },
        { label: "Extremely Long Dependencies", val: 25, color: '#FFB000' }
      ]
    },
    { 
      name: "Stage 4 (Cooldown)", 
      length: "1 M Context (Limit)", 
      params: "2.78T Total Params (104B Active)",
      loss: "0.98",
      ratios: [
        { label: "Ultra-Long Articles", val: 30, color: '#38BDF8' },
        { label: "Complex Reasoning/Code", val: 40, color: '#10B981' },
        { label: "Long Video & Multimodal", val: 30, color: '#FFB000' }
      ]
    }
  ];

  // Card comparison data replacing the massive table
  const specCards = [
    { label: "Layers (#Layers)", k2: "61 Layers", k3: "93 Layers", desc: "↑ 52% layers extension, elevating abstract representation of deep semantic features." },
    { label: "Total Parameters (Total Params)", k2: "1.04 T", k3: "2.78 T", desc: "↑ 167% scale jump to store massive prior world knowledge across modalities." },
    { label: "Activated Parameters (Activated Params)", k2: "32.6 B", k3: "104.2 B", desc: "↑ 220% active size, increasing inference compute capacity per token." },
    { label: "MoE Latent Space (Latent MoE)", k2: "N/A", k3: "3,584-dim (0.5x)", desc: "Compresses feature dimensions before routing, cutting GPU network bandwidth in half." },
    { label: "Limit Context Length (Context)", k2: "128 K", k3: "1 M (1 Million)", desc: "↑ 800% limit leap, combined with constant KDA memory to sustain 1M context windows." },
    { label: "Vision Encoder Evolution (ViT)", k2: "Not specified in K3 comparison; K2.5: SigLIP-initialized", k3: "401M MoonViT-V2 (from scratch)", desc: "The K3 report leaves K2's ViT field unspecified, describes SigLIP initialization as prior K2.5 practice, and reports MoonViT-V2 as trained from scratch for K3." }
  ];

  // Handle Scaling Law SVG interactions
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x >= 50 && x <= 450) {
      // Calculate mock flops and loss values based on mouse position
      const progress = (x - 50) / 400; // 0 to 1
      const logFlops = (18 + progress * 8).toFixed(1);
      const lossVal = (2.2 - progress * 1.3).toFixed(2);
      
      setLawCoords({
        x,
        y: 40 + (1.2 - progress * 0.9) * 80, // follow the curve line
        flop: `10^${logFlops} FLOPs`,
        loss: lossVal
      });
    }
  };

  // Calculate bubble sizes for parameter scale comparison
  const getBubbleSize = (agent: 'k2' | 'k3') => {
    if (agent === 'k2') {
      // base size on sliderVal
      const sizeMultiplier = sliderVal === 1 ? 0.3 : sliderVal === 2 ? 0.7 : 0.7;
      return sizeMultiplier * 90;
    } else {
      const sizeMultiplier = sliderVal === 1 ? 0.35 : sliderVal === 2 ? 0.75 : 1.3;
      return sizeMultiplier * 90;
    }
  };

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 3 - Pre-Training & System Scale</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Kimi-K3 Pre-training Data, Architectural Evolution & Long Context</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        Kimi-K3 achieves a 2.5x overall scaling efficiency improvement over Kimi-K2, adopting native multimodal joint optimization, new SiTU-GLU activations, and a 4-stage progressive long-context context extension schedule.
      </p>

      <div className="grid-2" style={{ gap: '20px', alignItems: 'stretch' }}>
        
        {/* Card Specs grid - Hover details */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>📈 Core Spec Upgrade Cards (Hover to view details)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {specCards.map((card, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredSpecCard(idx)}
                onMouseLeave={() => setHoveredSpecCard(null)}
                style={{
                  background: hoveredSpecCard === idx ? 'rgba(56, 189, 248, 0.06)' : 'rgba(255,255,255,0.02)',
                  border: hoveredSpecCard === idx ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.05)',
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '1.02rem', color: '#94A3B8', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.02rem', color: '#FFB000' }}>K2: {card.k2}</span>
                  <span style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: 'bold' }}>K3: {card.k3}</span>
                </div>
                {hoveredSpecCard === idx && (
                  <div style={{ fontSize: '1.15rem', color: '#E2E8F0', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', lineHeight: '1.4' }}>
                    {card.desc}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bubble Parameter Size Comparison (Slider driven) */}
        <div className="card">
          <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🎈 K2 vs. K3 Parameter Capacity Bubble Chart</h3>
          
          {/* Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>Evolution Phase:</span>
            <input 
              type="range" 
              min="1" 
              max="3" 
              value={sliderVal}
              onChange={(e) => setSliderVal(parseInt(e.target.value))}
              style={{ flex: 1, cursor: 'pointer', accentColor: '#10B981' }}
            />
            <span style={{ fontSize: '1.02rem', color: '#10B981', fontWeight: 'bold', width: '30px' }}>
              {sliderVal === 1 ? 'K1' : sliderVal === 2 ? 'K2' : 'K3'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '160px', background: '#02040a', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: `${getBubbleSize('k2')}px`, 
                  height: `${getBubbleSize('k2')}px`, 
                  borderRadius: '50%', 
                  background: 'rgba(56, 189, 248, 0.2)', 
                  border: '2px solid #38BDF8',
                  transition: 'width 0.3s, height 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ color: '#FFF', fontSize: '1.15rem', fontWeight: 'bold' }}>
                  {sliderVal === 1 ? '300B' : sliderVal === 2 ? '1.04T' : '1.04T'}
                </span>
              </div>
              <span style={{ fontSize: '1.02rem', color: '#94A3B8', marginTop: '8px' }}>Kimi K2</span>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: `${getBubbleSize('k3')}px`, 
                  height: `${getBubbleSize('k3')}px`, 
                  borderRadius: '50%', 
                  background: 'rgba(16, 185, 129, 0.2)', 
                  border: '2px solid #10B981',
                  transition: 'width 0.3s, height 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ color: '#FFF', fontSize: '1.02rem', fontWeight: 'bold' }}>
                  {sliderVal === 1 ? '400B' : sliderVal === 2 ? '1.2T' : '2.78T'}
                </span>
              </div>
              <span style={{ fontSize: '1.02rem', color: '#94A3B8', marginTop: '8px' }}>
                Kimi K3 {sliderVal === 3 && <b style={{ color: '#10B981' }}>(2.68x Large Size)</b>}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Scaling Law Chart with hovering coordinate details */}
        <div className="card">
          <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>📈 Scaling Law Curve (Hover to view FLOPs and Loss)</h3>
          
          <div style={{ background: '#02040a', borderRadius: '8px', padding: '10px', position: 'relative' }}>
            <svg 
              ref={svgRef}
              width="100%" 
              height="180" 
              viewBox="0 0 500 180" 
              style={{ maxWidth: '500px' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setLawCoords(null)}
            >
              {/* Axes */}
              <line x1="50" y1="140" x2="480" y2="140" stroke="#475569" strokeWidth="1.5" />
              <line x1="50" y1="15" x2="50" y2="140" stroke="#475569" strokeWidth="1.5" />
              
              <text x="260" y="168" fill="#94A3B8" fontSize="13" textAnchor="middle">Total Training Compute (Total FLOPs, log scale)</text>
              <text x="12" y="75" fill="#94A3B8" fontSize="13" transform="rotate(-90 12 75)" textAnchor="middle">Validation Loss (Loss)</text>

              {/* K2 Curve */}
              <path d="M 60 35 Q 180 85 340 115 T 450 128" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3" />
              {/* K3 Curve */}
              <path d="M 60 25 Q 160 60 300 85 T 450 92" fill="none" stroke="#10B981" strokeWidth="2.5" />

              {/* Focus tracker line and dot */}
              {lawCoords && (
                <g>
                  <line x1={lawCoords.x} y1="15" x2={lawCoords.x} y2="140" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2" />
                  <circle cx={lawCoords.x} cy={lawCoords.y} r="4.5" fill="#38BDF8" />
                </g>
              )}
            </svg>

            {/* Float values tooltip */}
            {lawCoords && (
              <div 
                style={{ 
                  position: 'absolute', 
                  left: `${lawCoords.x - 50}px`, 
                  top: '15px', 
                  background: '#090D16', 
                  border: '1px solid #38BDF8', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '1.15rem',
                  pointerEvents: 'none'
                }}
              >
                <div>Compute: <b style={{ color: '#FFF' }}>{lawCoords.flop}</b></div>
                <div>Predicted Loss: <b style={{ color: '#38BDF8' }}>{lawCoords.loss}</b></div>
              </div>
            )}
          </div>
        </div>

        {/* 4-Stage Timeline curriculum - click to zoom */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>⏳ Progressive Long-Context Training Curriculum (Click stages to expand)</h3>
          
          {/* Horizontal stages timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '20px', padding: '0 20px' }}>
            <div style={{ position: 'absolute', top: '15px', left: '40px', right: '40px', height: '2px', background: '#1E293B', zIndex: 1 }} />
            
            {curriculumStages.map((stage, idx) => {
              const isActive = idx === activeStage;
              return (
                <div 
                  key={idx} 
                  onClick={() => setActiveStage(idx)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, cursor: 'pointer' }}
                >
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isActive ? '#10B981' : '#0F172A',
                      border: `2px solid ${isActive ? '#FFF' : '#334155'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontSize: '1.02rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '1.15rem', color: isActive ? '#10B981' : '#94A3B8', marginTop: '6px', fontWeight: isActive ? 'bold' : 'normal' }}>
                    {stage.length}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Zoomed curriculum stage details */}
          <div style={{ background: '#090D16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '10px' }}>
              <span style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: 'bold' }}>{curriculumStages[activeStage].name}</span>
              <span style={{ color: '#10B981', fontSize: '1.02rem' }}>Parameter State: {curriculumStages[activeStage].params}</span>
              <span style={{ color: '#FFB000', fontSize: '1.02rem' }}>Illustrative Loss: {curriculumStages[activeStage].loss}</span>
            </div>

            {/* Custom Pie-like ratio bars representing data ratios */}
            <div style={{ fontSize: '1.02rem', color: '#94A3B8' }}>
              <span style={{ color: '#E2E8F0', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Illustrative data mix (not published by the report):</span>
              
              <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                {curriculumStages[activeStage].ratios.map((ratio, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      width: `${ratio.val}%`, 
                      background: ratio.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#000',
                      fontSize: '1.15rem',
                      fontWeight: 'bold'
                    }}
                    title={`${ratio.label}: ${ratio.val}%`}
                  >
                    {ratio.val >= 15 ? `${ratio.val}%` : ''}
                  </div>
                ))}
              </div>

              {/* Legend details */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {curriculumStages[activeStage].ratios.map((ratio, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem' }}>
                    <div style={{ width: '8px', height: '8px', background: ratio.color, borderRadius: '2px' }} />
                    <span>{ratio.label} ({ratio.val}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hyperparameter Recipe Card */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '10px' }}>⚙️ 3.3 Pre-training Hyperparameters & Training Recipe</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '1.02rem' }}>
            <div style={{ background: '#090D16', padding: '10px', borderRadius: '6px' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>Optimizer</span>
              <p style={{ color: '#94A3B8', marginTop: '4px' }}>Per-Head Muon + Weight Clipping hybrid orthogonal optimization to arrest parameter divergence caused by deep residual stacking.</p>
            </div>
            <div style={{ background: '#090D16', padding: '10px', borderRadius: '6px' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>Cosine Learning Rate Schedule (LR Cosine Schedule)</span>
              <p style={{ color: '#94A3B8', marginTop: '4px' }}>The report specifies cosine decay with a 1% linear warmup; peak learning rate is not disclosed here.</p>
            </div>
            <div style={{ background: '#090D16', padding: '10px', borderRadius: '6px' }}>
              <span style={{ color: '#FFB000', fontWeight: 'bold' }}>Weight Decay</span>
              <p style={{ color: '#94A3B8', marginTop: '4px' }}>The report specifies weight decay 0.1 throughout training; batch-size values are not disclosed here.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
