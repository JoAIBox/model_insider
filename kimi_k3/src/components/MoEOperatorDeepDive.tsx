import React, { useState } from 'react';
import { KIMI_K3_SPEC } from '../data/k3Specs';
import { computeQuantileBalancingStep, computeSiTU } from '../utils/toyMath';

export const MoEOperatorDeepDive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routing' | 'loadBalance' | 'situ' | 'activatedParams'>('routing');
  const [qbApplied, setQbApplied] = useState(false);
  const [situInput, setSituInput] = useState<number>(15);

  // Authoritative Figure 7 example from Tech Report:
  // m = 8 tokens, n = 4 experts, k = 1 active per token. Target load q = 8*1/4 = 2 tokens per expert.
  const rawScores = [
    [0.92, 0.85, 0.35, 0.12], // Token 0 -> prefers E0
    [0.88, 0.79, 0.40, 0.15], // Token 1 -> prefers E0
    [0.85, 0.82, 0.22, 0.10], // Token 2 -> prefers E0
    [0.81, 0.75, 0.50, 0.18], // Token 3 -> prefers E0
    [0.72, 0.89, 0.31, 0.20], // Token 4 -> prefers E1
    [0.65, 0.86, 0.45, 0.22], // Token 5 -> prefers E1
    [0.60, 0.83, 0.38, 0.25], // Token 6 -> prefers E1
    [0.55, 0.45, 0.78, 0.30], // Token 7 -> prefers E2
  ];
  // Initial bias is all zeros
  const initialBias = [0, 0, 0, 0];
  const qbResult = computeQuantileBalancingStep(rawScores, initialBias, 1);

  // SiTU calculation for slider
  const situCalc = computeSiTU(situInput, KIMI_K3_SPEC.situBeta1, KIMI_K3_SPEC.situBeta2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎰</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              Stable LatentMoE: routed-expert operator principles and derivation
            </h2>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Top-16 / 896 Routed + 2 Shared Experts
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Kimi K3’s sparse channel mixing: 2 full-width shared experts + 16 of 896 routed experts in a 3,584-d latent space with SiTU-GLU bounding.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('routing')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'routing' ? '#10B981' : 'transparent',
              color: activeTab === 'routing' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. Topology & formulas
          </button>
          <button
            onClick={() => setActiveTab('loadBalance')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'loadBalance' ? '#38BDF8' : 'transparent',
              color: activeTab === 'loadBalance' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. Quantile Balancing (QB)
          </button>
          <button
            onClick={() => setActiveTab('situ')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'situ' ? '#A78BFA' : 'transparent',
              color: activeTab === 'situ' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. SiTU-GLU activation bound
          </button>
          <button
            onClick={() => setActiveTab('activatedParams')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'activatedParams' ? '#F59E0B' : 'transparent',
              color: activeTab === 'activatedParams' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            4. 104.2B active accounting
          </button>
        </div>
      </div>

      {/* TAB 1: ROUTING FORMULA & FLOW */}
      {activeTab === 'routing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: 0, fontWeight: 'bold' }}>
              📐 Stable LatentMoE three-branch routing & aggregation
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.05rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. Router receives x_t directly; bias b_t regulates dispatch without altering mixture weights:</div>
              <div style={{ color: '#38BDF8' }}>s_t = Sigmoid(W_r · x_t),  T_16 = Top16(s_t + b_t),  p_i = s_(i,t) / Σ_(j∈T_16) s_(j,t)</div>
              <div>// 2. Shared branch receives x_t directly at full width d=7,168:</div>
              <div style={{ color: '#F59E0B' }}>y_shared = E_1^shared(x_t) + E_2^shared(x_t)</div>
              <div>// 3. Routed branch compresses x_t into latent space l=3,584, routes to 16 experts, normalizes with RMSNorm, then up-projects:</div>
              <div style={{ color: '#10B981' }}>u_t = Σ_(i∈T_16) p_i · E_i^routed(W_↓ · x_t),  y_t = y_shared + W_↑ · RMSNorm(u_t)</div>
            </div>
          </div>

          {/* SVG Routing Flow Diagram - Corrected Topology */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 860 320" width="100%" height="320" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-moe-correct" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                </marker>
                <marker id="arrow-shared" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
                <marker id="arrow-router" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Input Token x_t */}
              <rect x="20" y="115" width="120" height="70" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
              <text x="80" y="145" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">Input x_t</text>
              <text x="80" y="168" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">d = 7,168</text>

              {/* Fork lines from x_t */}
              <path d="M 140 130 C 180 130, 200 55, 230 55" fill="none" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-shared)" />
              <path d="M 140 150 C 180 150, 200 150, 230 150" fill="none" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow-router)" />
              <path d="M 140 170 C 180 170, 200 245, 230 245" fill="none" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-moe-correct)" />

              {/* Branch 1: 2 Shared Experts */}
              <rect x="235" y="25" width="220" height="60" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
              <text x="345" y="50" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">2 Shared Experts (Full Width)</text>
              <text x="345" y="70" fill="#94A3B8" fontSize="11" textAnchor="middle">E_1(x) + E_2(x) · width d = 7,168</text>

              {/* Branch 2: Router */}
              <rect x="235" y="120" width="220" height="60" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="345" y="145" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">QB Router (W_r · x)</text>
              <text x="345" y="165" fill="#94A3B8" fontSize="11" textAnchor="middle">Top-16 of 896 via s_t + b_t</text>

              {/* Branch 3: W_down Projection */}
              <rect x="235" y="215" width="220" height="60" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <text x="345" y="240" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">Latent W↓ Projection</text>
              <text x="345" y="260" fill="#94A3B8" fontSize="11" textAnchor="middle">7,168 → 3,584 communication space</text>

              {/* Dispatch arrow from Router to Experts */}
              <path d="M 455 150 L 500 215" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-router)" />
              <text x="490" y="175" fill="#38BDF8" fontSize="11" fontWeight="bold">dispatch p_i</text>

              {/* 16 Routed Experts */}
              <path d="M 455 245 L 495 245" fill="none" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-moe-correct)" />
              <rect x="500" y="205" width="170" height="80" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <text x="585" y="235" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">16 Routed Experts</text>
              <text x="585" y="255" fill="#FFF" fontSize="11" textAnchor="middle">SiTU-GLU (hidden 3,072)</text>
              <text x="585" y="272" fill="#94A3B8" fontSize="11" textAnchor="middle">output: u_t ∈ ℝ^3,584</text>

              {/* Routed Post-Processing: RMSNorm + W_up */}
              <path d="M 670 245 L 705 245" fill="none" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-moe-correct)" />
              <rect x="710" y="215" width="130" height="60" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <text x="775" y="240" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle">W↑ · RMSNorm(u)</text>
              <text x="775" y="260" fill="#94A3B8" fontSize="11" textAnchor="middle">3,584 → 7,168</text>

              {/* Merge Node */}
              <path d="M 455 55 C 600 55, 750 60, 775 110" fill="none" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-shared)" />
              <path d="M 775 215 L 775 185" fill="none" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-moe-correct)" />

              <circle cx="775" cy="145" r="28" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
              <text x="775" y="142" fill="#FFF" fontSize="16" fontWeight="bold" textAnchor="middle">+</text>
              <text x="775" y="157" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">y_t ∈ ℝ^7168</text>
            </svg>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: 0, lineHeight: '1.45' }}>
            Topology calibration: <b>x_t</b> supplies the router, the 2 shared experts, and the down-projection W↓ in parallel. The shared experts never pass through W↓ or W↑. Only the aggregated routed expert outputs undergo RMSNorm and W↑ before summing with the shared branch.
          </p>
        </div>
      )}

      {/* TAB 2: QUANTILE BALANCING SIMULATION */}
      {activeTab === 'loadBalance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 8px', fontWeight: 'bold' }}>
              ⚖️ Quantile Balancing (QB): from score quantiles to auxiliary-loss-free equilibrium
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.55' }}>
              Reproducing Section 2.4.3 & Figure 7: a training batch of <b>m = 8 tokens</b> routed to <b>n = 4 experts</b> with Top-1 active expert (target load q = 8×1/4 = <b>2 tokens per expert</b>).
              QB inspects the (k+1)-th cutoff margin distribution and derives next-step biases to restore exact load balance without auxiliary loss.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setQbApplied((applied) => !applied)}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                border: 'none',
                background: qbApplied ? '#10B981' : '#38BDF8',
                color: '#000',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {qbApplied ? '↺ Reset to Step t (initial routing loads: 4, 3, 1, 0)' : '▶ Preview Effect of Updated Bias b^(t+1) (loads: 4, 2, 1, 1)'}
            </button>
            <span style={{ color: qbApplied ? '#10B981' : '#F59E0B', fontSize: '0.95rem', fontWeight: 'bold' }}>
              {qbApplied ? 'Simulated shift under b^(t+1): starved E3 receives traffic (loads: 4, 2, 1, 1). In training, b^(t+1) acts on incoming step t+1 batches.' : 'Step t raw routing (b=0): E0/E1 oversubscribed (load: 4, 3), E3 starved (load: 0)'}
            </span>
          </div>

          {/* Expert Loads Bar Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[0, 1, 2, 3].map((expertIdx) => {
              const currentLoad = qbApplied ? qbResult.balancedLoads[expertIdx] : qbResult.initialLoads[expertIdx];
              const biasVal = qbApplied ? qbResult.centeredBiases[expertIdx] : initialBias[expertIdx];
              const isTarget = currentLoad === 2;
              return (
                <div key={expertIdx} style={{ background: '#070913', padding: '14px', borderRadius: '8px', border: `1px solid ${isTarget ? '#10B981' : '#F59E0B'}`, textAlign: 'center' }}>
                  <div style={{ color: '#FFF', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem' }}>Expert {expertIdx}</div>
                  <div style={{ height: '90px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', margin: '10px 0' }}>
                    <div style={{ width: '36px', height: `${(currentLoad / 4) * 100}%`, minHeight: '6px', background: isTarget ? '#10B981' : currentLoad > 2 ? '#EF4444' : '#38BDF8', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }} />
                  </div>
                  <div style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{currentLoad} / 2 tokens</div>
                  <div style={{ color: biasVal < 0 ? '#F87171' : biasVal > 0 ? '#34D399' : '#94A3B8', fontSize: '0.9rem', marginTop: '6px', fontFamily: 'monospace' }}>
                    bias b = {biasVal >= 0 ? `+${biasVal.toFixed(2)}` : biasVal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspectable calculation table */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
            <div style={{ color: '#38BDF8', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.05rem' }}>
              🔬 Token-level raw scores, Top-2 cutoff α_i, and margin table
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem', fontFamily: 'monospace', color: '#E2E8F0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Token</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>E0 score</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>E1 score</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>E2 score</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>E3 score</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Cutoff α_i</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Routed (Step t)</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Routed (Step t+1)</th>
                </tr>
              </thead>
              <tbody>
                {rawScores.map((row, tIdx) => (
                  <tr key={tIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '6px', color: '#38BDF8' }}>Token {tIdx}</td>
                    {row.map((score, eIdx) => {
                      const isInitial = qbResult.initialRoutes[tIdx].includes(eIdx);
                      const isBalanced = qbResult.balancedRoutes[tIdx].includes(eIdx);
                      const isHighlighted = qbApplied ? isBalanced : isInitial;
                      return (
                        <td key={eIdx} style={{ padding: '6px', textAlign: 'center', background: isHighlighted ? 'rgba(16, 185, 129, 0.15)' : 'transparent', color: isHighlighted ? '#10B981' : '#CBD5E1', fontWeight: isHighlighted ? 'bold' : 'normal' }}>
                          {score.toFixed(2)}
                        </td>
                      );
                    })}
                    <td style={{ padding: '6px', textAlign: 'center', color: '#F59E0B' }}>{qbResult.cutoffs[tIdx].toFixed(2)}</td>
                    <td style={{ padding: '6px', textAlign: 'center', color: '#CBD5E1' }}>E{qbResult.initialRoutes[tIdx][0]}</td>
                    <td style={{ padding: '6px', textAlign: 'center', color: '#10B981', fontWeight: 'bold' }}>E{qbResult.balancedRoutes[tIdx][0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.5' }}>
            <b>Mathematical Principle & Training Dynamics:</b> QB derives candidate bias b̂_j = -quantile_(1-k/n)(s_{'{:,j}'} - α) so that the target number of margins (q = mk/n = 2) exceed -b̂_j under the fixed step-t cutoff α_i. When observing the effect of b^(t+1) on the same sample, the load distribution immediately begins rebalancing (e.g. E3 receives traffic, shifting loads from [4, 3, 1, 0] to [4, 2, 1, 1]). In real multi-step training, b^(t+1) acts on newly sampled incoming tokens at step t+1, dynamically driving expert loads toward statistical uniformity across steps without backpropagating auxiliary loss gradients. During inference, b is frozen and added to routing logits.
          </div>
        </div>
      )}

      {/* TAB 3: SiTU-GLU ACTIVATION BOUND */}
      {activeTab === 'situ' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.25)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px', fontWeight: 'bold' }}>
              🛡️ SiTU-GLU (Sigmoid Tanh Unit): double soft-cap bounding
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.98rem', margin: 0, lineHeight: '1.55' }}>
              In conventional SwiGLU, both gate and up branches grow without bound, causing explosive activation outliers at 2.78T parameter scales.
              SiTU-GLU softly caps both the gate branch with $\beta_1 = 4$ and up branch with $\beta_2 = 25$, guaranteeing $|f(x)| \le \beta_1 \beta_2 = 100$.
            </p>
          </div>

          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#FFF', fontWeight: 'bold' }}>Interactive Input Activation x:</span>
              <span style={{ color: '#A78BFA', fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 'bold' }}>{situInput}</span>
            </div>
            <input
              type="range"
              min="-10"
              max="40"
              step="1"
              value={situInput}
              onChange={(e) => setSituInput(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', marginTop: '4px' }}>
              <span>Negative tail (-10)</span>
              <span>Linear region near origin (0)</span>
              <span>Extreme positive activation (40)</span>
            </div>
          </div>

          {/* Value Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ color: '#38BDF8', fontWeight: 'bold' }}>Gate branch: β₁ tanh(x/β₁) · σ(x)</div>
              <div style={{ fontSize: '1.8rem', color: '#FFF', fontFamily: 'monospace', margin: '8px 0' }}>
                {situCalc.gate.toFixed(3)}
              </div>
              <small style={{ color: '#94A3B8' }}>Upper bounded by β₁ = 4.000</small>
            </div>

            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
              <div style={{ color: '#A78BFA', fontWeight: 'bold' }}>Up branch: β₂ tanh(x/β₂)</div>
              <div style={{ fontSize: '1.8rem', color: '#FFF', fontFamily: 'monospace', margin: '8px 0' }}>
                {situCalc.up.toFixed(3)}
              </div>
              <small style={{ color: '#94A3B8' }}>Upper bounded by β₂ = 25.000</small>
            </div>

            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid #10B981' }}>
              <div style={{ color: '#10B981', fontWeight: 'bold' }}>SiTU Product vs SwiGLU</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '8px 0' }}>
                <span style={{ fontSize: '1.8rem', color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {situCalc.output.toFixed(2)}
                </span>
                <span style={{ fontSize: '1.1rem', color: '#EF4444', fontFamily: 'monospace', textDecoration: 'line-through' }}>
                  Swi: {situCalc.swiglu.toFixed(0)}
                </span>
              </div>
              <small style={{ color: '#6EE7B7' }}>Guaranteed $|f(x)| \le 100.00$ (SwiGLU explodes to {situCalc.swiglu.toFixed(0)})</small>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVATED PARAMETER BREAKDOWN */}
      {activeTab === 'activatedParams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧮 Authoritative Parameter Accounting: 2.78T Total vs. 104.2B Activated
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.02rem', margin: 0, lineHeight: '1.5' }}>
              Sourced directly from Table 1 of the official technical report.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.1rem' }}>📦 Official Structural Specifications</span>
              <ul style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.7', margin: 0, paddingLeft: '20px' }}>
                <li><b>Total Backbone Layers</b>: 93 (1 Dense + 92 MoE)</li>
                <li><b>Hybrid Attention</b>: 69 KDA layers + 24 Gated MLA layers</li>
                <li><b>Dense Intermediate Width (Layer 1)</b>: 33,792</li>
                <li><b>Latent MoE Dimension</b>: 3,584 (0.5× backbone width 7,168)</li>
                <li><b>Routed Experts</b>: 896 total, 16 active per token (hidden width 3,072)</li>
                <li><b>Shared Experts</b>: 2 full-width experts per MoE layer</li>
                <li><b>Native Vision</b>: MoonViT-V2 with 27 layers, 401M parameters</li>
              </ul>
            </div>

            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid #10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ color: '#94A3B8', fontSize: '1.05rem' }}>Active parameters per token:</span>
              <span style={{ fontSize: '2.5rem', color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {KIMI_K3_SPEC.activeParams}
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>~3.75% of the 2.78T total parameter capacity.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
