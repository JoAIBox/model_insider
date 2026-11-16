import React, { useState } from 'react';

export const UnembeddingOperatorDeepDive: React.FC = () => {
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);
  const [sampledToken, setSampledToken] = useState<string>('Kimi');
  const [activeTab, setActiveTab] = useState<'formula' | 'logitsSoftmax' | 'sampling'>('formula');

  // Sample logits for top 5 tokens in vocabulary
  const sampleLogits = [
    { token: 'Kimi', logit: 12.4, id: 4821 },
    { token: 'DeepSeek', logit: 11.2, id: 9102 },
    { token: 'Architecture', logit: 9.8, id: 1420 },
    { token: 'Transformer', logit: 8.5, id: 3310 },
    { token: 'Token', logit: 7.1, id: 504 },
  ];

  // Temperature scaled logits & Softmax
  const scaledLogits = sampleLogits.map(item => item.logit / temperature);
  const maxLogit = Math.max(...scaledLogits);
  const expLogits = scaledLogits.map(l => Math.exp(l - maxLogit));
  const sumExp = expLogits.reduce((a, b) => a + b, 0);
  const probabilities = expLogits.map(e => e / sumExp);

  const samplingCandidates = sampleLogits
    .map((item, idx) => ({ ...item, probability: probabilities[idx] }))
    .sort((a, b) => b.probability - a.probability)
    .reduce<Array<typeof sampleLogits[number] & { probability: number; cumulative: number; included: boolean }>>((items, item) => {
      const previousCumulative = items[items.length - 1]?.cumulative ?? 0;
      const cumulative = previousCumulative + item.probability;
      return [...items, { ...item, cumulative, included: previousCumulative < topP }];
    }, []);

  const sampleNextToken = () => {
    const retained = samplingCandidates.filter(candidate => candidate.included);
    const retainedMass = retained.reduce((sum, candidate) => sum + candidate.probability, 0);
    let draw = Math.random() * retainedMass;
    const selected = retained.find(candidate => {
      draw -= candidate.probability;
      return draw <= 0;
    }) ?? retained[retained.length - 1];
    setSampledToken(selected.token);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div className="operator-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              Unembedding (output prediction head): operator principles and derivation
            </h2>
            <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid #F59E0B', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Final Logits & Token Probability Generator
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            The complete mathematical path from the final Kimi K3 hidden state h_(T,93) (7,168-d) through final RMSNorm and vocabulary projection to the next token.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('formula')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'formula' ? '#F59E0B' : 'transparent',
              color: activeTab === 'formula' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. Full derivation
          </button>
          <button
            onClick={() => setActiveTab('logitsSoftmax')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'logitsSoftmax' ? '#38BDF8' : 'transparent',
              color: activeTab === 'logitsSoftmax' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. Logits and Softmax probability simulator
          </button>
          <button
            onClick={() => setActiveTab('sampling')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'sampling' ? '#10B981' : 'transparent',
              color: activeTab === 'sampling' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. Temperature and Top-p sampling console
          </button>
        </div>
      </div>

      {/* TAB 1: FORMULA & MATHEMATICAL FLOW */}
      {activeTab === 'formula' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formula Card */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: 0, fontWeight: 'bold' }}>
              📐 Unembedding core computation
            </h3>
            
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '1.1rem', color: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>// 1. Final RMSNorm</div>
              <div style={{ color: '#38BDF8' }}>h_final = RMSNorm( h_(T,93) ) (width: 7,168)</div>
                <div>// 2. Vocabulary projection produces the logits vector</div>
              <div style={{ color: '#A78BFA' }}>z = W_unembed · h_final (vocabulary size V = 163,840 [160K])</div>
                <div>// 3. Temperature scaling and Softmax probability distribution</div>
              <div style={{ color: '#10B981' }}>P(w_i) = exp( z_i / T ) / Σ_j exp( z_j / T )</div>
            </div>
          </div>

          {/* SVG Diagram */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 820 260" width="100%" height="260" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrow-unembed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* Layer 93 Output */}
              <rect x="20" y="90" width="150" height="80" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="95" y="125" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Layer 93 h_T</text>
              <text x="95" y="148" fill="#94A3B8" fontSize="13" fontFamily="monospace" textAnchor="middle">ℝ^(7,168)</text>

              <line x1="170" y1="130" x2="230" y2="130" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-unembed)" />

              {/* Final RMSNorm */}
              <rect x="230" y="90" width="150" height="80" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <text x="305" y="125" fill="#38BDF8" fontSize="15" fontWeight="bold" textAnchor="middle">Final RMSNorm</text>
              <text x="305" y="148" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">normalized state</text>

              <line x1="380" y1="130" x2="440" y2="130" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-unembed)" />

              {/* W_unembed Projection */}
              <rect x="440" y="90" width="180" height="80" rx="8" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="2" />
              <text x="530" y="125" fill="#F59E0B" fontSize="15" fontWeight="bold" textAnchor="middle">W_unembed matrix</text>
              <text x="530" y="148" fill="#FFF" fontSize="13" fontFamily="monospace" textAnchor="middle">163,840 × 7,168</text>

              <line x1="620" y1="130" x2="680" y2="130" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-unembed)" />

              {/* Token Probabilities */}
              <rect x="680" y="90" width="130" height="80" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
              <text x="745" y="125" fill="#FFF" fontSize="15" fontWeight="bold" textAnchor="middle">Token probabilities P</text>
              <text x="745" y="148" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Softmax(z/T)</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE TEMPERATURE & LOGITS SIMULATOR */}
      {activeTab === 'logitsSoftmax' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧪 How Temperature (T) changes probability sharpness
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              Drag the temperature slider to see how the Top-5 candidate logits become a probability distribution.
            </p>
          </div>

          <div className="unembedding-stage-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Control Sliders */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>Sampling controls</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Temperature (T):</span>
                  <span style={{ color: '#F59E0B', fontWeight: 'bold', fontFamily: 'monospace' }}>{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>Top-p (Nucleus Cutoff):</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Probability Histogram */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>Top candidate-token probability distribution</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sampleLogits.map((item, idx) => {
                  const prob = probabilities[idx];
                  const probPercent = (prob * 100).toFixed(1);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span style={{ color: '#FFF', fontWeight: 'bold' }}>"{item.token}" (ID: {item.id})</span>
                        <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>{probPercent}%</span>
                      </div>
                      <div style={{ background: '#0F172A', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ background: idx === 0 ? '#10B981' : '#38BDF8', width: `${probPercent}%`, height: '100%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE NUCLEUS SAMPLING CONSOLE */}
      {activeTab === 'sampling' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🎲 Temperature and Top-p sampling console
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              Temperature rescales logits. Top-p keeps the smallest probability-ranked nucleus whose cumulative probability reaches the selected threshold, then sampling chooses one token from that retained set.
            </p>
          </div>

          <div className="unembedding-sampling-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '18px' }}>
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ color: '#FFF', fontWeight: 'bold' }}>Interactive controls</span>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#94A3B8' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Temperature (T)</span><b style={{ color: '#F59E0B' }}>{temperature.toFixed(2)}</b>
                </span>
                <input type="range" min="0.1" max="2.0" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#94A3B8' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Top-p nucleus</span><b style={{ color: '#10B981' }}>{topP.toFixed(2)}</b>
                </span>
                <input type="range" min="0.1" max="1.0" step="0.05" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} />
              </label>
              <button className="btn-primary" onClick={sampleNextToken}>Sample next token</button>
              <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Illustrative sample result</div>
                <div style={{ color: '#10B981', fontSize: '1.35rem', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '4px' }}>&quot;{sampledToken}&quot;</div>
              </div>
            </div>

            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
              <div style={{ color: '#FFF', fontWeight: 'bold', marginBottom: '10px' }}>Nucleus boundary and cumulative probability</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 1fr) 90px 110px 90px', gap: '8px', minWidth: '520px', color: '#64748B', fontSize: '0.85rem', paddingBottom: '6px', borderBottom: '1px solid #1E293B' }}>
                <span>Candidate Token</span><span>Probability</span><span>Cumulative</span><span>Status</span>
              </div>
              {samplingCandidates.map((candidate) => (
                <div key={candidate.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 1fr) 90px 110px 90px', gap: '8px', minWidth: '520px', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#E2E8F0' }}>
                  <span style={{ fontFamily: 'monospace' }}>&quot;{candidate.token}&quot; <small style={{ color: '#64748B' }}>ID {candidate.id}</small></span>
                  <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>{(candidate.probability * 100).toFixed(1)}%</span>
                  <span style={{ color: candidate.cumulative >= topP && candidate.included ? '#F59E0B' : '#94A3B8', fontFamily: 'monospace' }}>{(candidate.cumulative * 100).toFixed(1)}%</span>
                  <span style={{ color: candidate.included ? '#10B981' : '#F87171', fontWeight: 'bold' }}>{candidate.included ? 'Included' : 'Excluded'}</span>
                </div>
              ))}
              <small style={{ display: 'block', color: '#94A3B8', marginTop: '10px', lineHeight: '1.45' }}>
                Teaching slice: 5 displayed candidates from the official 163,840-token vocabulary (160K display). The full model applies the same rule over the complete vocabulary distribution.
              </small>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
