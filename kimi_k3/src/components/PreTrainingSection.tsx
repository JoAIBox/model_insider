import React, { useState, useRef } from 'react';

// Analytical Educational Model of Scaling Law:
// L_base(logC) = L_inf + A * 10^(-alpha * (logC - 20))
// For K3: 2.5x compute efficiency means K3 achieves the same loss at C / 2.5,
// corresponding to a constant horizontal shift of log10(2.5) ≈ 0.39794 dex.
const L_INF = 0.82;
const A_CONST = 1.38;
const ALPHA_CONST = 0.085;
const LOG_EFFICIENCY = Math.log10(2.5); // ~0.39794

const computeK2Loss = (logC: number): number => {
  return L_INF + A_CONST * Math.pow(10, -ALPHA_CONST * (logC - 20));
};

const computeK3Loss = (logC: number): number => {
  return L_INF + A_CONST * Math.pow(10, -ALPHA_CONST * (logC + LOG_EFFICIENCY - 20));
};

// Coordinate mapping:
// x: 60 -> logC = 20.0, x: 450 -> logC = 26.0 (span 390px = 6 orders of magnitude)
// y: 50 -> Loss = 2.20, y: 140 -> Loss = 1.00 (larger y = lower loss)
const xToLogC = (x: number): number => 20.0 + ((x - 60) / 390) * 6.0;
const lossToY = (loss: number): number => 50 + ((2.20 - loss) / (2.20 - 1.00)) * 90;

const generatePath = (lossFn: (logC: number) => number): string => {
  const steps = 40;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = 60 + (i / steps) * 390;
    const logC = xToLogC(x);
    const loss = lossFn(logC);
    const y = lossToY(loss);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(' ');
};

const K2_SCALING_PATH = generatePath(computeK2Loss);
const K3_SCALING_PATH = generatePath(computeK3Loss);

