import React, { useState, useEffect } from 'react';

interface BenchmarkItem {
  name: string;
  category: string;
  kimiK3: number;
  fable5: number;
  sol56: number;
  opus48: number;
  gpt55: number;
  glm52: number | null;
}

const benchmarkData: BenchmarkItem[] = [
  { name: "GPQA Diamond (Graduate-Level Reasoning)", category: "Reasoning", kimiK3: 93.5, fable5: 92.6, sol56: 94.1, opus48: 91.0, gpt55: 93.5, glm52: 91.2 },
  { name: "DeepSWE (Software Engineering Challenge)", category: "Coding", kimiK3: 67.5, fable5: 70.0, sol56: 73.0, opus48: 59.0, gpt55: 67.0, glm52: 46.2 },
  { name: "BrowseComp (Complex Agentic Browser)", category: "Agentic", kimiK3: 91.2, fable5: 88.0, sol56: 90.4, opus48: 84.3, gpt55: 84.4, glm52: null },
  { name: "FrontierSWE (Frontier Coding)", category: "Coding", kimiK3: 81.2, fable5: 86.6, sol56: 71.3, opus48: 66.7, gpt55: 64.9, glm52: 67.3 },
  { name: "SWE-Marathon (Marathon Software Engineering)", category: "Coding", kimiK3: 42.0, fable5: 35.0, sol56: 39.0, opus48: 40.0, gpt55: 14.0, glm52: 13.0 }
];

