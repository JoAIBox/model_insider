import React, { useState, useEffect } from 'react';

export const PostTrainingDetails: React.FC = () => {
  const [subTab, setSubTab] = useState<'rlRollout' | 'speculative' | 'taskSynth'>('rlRollout');
  const [lambdaVal, setLambdaVal] = useState<number>(0.8);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // Partial rollout animation state
  const [rolloutTime, setRolloutTime] = useState<number>(0);
  const [isRolloutRunning, setIsRolloutRunning] = useState<boolean>(true);

  // Speculative decoding Gantt animation state
  const [specTick, setSpecTick] = useState<number>(0);

  // Animation ticks
  useEffect(() => {
    let timerId: number;
    if (isRolloutRunning) {
      timerId = window.setInterval(() => {
        setRolloutTime(prev => {
          if (prev >= 120) {
            return 0; // loop
          }
          return prev + 2;
        });
      }, 50);
    }
    return () => clearInterval(timerId);
  }, [isRolloutRunning]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSpecTick(prev => (prev + 1) % 30);
    }, 250);
    return () => clearInterval(timerId);
  }, []);

  // Speculative decoding Gantt blocks rendering helpers
  const getGanttBlocks = () => {
    // 3 phases:
    // Phase 1 (0-10 ticks): Draft generating steps 1 to 4
    // Phase 2 (10-18 ticks): Target parallel verification
    // Phase 3 (18-30 ticks): Verification result (accept/reject) & output
    if (specTick < 10) {
      return {
        phase: "Draft Generation",
        desc: "Draft model (EAGLE-3) is autoregressively pre-generating 4 tokens sequentially...",
        blocks: [
          { name: "Draft T1", color: '#10B981', w: 30, x: 20 },
          { name: "Draft T2", color: '#10B981', w: 30, x: 55 },
          { name: "Draft T3", color: '#10B981', w: 30, x: 90 },
          { name: "Draft T4", color: '#10B981', w: 30, x: 125 }
        ]
      };
    } else if (specTick < 18) {
      return {
        phase: "Target Verification",
        desc: "Target model (Kimi-K3) is validating these 4 tokens in parallel at once...",
        blocks: [
          { name: "Draft T1", color: '#059669', w: 30, x: 20 },
          { name: "Draft T2", color: '#059669', w: 30, x: 55 },
          { name: "Draft T3", color: '#059669', w: 30, x: 90 },
          { name: "Draft T4", color: '#059669', w: 30, x: 125 },
          { name: "Target Verification (Parallel)", color: '#38BDF8', w: 135, x: 20, y: 35 }
        ]
      };
    } else {
      return {
        phase: "Acceptance / Backtrack",
        desc: "3 tokens accepted, 4th token rejected. Keeping the first 3 and rolling back/correcting, significantly accelerating inference!",
        blocks: [
          { name: "Accept ✅", color: '#10B981', w: 30, x: 20 },
          { name: "Accept ✅", color: '#10B981', w: 30, x: 55 },
          { name: "Accept ✅", color: '#10B981', w: 30, x: 90 },
          { name: "Reject ❌", color: '#EF4444', w: 30, x: 125 },
          { name: "Target Correction (Corrected T4)", color: '#A78BFA', w: 35, x: 160 }
        ]
      };
    }
  };

  const ganttInfo = getGanttBlocks();

  // Partial rollout calculation
  const totalTraj = 120;
  const completedTraj = Math.round(totalTraj * lambdaVal);

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 4 - Post-Training Evolution</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Kimi-K3 Post-Training Reinforcement Learning & Alignment</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        Kimi-K3 post-training integrates Multi-Teacher On-Policy Distillation (MOPD) and asynchronous partial rollout mechanisms, greatly alleviating machine waiting deadlocks under distributed learning.
      </p>

      {/* Sub-tab navigation */}
      <div className="control-panel" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          className={`btn ${subTab === 'rlRollout' ? 'active' : ''}`}
          onClick={() => setSubTab('rlRollout')}
        >
          4.1 Asynchronous Partial Rollout Mechanism
        </button>
        <button 
          className={`btn ${subTab === 'speculative' ? 'active' : ''}`}
          onClick={() => setSubTab('speculative')}
        >
          4.2 Cascaded Feature Fusion & Speculative Draft
        </button>
        <button 
          className={`btn ${subTab === 'taskSynth' ? 'active' : ''}`}
          onClick={() => setSubTab('taskSynth')}
        >
          4.3 Multi-Teacher On-Policy Distillation (MOPD) Structure
        </button>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        
        {/* Left Column: Dynamic Visualizations */}
        <div className="card">
          
          {subTab === 'rlRollout' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>⚡ Asynchronous Sampling Timeline Comparison (Full vs. Partial Rollout)</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.02rem' }}>
                <span style={{ color: '#94A3B8' }}>Partial Rollout Truncation Ratio (λ):</span>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>{Math.round(lambdaVal * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="0.95" 
                step="0.05"
                value={lambdaVal} 
                onChange={(e) => setLambdaVal(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '20px', accentColor: '#10B981' }}
              />

              {/* Side-by-side comparative progress bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#02040a', padding: '15px', borderRadius: '8px' }}>
                
                {/* Full Rollout bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#94A3B8', marginBottom: '4px' }}>
                    <span>Full Rollout (120 Steps)</span>
                    <span style={{ color: rolloutTime >= 120 ? '#10B981' : '#FFB000' }}>
                      {rolloutTime >= 120 ? 'Completed' : `Sampling: ${rolloutTime}/120`}
                    </span>
                  </div>
                  <div style={{ background: '#1E293B', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        background: '#38BDF8', 
                        height: '100%', 
                        width: `${(rolloutTime / 120) * 100}%` 
                      }} 
                    />
                  </div>
                </div>

                {/* Partial Rollout bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#E2E8F0', marginBottom: '4px' }}>
                    <span>Partial Rollout ({completedTraj} Steps Truncated)</span>
                    <span style={{ color: rolloutTime >= completedTraj ? '#10B981' : '#38BDF8', fontWeight: 'bold' }}>
                      {rolloutTime >= completedTraj ? '🎉 Completed early, launching gradient optimization!' : `Sampling: ${Math.min(completedTraj, rolloutTime)}/${completedTraj}`}
                    </span>
                  </div>
                  <div style={{ background: '#1E293B', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        background: rolloutTime >= completedTraj ? '#10B981' : '#38BDF8', 
                        height: '100%', 
                        width: `${(Math.min(completedTraj, rolloutTime) / completedTraj) * 100}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="control-panel" style={{ marginTop: '15px' }}>
                <button className="btn" onClick={() => setIsRolloutRunning(!isRolloutRunning)}>
                  {isRolloutRunning ? 'Pause Comparison' : 'Start Comparison'}
                </button>
                <button className="btn-secondary" onClick={() => setRolloutTime(0)}>Reset Timeline</button>
              </div>
            </div>
          )}

          {subTab === 'speculative' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🚀 Speculative Decoding Gantt Chart (EAGLE-3 Cascaded Feature Verification)</h3>
              
              <div style={{ background: '#02040a', padding: '15px', borderRadius: '8px', minHeight: '130px' }}>
                <div style={{ fontSize: '1.02rem', color: '#FFF', fontWeight: 'bold', marginBottom: '5px' }}>
                  Current Phase: <span style={{ color: '#38BDF8' }}>{ganttInfo.phase}</span>
                </div>
                <div style={{ fontSize: '1.15rem', color: '#94A3B8', marginBottom: '15px' }}>
                  {ganttInfo.desc}
                </div>

                {/* Draw Gantt blocks using relative positions */}
                <div style={{ position: 'relative', height: '70px', background: '#090D16', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {ganttInfo.blocks.map((block, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${block.x}px`,
                        top: block.y ? `${block.y}px` : '5px',
                        width: `${block.w}px`,
                        height: '24px',
                        background: block.color,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontSize: '1.15rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {block.name}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '1.02rem', color: '#94A3B8', marginTop: '12px', lineHeight: '1.4' }}>
                💡 <b>Water Pipe Parallel Metaphor:</b> The draft model is like a small pipe flowing water rapidly at low cost (generating tokens). The target model is like a large main pipe that releases a strong gush of water periodically for verification (validating all tokens in parallel). If the small pipe's water goes astray, the main pipe quickly redirects it, ensuring both output quality and high speed.
              </div>
            </div>
          )}

          {subTab === 'taskSynth' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>Nine Teacher Configurations Teaching One Student (MOPD Distillation Diagram)</h3>
              
              <div style={{ background: '#02040a', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <svg width="100%" height="330" viewBox="0 0 700 330" style={{ width: '100%' }}>
                  <text x="232" y="20" fill="#94A3B8" fontSize="12" fontWeight="bold" textAnchor="middle">Reasoning effort</text>
                  <text x="225" y="38" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">Low</text>
                  <text x="355" y="38" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">High</text>
                  <text x="485" y="38" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle">Max</text>

                  {/* 3 domains × 3 reasoning-effort levels = 9 teacher configurations */}
                  <text x="20" y="68" fill="#3B82F6" fontSize="13" fontWeight="bold">Math domain</text>
                  <text x="20" y="123" fill="#10B981" fontSize="13" fontWeight="bold">Code domain</text>
                  <text x="20" y="178" fill="#F59E0B" fontSize="13" fontWeight="bold">General domain</text>

                  {[0, 1, 2].map((row) => [0, 1, 2].map((col) => {
                    const x = 170 + col * 130;
                    const y = 48 + row * 55;
                    const colors = ['#1E3A8A', '#064E3B', '#78350F'];
                    const borders = ['#3B82F6', '#10B981', '#F59E0B'];
                    return (
                      <g key={`${row}-${col}`}>
                        <rect x={x} y={y} width="110" height="38" rx="5" fill={colors[row]} stroke={borders[row]} strokeWidth="1.5" />
                        <text x={x + 55} y={y + 24} fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">Teacher</text>
                      </g>
                    );
                  }))}

                  {/* Compact routing bus keeps the nine sources visible without hiding their configuration. */}
                  <path d="M 600 67 L 625 67 L 625 177" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
                  <path d="M 600 122 L 625 122" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
                  <path d="M 600 177 L 625 177" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
                  <path d="M 625 122 L 650 122 L 650 224 L 500 224" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4,3" fill="none" />
                  <text x="518" y="210" fill="#38BDF8" fontSize="11" textAnchor="middle">9 configurations</text>

                  <rect x="220" y="210" width="280" height="30" rx="4" fill="#070913" stroke="#38BDF8" strokeWidth="1" />
                  <text x="360" y="230" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">MOPD distillation loss (Eq 15)</text>

                  <path d="M 360 240 L 360 270" stroke="rgba(0, 242, 254, 0.6)" strokeWidth="1.5" strokeDasharray="4,3" />
                  <rect x="220" y="270" width="280" height="45" rx="6" fill="#312E81" stroke="#6366F1" strokeWidth="2" />
                  <text x="360" y="297" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">Student model π_θ (K3)</text>
                </svg>
              </div>

              <div style={{ fontSize: '1.02rem', color: '#94A3B8', marginTop: '12px', lineHeight: '1.4' }}>
                💡 <b>MOPD Fusion:</b> Nine teacher configurations — 3 domains × 3 reasoning-effort levels — continuously pass knowledge to a single student model. The 3×3 matrix makes each domain/effort configuration explicit; it does not imply nine different parameter sizes. Using <b>stop-gradient</b> techniques prevents cross-teacher interference, allowing the student model to learn complementary strengths.
              </div>
              <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '5px', background: 'rgba(56, 189, 248, 0.07)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#E2E8F0', fontFamily: 'monospace', fontSize: '0.92rem', textAlign: 'center' }}>
                9 teacher policies → one MOPD loss → student π_θ (K3)
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Comparative tables & collapsible math */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="card-title">📖 Quantized Parameter Allocation & Training Recipe</div>

          {/* Quantization bit width details table */}
          <div style={{ background: '#02040a', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.02rem', color: '#E2E8F0', fontWeight: 'bold', marginBottom: '8px' }}>
              MXFP Deployment-Aware Quantization Bit-Width Allocation (Item 22)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.15rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                  <th style={{ padding: '6px' }}>Core Component</th>
                  <th style={{ padding: '6px' }}>Deployment Precision (Bit-Width)</th>
                  <th style={{ padding: '6px' }}>Performance Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px', color: '#E2E8F0' }}>MoE Expert Weights</td>
                  <td style={{ padding: '6px', color: '#10B981', fontWeight: 'bold' }}>MXFP4</td>
                  <td style={{ padding: '6px', color: '#94A3B8' }}>Saves significant memory and relaxes multi-GPU node communication latency</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px', color: '#E2E8F0' }}>Feature Activations</td>
                  <td style={{ padding: '6px', color: '#38BDF8' }}>MXFP8</td>
                  <td style={{ padding: '6px', color: '#94A3B8' }}>Maintains dynamic activation range and prevents overflow</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px', color: '#E2E8F0' }}>Critical Attention / Router Layers</td>
                  <td style={{ padding: '6px', color: '#F59E0B' }}>BF16 / FP32</td>
                  <td style={{ padding: '6px', color: '#94A3B8' }}>Preserves high precision to prevent error accumulation</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Collapsible Math Panel */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <button 
              className="btn" 
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex', fontSize: '1.02rem', padding: '8px 12px' }}
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>{showFormula ? '▼ Collapse Mathematical Principles & Formulas' : '▶ Click ? to View Mathematical Principles & Formulas'}</span>
            </button>

            {showFormula && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Multi-Teacher On-Policy Distillation (MOPD) Clipped Ratio Loss (Item 21 - Eq 15):</strong>
                  <div style={{ fontFamily: 'monospace', color: '#10B981', margin: '4px 0' }}>
                    r_opd = clip( sg( log( π_teacher / π_student ) ), -R_max, R_max)
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '1.15rem' }}>
                    Uses sg (stop-gradient) to ensure multi-mentor updates do not conflict.
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Speculative Acceptance Optimization (LK Loss) Formula (Item 23):</strong>
                  <div style={{ fontFamily: 'monospace', color: '#38BDF8', margin: '4px 0' }}>
                    L_LK = -log ( ∑_(x ∈ V) min(p(x), q(x)) )
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '1.15rem' }}>
                    Maximizes overlap between Draft and Target probabilities to raise speculative draft acceptance rate.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
