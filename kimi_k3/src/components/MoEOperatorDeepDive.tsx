import React, { useState } from 'react';

export const MoEOperatorDeepDive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routing' | 'loadBalance' | 'activatedParams'>('routing');
  const [qbApplied, setQbApplied] = useState(false);
  const activatedParamsPerToken = "104.2B";
  const qbLoadsBefore = [8, 8, 6, 5, 4, 3, 1, 1];
  const qbLoadsAfter = [5, 5, 5, 5, 4, 4, 4, 4];
  const qbTargetLoad = 36 / 8;
  const qbBiases = qbLoadsBefore.map((load) => Number(((qbTargetLoad - load) * 0.12).toFixed(2)));

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
            Kimi K3’s sparse activation path: each token routes to Top-16 of 896 routed experts, alongside 2 always-active shared experts.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
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
            1. Router formula and compute flow
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
            2. Load balancing without an auxiliary loss
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
            3. 104.2B active-parameter accounting
          </button>
        </div>
      </div>

      {/* TAB 1: ROUTING FORMULA & FLOW */}
      {activeTab === 'routing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: 0, fontWeight: 'bold' }}>
              📐 Stable LatentMoE routing and mixture-weight formula
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>// 1. Router scores and QB-adjusted dispatch</div>
              <div style={{ color: '#38BDF8' }}>s_t = Sigmoid(W_r · x_t),  T_16 = Top16(s_t + b_t)</div>
              <div>// 2. QB bias chooses experts but does not change mixture weights</div>
              <div style={{ color: '#38BDF8' }}>p_i = s_(i,t) / Σ_(j∈T_16) s_(j,t)</div>
              <div>// 3. Shared full-width path + latent routed path</div>
              <div style={{ color: '#10B981' }}>y_t = E_1^shared(x_t) + E_2^shared(x_t) + W↑ RMSNorm(Σ p_i E_i(W↓x_t))</div>
            </div>
          </div>

          {/* SVG Routing Flow Diagram */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 840 280" width="100%" height="280" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-moe" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                </marker>
              </defs>

              {/* Input Token x_t */}
              <rect x="20" y="100" width="140" height="80" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="90" y="135" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Input Token x_t</text>
              <text x="90" y="158" fill="#94A3B8" fontSize="13" fontFamily="monospace" textAnchor="middle">ℝ^(7,168)</text>

              <line x1="160" y1="140" x2="230" y2="140" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-moe)" />

              {/* Gating Router Matrix W_g */}
              <rect x="230" y="100" width="180" height="80" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="320" y="130" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">QB Router</text>
              <text x="320" y="152" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">Sigmoid scores + bias → Top-16</text>

              {/* Split to Shared and Routed Experts */}
              <line x1="410" y1="120" x2="480" y2="60" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="410" y1="160" x2="480" y2="220" stroke="#10B981" strokeWidth="1.5" />

              {/* Shared Experts Box */}
              <rect x="480" y="30" width="180" height="60" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
              <text x="570" y="58" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">2 shared experts</text>
              <text x="570" y="76" fill="#94A3B8" fontSize="12" textAnchor="middle">always active</text>

              {/* Routed Experts Grid */}
              <rect x="480" y="190" width="180" height="60" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <text x="570" y="218" fill="#10B981" fontSize="14" fontWeight="bold" textAnchor="middle">Top-16 routed experts</text>
              <text x="570" y="236" fill="#94A3B8" fontSize="12" textAnchor="middle">W↓: 7,168→3,584 · 896 candidates</text>

              {/* Weighted Sum */}
              <line x1="660" y1="60" x2="710" y2="120" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="660" y1="220" x2="710" y2="160" stroke="#10B981" strokeWidth="1.5" />

              <rect x="710" y="100" width="110" height="80" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="765" y="135" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle">Output y_t</text>
              <text x="765" y="156" fill="#38BDF8" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">aggregate → W↑</text>
            </svg>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0, lineHeight: '1.45' }}>
            The diagram separates routing from expert computation for readability: the 2 shared experts receive the 7,168-d input directly; only the routed branch first passes through W↓ to 3,584 dimensions.
          </p>
        </div>
      )}

      {/* TAB 2: QUANTILE BALANCING SIMULATION */}
      {activeTab === 'loadBalance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 8px', fontWeight: 'bold' }}>
              ⚖️ Quick Balance (QB): one batch, then a next-step routing correction
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, lineHeight: '1.55' }}>
              This eight-expert slice is a teaching proxy for the reported 896-expert router. Click the button to simulate a skewed batch and apply a simplified quantile-based bias update. The real QB update is computed from batch scores, takes effect on the next routing step, and is frozen at inference.
            </p>
          </div>

          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <div style={{ color: '#38BDF8' }}>s_i = Sigmoid(W_r x_i)</div>
            <div style={{ color: '#38BDF8' }}>dispatch: T_i = Top-k(s_i + b_i)</div>
            <div style={{ color: '#10B981' }}>mixture: p_i = s_i / Σ selected s_j  <span style={{ color: '#94A3B8' }}>(bias is not in p_i)</span></div>
            <div style={{ color: '#FCD34D' }}>QB: b_j(next step) uses quantile margins around the Top-(k+1) cutoff</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setQbApplied((applied) => !applied)}>
              {qbApplied ? 'Reset to imbalanced batch' : 'Simulate imbalanced batch and apply QB'}
            </button>
            <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
              {qbApplied ? 'Next-step dispatch after the illustrative bias correction' : 'Before QB: a burst is concentrated on E0–E2'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(70px, 1fr))', gap: '8px' }}>
            {qbLoadsBefore.map((load, index) => {
              const shownLoad = qbApplied ? qbLoadsAfter[index] : load;
              const isOverloaded = load > qbTargetLoad;
              return (
                <div key={index} style={{ background: '#070913', padding: '10px 7px', borderRadius: '6px', border: `1px solid ${isOverloaded && !qbApplied ? '#F59E0B' : '#334155'}`, textAlign: 'center' }}>
                  <div style={{ color: '#CBD5E1', fontFamily: 'monospace', fontWeight: 'bold' }}>E{index}</div>
                  <div style={{ height: '74px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', margin: '7px 0' }}>
                    <div style={{ width: '22px', height: `${shownLoad / 8 * 100}%`, minHeight: '5px', background: qbApplied ? '#10B981' : (isOverloaded ? '#F59E0B' : '#38BDF8'), borderRadius: '3px 3px 0 0', transition: 'height 0.35s ease' }} />
                  </div>
                  <div style={{ color: qbApplied ? '#6EE7B7' : '#E2E8F0', fontFamily: 'monospace' }}>{shownLoad} tokens</div>
                  <div style={{ color: qbApplied ? '#94A3B8' : (qbBiases[index] < 0 ? '#FCA5A5' : '#93C5FD'), fontSize: '0.76rem', marginTop: '4px', fontFamily: 'monospace' }}>
                    b={qbApplied ? qbBiases[index].toFixed(2) : '0.00'}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.45)', borderRadius: '6px', padding: '12px', color: '#FDE68A', lineHeight: '1.45' }}>
              <b>Critical direction of the correction:</b> because dispatch uses <code>s+b</code>, an overloaded expert gets a lower bias and an underused expert gets a higher bias. This discourages concentration; it does not “boost” the overloaded expert.
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.45)', borderRadius: '6px', padding: '12px', color: '#A7F3D0', lineHeight: '1.45' }}>
              <b>What remains unchanged:</b> the bias changes dispatch eligibility only. The mixture weights still use the raw sigmoid scores of the selected experts, and the correction is a batch-level next-step update rather than an instant per-token rewrite.
            </div>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0 }}>
            Teaching batch: 36 routed assignments across 8 displayed experts, target q = m·k/n = 36·1/8 = 4.5 assignments. Integer loads need not be perfectly equal.
          </p>
        </div>
      )}

      {/* TAB 3: ACTIVATED PARAMETER BREAKDOWN */}
      {activeTab === 'activatedParams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧮 Exact accounting: 2.78T total parameters vs. 104.2B active parameters
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              The full model has 2.78T parameters, but sparse routing activates a much smaller per-token compute path. The report’s accounting gives 104.2B active parameters; this is an activation count, not a direct throughput guarantee.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1.1rem' }}>📦 Core component accounting</span>
              <ul style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                <li><b>MoonViT-V2 vision encoder</b>: 401M parameters (run once per image);</li>
                <li><b>93-layer hybrid backbone</b>: 69 KDA + 24 MLA layers;</li>
                <li><b>2 shared experts</b>: active for every token;</li>
                <li><b>Top-16 routed experts</b>: 16 of 896 candidates are selected.</li>
              </ul>
            </div>

            <div style={{ background: '#070913', padding: '18px', borderRadius: '8px', border: '1px solid #10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ color: '#94A3B8', fontSize: '1.05rem' }}>Active parameters per token:</span>
              <span style={{ fontSize: '2.5rem', color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {activatedParamsPerToken}
              </span>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>3.75% of the 2.78T total-parameter count.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