export const EvaluationDashboard: React.FC = () => {
  const [evalTab, setEvalTab] = useState<'radar' | 'bars' | 'scatter' | 'cyber'>('radar');

  // Radar chart visibility filters
  const [showK3, setShowK3] = useState<boolean>(true);
  const [showFable, setShowFable] = useState<boolean>(true);
  const [showSol, setShowSol] = useState<boolean>(true);

  // Growing bar chart state
  const [selectedBenchmarkIdx, setSelectedBenchmarkIdx] = useState<number>(0);
  const [barGrowthProgress, setBarGrowthProgress] = useState<number>(0);

  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 0.05;
      if (start >= 1) {
        setBarGrowthProgress(1);
        clearInterval(interval);
      } else {
        setBarGrowthProgress(start);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [selectedBenchmarkIdx, evalTab]);

  // Radar Chart axis coordinate mapping (6 axes)
  // Axes: Reasoning (0), Coding (60), Agentic (120), Retrieval (180), Language (240), Vision (300)
  // Radar Chart axis coordinate mapping (6 axes)
  // Axes: Reasoning (0), Coding (60), Agentic (120), Retrieval (180), Language (240), Vision (300)
  const getRadarPoint = (angleDegree: number, valuePercent: number): { x: number; y: number } => {
    const angleRad = (angleDegree - 90) * (Math.PI / 180);
    const radius = 85 * (valuePercent / 100);
    const centerX = 170;
    const centerY = 130;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad)
    };
  };

  // Normalized illustrative radar values; they are not a single official benchmark.
  const k3RadarPoints = [
    getRadarPoint(0, 93.5),   // Reasoning
    getRadarPoint(60, 85.0),  // Coding
    getRadarPoint(120, 91.2), // Agentic
    getRadarPoint(180, 95.0), // Retrieval
    getRadarPoint(240, 94.0), // Language
    getRadarPoint(300, 88.0)  // Vision
  ];

  const fableRadarPoints = [
    getRadarPoint(0, 92.6),
    getRadarPoint(60, 88.0),
    getRadarPoint(120, 88.0),
    getRadarPoint(180, 90.0),
    getRadarPoint(240, 92.0),
    getRadarPoint(300, 91.0)
  ];

  const solRadarPoints = [
    getRadarPoint(0, 94.1),
    getRadarPoint(60, 91.0),
    getRadarPoint(120, 90.4),
    getRadarPoint(180, 88.0),
    getRadarPoint(240, 93.0),
    getRadarPoint(300, 87.0)
  ];

  const getPointsString = (points: { x: number; y: number }[]) => {
    return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  };

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 6 - Benchmark & Evaluation</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Kimi-K3 Public Benchmarks, Security Evaluation & Inference Cost</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        In the reported Max Effort comparisons, Kimi K3 reaches frontier-level performance and outperforms several evaluated alternatives, while still trailing the strongest proprietary models on some overall comparisons.
      </p>

      {/* Control panel for evaluation tabs */}
      <div className="control-panel" style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${evalTab === 'radar' ? 'active' : ''}`}
          onClick={() => setEvalTab('radar')}
          style={{ padding: '4px 10px', fontSize: '1.02rem' }}
        >
          6.1 Capability Radar Chart (Radar)
        </button>
        <button 
          className={`btn ${evalTab === 'bars' ? 'active' : ''}`}
          onClick={() => setEvalTab('bars')}
          style={{ padding: '4px 10px', fontSize: '1.02rem' }}
        >
          6.2 Comparative Growth Chart (Growth Bars)
        </button>
        <button 
          className={`btn ${evalTab === 'scatter' ? 'active' : ''}`}
          onClick={() => setEvalTab('scatter')}
          style={{ padding: '4px 10px', fontSize: '1.02rem' }}
        >
          6.3 Cost vs. Performance Scatter Plot (Scatter)
        </button>
        <button 
          className={`btn ${evalTab === 'cyber' ? 'active' : ''}`}
          onClick={() => setEvalTab('cyber')}
          style={{ padding: '4px 10px', fontSize: '1.02rem' }}
        >
          6.4 Cyber Defense & Zero-day Exploitation (Cyber)
        </button>
      </div>

      <div className="grid-2" style={{ gap: '20px', alignItems: 'stretch' }}>
        
        {/* Main interactive panel based on selected tab */}
        <div className="card">
          
          {evalTab === 'radar' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🕸️ 6.1 Capability Radar Chart</h3>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                {/* SVG Radar Chart */}
                <div style={{ background: '#02040a', borderRadius: '8px', padding: '16px' }}>
                  <svg width="340" height="260" viewBox="0 0 340 260">
                    {/* Background rings */}
                    <circle cx="170" cy="130" r="85" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                    <circle cx="170" cy="130" r="64" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <circle cx="170" cy="130" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <circle cx="170" cy="130" r="21" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                    {/* Normalized scale: the rings represent 25 / 50 / 75 / 100. */}
                    <text x="176" y="112" fill="#64748B" fontSize="9">25</text>
                    <text x="176" y="91" fill="#64748B" fontSize="9">50</text>
                    <text x="176" y="69" fill="#64748B" fontSize="9">75</text>
                    <text x="176" y="48" fill="#64748B" fontSize="9">100</text>

                    {/* Axis Lines */}
                    {Array.from({ length: 6 }).map((_, idx) => {
                      const angle = idx * 60;
                      const rad = (angle - 90) * (Math.PI / 180);
                      const x = 170 + 85 * Math.cos(rad);
                      const y = 130 + 85 * Math.sin(rad);
                      return (
                        <line 
                          key={idx} 
                          x1="170" y1="130" 
                          x2={x} y2={y} 
                          stroke="rgba(255,255,255,0.12)" 
                          strokeWidth="1.5" 
                        />
                      );
                    })}

                    {/* Axis Labels */}
                    <text x="170" y="24" fill="#94A3B8" fontSize="13" fontWeight="bold" textAnchor="middle">Reasoning</text>
                    <text x="270" y="80" fill="#94A3B8" fontSize="13" fontWeight="bold" textAnchor="start">Coding</text>
                    <text x="270" y="185" fill="#94A3B8" fontSize="13" fontWeight="bold" textAnchor="start">Agentic</text>
                    <text x="170" y="242" fill="#94A3B8" fontSize="13" fontWeight="bold" textAnchor="middle">Retrieval</text>
                    <text x="70" y="185" fill="#94A3B8" fontSize="13" fontWeight="bold" textAnchor="end">Language</text>
                    <text x="70" y="80" fill="#94A3B8" fontSize="13" fontWeight="bold" textAnchor="end">Vision</text>

                    {/* Polygons */}
                    {showFable && (
                      <polygon 
                        points={getPointsString(fableRadarPoints)} 
                        fill="rgba(239, 68, 68, 0.1)" 
                        stroke="#EF4444" 
                        strokeWidth="2" 
                      />
                    )}

                    {showSol && (
                      <polygon 
                        points={getPointsString(solRadarPoints)} 
                        fill="rgba(56, 189, 248, 0.1)" 
                        stroke="#38BDF8" 
                        strokeWidth="2" 
                      />
                    )}

                    {showK3 && (
                      <polygon 
                        points={getPointsString(k3RadarPoints)} 
                        fill="rgba(16, 185, 129, 0.16)" 
                        stroke="#10B981" 
                        strokeWidth="2.5" 
                      />
                    )}
                  </svg>
                </div>

                {/* Filters checkbox list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1.02rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#10B981', fontWeight: 'bold' }}>
                    <input type="checkbox" checked={showK3} onChange={() => setShowK3(!showK3)} />
                    Kimi K3 (Self-developed MoE)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#EF4444' }}>
                    <input type="checkbox" checked={showFable} onChange={() => setShowFable(!showFable)} />
                    Claude Fable 5
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#38BDF8' }}>
                    <input type="checkbox" checked={showSol} onChange={() => setShowSol(!showSol)} />
                    GPT-5.6 Sol
                  </label>
                </div>
              </div>
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#CBD5E1', lineHeight: '1.45' }}>
                <b style={{ color: '#FCD34D' }}>Interpretation boundary:</b> normalized illustrative capability view, not a single official benchmark. The axes combine teaching categories rather than reproducing one report table; use the benchmark tabs below for named tasks and reported scores.
              </div>
            </div>
          )}

          {evalTab === 'bars' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>📈 6.2 Benchmarks Scoring Comparison (Growth Animation)</h3>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>Switch Dataset:</span>
                <select 
                  value={selectedBenchmarkIdx} 
                  onChange={(e) => setSelectedBenchmarkIdx(parseInt(e.target.value))}
                  style={{ padding: '4px 10px', fontSize: '1.02rem' }}
                >
                  {benchmarkData.map((item, idx) => (
                    <option key={idx} value={idx}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Growing Bars SVG */}
              <div style={{ background: '#02040a', borderRadius: '8px', padding: '15px' }}>
                {(() => {
                  const item = benchmarkData[selectedBenchmarkIdx];
                  const models = [
                    { name: 'Kimi K3', val: item.kimiK3, color: '#10B981' },
                    { name: 'Fable 5', val: item.fable5, color: '#EF4444' },
                    { name: 'Sol 5.6', val: item.sol56, color: '#38BDF8' },
                    { name: 'Opus 4.8', val: item.opus48, color: '#E2E8F0' },
                    { name: 'GPT-5.5', val: item.gpt55, color: '#FFB000' },
                    { name: 'GLM-5.2', val: item.glm52, color: '#64748B' }
                  ];

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {models.map((model, idx) => {
                        const currentWidth = model.val !== null ? model.val * barGrowthProgress : 0;
                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#94A3B8', marginBottom: '3px' }}>
                              <span>{model.name}</span>
                              <span style={{ fontWeight: 'bold', color: model.color }}>
                                {model.val !== null ? `${currentWidth.toFixed(1)}%` : 'N/A (-)'}
                              </span>
                            </div>
                            <div style={{ background: '#1E293B', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  background: model.color, 
                                  height: '100%', 
                                  width: `${currentWidth}%`,
                                  transition: 'width 0.1s ease-out'
                                }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {evalTab === 'scatter' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>📈 6.3 Cost ($/M Tokens) vs. Performance (GPQA Diamond) Scatter Plot</h3>
              
              <div style={{ background: '#02040a', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <svg width="100%" height="240" viewBox="0 0 540 240" style={{ width: '100%' }}>
                  {/* Axis */}
                  <line x1="50" y1="180" x2="500" y2="180" stroke="#475569" strokeWidth="1.5" />
                  <line x1="50" y1="30" x2="50" y2="180" stroke="#475569" strokeWidth="1.5" />
                  
                  <text x="275" y="215" fill="#94A3B8" fontSize="13" fontWeight="bold" textAnchor="middle">API Cost ($ / Million Tokens)</text>
                  <text x="18" y="105" fill="#94A3B8" fontSize="13" fontWeight="bold" transform="rotate(-90 18 105)" textAnchor="middle">GPQA Score (%)</text>

                  <text x="42" y="35" fill="#94A3B8" fontSize="12" textAnchor="end">100%</text>
                  <text x="42" y="180" fill="#94A3B8" fontSize="12" textAnchor="end">50%</text>

                  {/* Scatter dots */}
                  {/* Kimi K3 cache-miss input price ($3/M, 93.5%) - Top Left */}
                  <circle cx="105" cy="50" r="7" fill="#10B981" />
                  <text x="118" y="54" fill="#10B981" fontSize="13" fontWeight="bold">Kimi K3 ($3 / M input)</text>

                  {/* GLM-5.2 ($2.0/M, 91.2%) */}
                  <circle cx="95" cy="72" r="5" fill="#64748B" />
                  <text x="108" y="76" fill="#64748B" fontSize="13">GLM-5.2 ($2.0)</text>

                  {/* Fable 5 ($15/M, 92.6%) - Mid Right */}
                  <circle cx="360" cy="58" r="6" fill="#EF4444" />
                  <text x="372" y="62" fill="#EF4444" fontSize="13" fontWeight="bold">Fable 5 ($15 / M)</text>

                  {/* Opus 4.8 ($15/M, 91%) */}
                  <circle cx="360" cy="74" r="5" fill="#E2E8F0" />
                  <text x="372" y="78" fill="#E2E8F0" fontSize="13">Opus 4.8 ($15)</text>

                  {/* Sol 5.6 ($18/M, 94.1%) - Top Right */}
                  <circle cx="440" cy="44" r="6" fill="#38BDF8" />
                  <text x="452" y="48" fill="#38BDF8" fontSize="13" fontWeight="bold">Sol 5.6 ($18 / M)</text>
                </svg>
              </div>
              <p style={{ fontSize: '1.02rem', color: '#94A3B8', marginTop: '10px', lineHeight: '1.4' }}>
                💡 <b>Cost interpretation:</b> The Kimi K3 point uses the official cache-miss input price: <b>$3.00 / MTok</b>. The official API also lists <b>$0.30 / MTok</b> for cache-hit input and <b>$15.00 / MTok</b> for output. The comparison points are illustrative and are not an apples-to-apples pricing benchmark; prices and benchmark results should be read with their source date and evaluation setup.
              </p>
            </div>
          )}

          {evalTab === 'cyber' && (
            <div style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.5' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '8px' }}>🛡️ Linux Kernel End-to-End Exploit Synthesis (Tier 2)</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span>Exploit Synthesis Success Rate (Exploit Dev)</span>
                <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>38.9% (14 / 36)</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#090D16', padding: '10px', borderRadius: '6px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#FFF' }}>
                    <span>Kimi-K3 (Max Effort)</span>
                    <span>38.9% (14/36)</span>
                  </div>
                  <div style={{ background: '#1E293B', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: '#38BDF8', height: '100%', width: '38.9%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#94A3B8' }}>
                    <span>GLM-5.2 (Baseline Tier 2)</span>
                    <span>22.2% (8/36)</span>
                  </div>
                  <div style={{ background: '#1E293B', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: '#64748B', height: '100%', width: '22.2%' }} />
                  </div>
                </div>
              </div>

              <p style={{ marginTop: '10px', color: '#F87171' }}>
                ⚠️ <b>Key Failure Bottlenecks:</b> During Linux kernel local privilege escalation, the model often fails due to: (1) misreading kernel stack offsets, (2) executing instructions blocked by kernel security controls, (3) falling into infinite debug loops, or (4) failing to run final local validation.
              </p>
            </div>
          )}

        </div>

        {/* Right Details Panel - simple description list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '10px' }}>📊 Independent Evaluation Table 5 Third-Party Benchmarks</h3>
            <div style={{ background: '#02040a', padding: '12px', borderRadius: '8px', fontSize: '1.02rem', lineHeight: '1.4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px' }}>
                <span style={{ color: '#94A3B8' }}>Artificial Analysis Intelligence Index</span>
                <span style={{ color: '#FFF', fontWeight: 'bold' }}>57.1 (#4/580)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', paddingTop: '4px' }}>
                <span style={{ color: '#94A3B8' }}>Vals AI Index</span>
                <span style={{ color: '#FFF', fontWeight: 'bold' }}>74.7% (#2/39)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', paddingTop: '4px' }}>
                <span style={{ color: '#94A3B8' }}>WebDev Arena (Elo Score)</span>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>1678 (#1/99)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span style={{ color: '#94A3B8' }}>Agent Arena (Elo Score)</span>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>9.1 (#4/37)</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '10px', marginTop: '15px', color: '#10B981', fontSize: '1.02rem' }}>
            🔒 <b>Evaluation scope:</b> The official report separately evaluates defensive vulnerability discovery and end-to-end exploit development. Results depend on the benchmark environment, harness, and model version; this panel is not a product safety guarantee.
            <div style={{ marginTop: '8px', color: '#64748B', fontSize: '0.9rem' }}>
              Sources: Kimi K3 Technical Report for evaluation results; official Kimi API pricing page for token prices.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