export const PreTrainingSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [sliderVal, setSliderVal] = useState<number>(3); // 1 = K1, 2 = K2, 3 = K3
  const [hoveredSpecCard, setHoveredSpecCard] = useState<number | null>(null);

  // Interactive Scaling Law coordinates state
  const [lawCoords, setLawCoords] = useState<{ x: number; y: number; flop: string; loss: string; k2Loss: string } | null>(null);
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

  // Handle Scaling Law SVG interactions strictly using the same analytical function
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x >= 60 && x <= 450) {
      const logC = xToLogC(x);
      const k3LossVal = computeK3Loss(logC);
      const k2LossVal = computeK2Loss(logC);
      const yVal = lossToY(k3LossVal);

      setLawCoords({
        x,
        y: yVal,
        flop: `10^${logC.toFixed(2)} FLOPs`,
        loss: k3LossVal.toFixed(3),
        k2Loss: k2LossVal.toFixed(3),
      });
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

        {/* Bubble Parameter Size Comparison (Total vs Active) */}
        <div className="card">
          <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🎈 K2 vs. K3 Parameter Scale Comparison</h3>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.95rem', color: '#94A3B8' }}>Parameter Metric:</span>
            <button
              className={`btn ${sliderVal === 2 ? 'active' : ''}`}
              onClick={() => setSliderVal(2)}
              style={{ padding: '4px 10px', fontSize: '0.9rem' }}
            >
              Total Parameters
            </button>
            <button
              className={`btn ${sliderVal === 3 ? 'active' : ''}`}
              onClick={() => setSliderVal(3)}
              style={{ padding: '4px 10px', fontSize: '0.9rem' }}
            >
              Active Parameters
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '160px', background: '#02040a', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: sliderVal === 2 ? '70px' : '50px', 
                  height: sliderVal === 2 ? '70px' : '50px', 
                  borderRadius: '50%', 
                  background: 'rgba(56, 189, 248, 0.2)', 
                  border: '2px solid #38BDF8',
                  transition: 'width 0.3s, height 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ color: '#FFF', fontSize: '0.95rem', fontWeight: 'bold' }}>
                  {sliderVal === 2 ? '1.04T' : '32.6B'}
                </span>
              </div>
              <span style={{ fontSize: '0.95rem', color: '#94A3B8', marginTop: '8px' }}>Kimi K2</span>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: sliderVal === 2 ? '125px' : '95px', 
                  height: sliderVal === 2 ? '125px' : '95px', 
                  borderRadius: '50%', 
                  background: 'rgba(16, 185, 129, 0.2)', 
                  border: '2px solid #10B981',
                  transition: 'width 0.3s, height 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ color: '#FFF', fontSize: '1.05rem', fontWeight: 'bold' }}>
                  {sliderVal === 2 ? '2.78T' : '104.2B'}
                </span>
              </div>
              <span style={{ fontSize: '0.95rem', color: '#94A3B8', marginTop: '8px' }}>
                Kimi K3 <b style={{ color: '#10B981' }}>({sliderVal === 2 ? '+167% Capacity' : '+220% Compute'})</b>
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Scaling Law Chart with hovering coordinate details */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', margin: 0 }}>📈 Scaling Law (2.5× Compute Efficiency vs Vanilla)</h3>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
              <span style={{ color: '#10B981' }}>● Kimi-K3 (2.5×)</span>
              <span style={{ color: '#F59E0B' }}>--- K2 Baseline</span>
            </div>
          </div>
          
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
              
              {/* Y-axis Ticks & Labels (Higher up = Higher Loss, Lower down = Lower Loss) */}
              <line x1="46" y1="25" x2="50" y2="25" stroke="#64748B" strokeWidth="1" />
              <text x="42" y="29" fill="#64748B" fontSize="10" textAnchor="end">2.5</text>

              <line x1="46" y1="65" x2="50" y2="65" stroke="#64748B" strokeWidth="1" />
              <text x="42" y="69" fill="#64748B" fontSize="10" textAnchor="end">2.0</text>

              <line x1="46" y1="105" x2="50" y2="105" stroke="#64748B" strokeWidth="1" />
              <text x="42" y="109" fill="#64748B" fontSize="10" textAnchor="end">1.5</text>

              <line x1="46" y1="135" x2="50" y2="135" stroke="#64748B" strokeWidth="1" />
              <text x="42" y="139" fill="#64748B" fontSize="10" textAnchor="end">1.0</text>

              {/* X-axis Ticks */}
              <text x="60" y="154" fill="#64748B" fontSize="10" textAnchor="middle">10²⁰</text>
              <text x="255" y="154" fill="#64748B" fontSize="10" textAnchor="middle">10²³</text>
              <text x="450" y="154" fill="#64748B" fontSize="10" textAnchor="middle">10²⁶</text>

              <text x="260" y="170" fill="#94A3B8" fontSize="11" textAnchor="middle">Total Training Compute (Total FLOPs, log scale)</text>
              <text x="12" y="75" fill="#94A3B8" fontSize="11" transform="rotate(-90 12 75)" textAnchor="middle">Validation Loss (Loss)</text>

              {/* K2 Baseline Curve (Computed from analytical educational model) */}
              <path d={K2_SCALING_PATH} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="455" y="105" fill="#F59E0B" fontSize="10" alignmentBaseline="middle">K2</text>

              {/* K3 Curve (Computed from analytical educational model with 2.5× horizontal compute efficiency) */}
              <path d={K3_SCALING_PATH} fill="none" stroke="#10B981" strokeWidth="2.5" />
              <text x="455" y="130" fill="#10B981" fontSize="10" fontWeight="bold" alignmentBaseline="middle">K3 (2.5×)</text>

              {/* Focus tracker line and dot */}
              {lawCoords && (
                <g>
                  <line x1={lawCoords.x} y1="15" x2={lawCoords.x} y2="140" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2" />
                  <circle cx={lawCoords.x} cy={lawCoords.y} r="4.5" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
                </g>
              )}
            </svg>

            {/* Float values tooltip */}
            {lawCoords && (
              <div 
                style={{ 
                  position: 'absolute', 
                  left: `${Math.min(lawCoords.x - 40, 270)}px`, 
                  top: '15px', 
                  background: '#090D16', 
                  border: '1px solid #10B981', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  fontSize: '0.82rem', 
                  pointerEvents: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                  maxWidth: '240px'
                }}
              >
                <div style={{ color: '#94A3B8', marginBottom: '2px' }}>Compute: <b style={{ color: '#FFF' }}>{lawCoords.flop}</b></div>
                <div style={{ color: '#10B981', fontWeight: 'bold' }}>K3 Val Loss: {lawCoords.loss}</div>
                <div style={{ color: '#F59E0B' }}>K2 Val Loss: {lawCoords.k2Loss}</div>
                <div style={{ color: '#38BDF8', fontSize: '0.75rem', marginTop: '4px', lineHeight: '1.3' }}>
                  ⚡ Constant 2.5× compute shift (Δlog₁₀C = 0.398 dex).
                </div>
                <div style={{ color: '#64748B', fontSize: '0.68rem', marginTop: '3px', fontStyle: 'italic' }}>
                  Conceptual Educational Model (demonstrates scaling hypothesis; not empirical loss logs).
                </div>
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

        {/* Layer 1 Dense FFN & SiTU-GLU Activation Card */}
        <div className="card" style={{ gridColumn: 'span 2', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ color: '#10B981', fontSize: '1.05rem', margin: 0, fontWeight: 'bold' }}>
              🧱 §2.2 Hybrid FFN Architecture: Layer 1 Dense FFN &amp; SiTU-GLU Activation
            </h3>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              Intermediate Dim: 33,792 | Output Bound: ≤ 100
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.95rem' }}>
            {/* Left: Dense FFN Architecture */}
            <div style={{ background: '#090D16', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#38BDF8', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.98rem' }}>
                Layer 1: High-Capacity Dense FFN (Layers 2–93: MoE)
              </div>
              <p style={{ color: '#94A3B8', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                While layers 2–93 employ 896 routed experts (3,072-d each) with 16 active + 2 shared experts, <b>Layer 1 is configured as a single massive Dense FFN</b> (33,792 intermediate dimension) to build unified representation capacity immediately following multimodal token interleaving.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.86rem', color: '#E2E8F0', lineHeight: '1.6' }}>
                <div>• Input/Output Dim: <b>d = 7,168</b></div>
                <div>• Intermediate Dim: <b>33,792</b> (4.71× expansion)</div>
                <div>• Param Count: <b>~726M</b> (W_gate, W_up: 7168×33792; W_down: 33792×7168)</div>
              </div>
            </div>

            {/* Right: SiTU-GLU Mathematical Formulation */}
            <div style={{ background: '#090D16', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#A78BFA', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.98rem' }}>
                SiTU-GLU: Sigmoid Tanh Unit GLU (Eq. 2.68)
              </div>
              <p style={{ color: '#94A3B8', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                Replaces standard unbounded SwiGLU. Coincident large values in SwiGLU cause activation outliers and FP8/BF16 overflow. SiTU-GLU smoothly caps both gate and up branches using scaled tanh.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.84rem', color: '#10B981', lineHeight: '1.6' }}>
                <div>SiTU-GLU(x) = [β₁ tanh(W_g x / β₁) ⊙ σ(W_g x)] ⊙ [β₂ tanh(W_u x / β₂)]</div>
                <div style={{ color: '#E2E8F0', marginTop: '4px' }}>
                  • Hyperparameters: <b>β₁ = 4</b> (gate branch), <b>β₂ = 25</b> (up branch)
                </div>
                <div style={{ color: '#38BDF8' }}>
                  • Strict Output Bound: <b>|f(x)| ≤ β₁ · β₂ = 100</b> (prevents loss spikes)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hyperparameter Recipe Card */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '10px' }}>⚙️ 3.3 Pre-training Hyperparameters &amp; Training Recipe</h3>
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
