import React, { useState } from 'react';

type SignalType = 'syntax' | 'vision' | 'logic';

interface RetrievedState {
  name: string;
  type: 'embedding' | 'block-boundary' | 'partial-sum' | 'residual' | 'direct';
  weight: string;
  desc: string;
}

export const AttnResSimulator: React.FC = () => {
  const [mode, setMode] = useState<'standard' | 'attnres'>('standard');
  const [isBlockMode, setIsBlockMode] = useState<boolean>(true);
  const [signal, setSignal] = useState<SignalType>('syntax');
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [hoveredLayerIdx, setHoveredLayerIdx] = useState<number | null>(null);

  // Kimi K3: Group 93 layers into blocks of size 12 for AttnRes
  const totalLayers = 93;
  const blockSize = 12;
  const numBlocks = Math.ceil(totalLayers / blockSize); // 8 blocks

  // Calculate signal strength for a given layer index (0-indexed)
  const getSignalStrength = (layerIdx: number): { percent: number; color: string } => {
    if (mode === 'attnres') {
      // Direct access from AttnRes maintains high signal retention (~90% - 95%)
      return { percent: 95 - (layerIdx % 12) * 0.4, color: '#10B981' }; 
    }
    // Standard PreNorm fades from 100% down to 15%
    const percent = Math.max(15, 100 - (layerIdx / totalLayers) * 85);
    let color = '#10B981'; // Green
    if (percent < 30) color = '#EF4444'; // Red
    else if (percent < 60) color = '#F59E0B'; // Orange/Yellow
    return { percent, color };
  };

  // Determine if targetIdx is attended by the currently hovered layer
  const isAttended = (targetIdx: number): boolean => {
    if (hoveredLayerIdx === null) return false;
    
    // Embedding is index -1
    if (targetIdx === -1) {
      if (hoveredLayerIdx === -1) return false;
      return mode === 'attnres'; // Embedding b0 is always in the retrieval key/value pool for AttnRes
    }
    
    if (hoveredLayerIdx === -1) return false; // Hovering embedding: it doesn't retrieve anything
    if (hoveredLayerIdx <= targetIdx) return false; // Cannot attend to future layers
    
    if (mode === 'standard') {
      // Standard PreNorm residual: only adds the immediately preceding layer
      return targetIdx === hoveredLayerIdx - 1;
    }
    
    // AttnRes Mode
    if (!isBlockMode) {
      // Full retrieval: attends to all prior layers
      return true;
    }
    
    // Block Retrieval
    const currentBlockIdx = Math.floor(hoveredLayerIdx / 12);
    const targetBlockIdx = Math.floor(targetIdx / 12);
    
    // 1. Prior block boundary representations (last layer of each prior block)
    if (targetBlockIdx < currentBlockIdx) {
      const lastLayerOfTargetBlock = (targetBlockIdx + 1) * 12 - 1;
      return targetIdx === lastLayerOfTargetBlock;
    }
    
    // 2. Current block partial sum: prior layers in the same block
    if (targetBlockIdx === currentBlockIdx) {
      return targetIdx < hoveredLayerIdx;
    }
    
    return false;
  };

  // Generate attention weights based on signal type and block index
  const getAttentionWeight = (blockName: string): string => {
    if (signal === 'syntax') {
      if (blockName.includes('b₀') || blockName.includes('Emb')) return '45.2%';
      if (blockName.includes('b_{1}') || blockName.includes('Block 1')) return '32.1%';
      if (blockName.includes('b_{2}') || blockName.includes('Block 2')) return '14.3%';
      if (blockName.includes('b_{3}') || blockName.includes('Block 3')) return '6.1%';
      if (blockName.includes('b_{4}') || blockName.includes('Block 4')) return '1.8%';
      return '0.1%';
    } else if (signal === 'vision') {
      if (blockName.includes('b₀') || blockName.includes('Emb')) return '32.5%';
      if (blockName.includes('b_{1}') || blockName.includes('Block 1')) return '3.1%';
      if (blockName.includes('b_{3}') || blockName.includes('Block 3')) return '24.2%';
      if (blockName.includes('b_{5}') || blockName.includes('Block 5')) return '18.7%';
      if (blockName.includes('b_{7}') || blockName.includes('Block 7')) return '13.9%';
      return '1.5%';
    } else { // logic
      if (blockName.includes('b₀') || blockName.includes('Emb')) return '8.5%';
      if (blockName.includes('b_{1}') || blockName.includes('Block 1')) return '10.2%';
      if (blockName.includes('b_{2}') || blockName.includes('Block 2')) return '11.4%';
      if (blockName.includes('b_{3}') || blockName.includes('Block 3')) return '12.1%';
      if (blockName.includes('b_{4}') || blockName.includes('Block 4')) return '13.5%';
      if (blockName.includes('b_{5}') || blockName.includes('Block 5')) return '14.0%';
      if (blockName.includes('b_{6}') || blockName.includes('Block 6')) return '12.8%';
      if (blockName.includes('b_{7}') || blockName.includes('Block 7')) return '11.5%';
      return '6.0%';
    }
  };

  const getRetrievedStates = (idx: number): RetrievedState[] => {
    const currentBlockIdx = Math.floor(idx / 12);
    const localIdx = (idx % 12) + 1; // 1-indexed inside block
    
    if (mode === 'standard') {
      if (idx === 0) {
        return [{ name: 'Embedding (h₁)', type: 'direct', weight: '100.0%', desc: 'Initial token representation' }];
      }
      return [{ name: `Layer L${idx} Output`, type: 'residual', weight: '100.0%', desc: 'Directly preceding layer state' }];
    }
    
    if (!isBlockMode) {
      const states: RetrievedState[] = [];
      states.push({ name: 'Embedding (b₀)', type: 'embedding', weight: getAttentionWeight('Emb (b₀)'), desc: 'Initial token representation h₁' });
      for (let i = 0; i < idx; i++) {
        states.push({
          name: `Layer L${i + 1} State`,
          type: 'direct',
          weight: idx > 0 ? `${(80 / idx).toFixed(1)}%` : '100.0%',
          desc: `Layer L${i + 1} activation output`
        });
      }
      return states;
    }
    
    // Block AttnRes
    const states: RetrievedState[] = [];
    // 1. Embedding
    states.push({ 
      name: 'Embedding (b₀)', 
      type: 'embedding', 
      weight: getAttentionWeight('Emb (b₀)'),
      desc: 'Initial token representation h₁'
    });
    
    // 2. Prior completed blocks
    for (let b = 0; b < currentBlockIdx; b++) {
      states.push({
        name: `Block ${b + 1} Boundary (b_{${b + 1}})`,
        type: 'block-boundary',
        weight: getAttentionWeight(`Block ${b + 1}`),
        desc: `Sum representation of layers L${b * 12 + 1} - L${(b + 1) * 12}`
      });
    }
    
    // 3. Current block partial sum (if localIdx > 1)
    if (localIdx > 1) {
      states.push({
        name: `Block ${currentBlockIdx + 1} Partial (b_{${currentBlockIdx + 1}}^{${localIdx - 1}})`,
        type: 'partial-sum',
        weight: 'Dynamic sum',
        desc: `Intra-block sum of layers L${currentBlockIdx * 12 + 1} - L${idx}`
      });
    }
    
    return states;
  };

  const renderHoveredLayerInfo = () => {
    if (hoveredLayerIdx === null) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '180px', color: '#64748B', textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '2rem', marginBottom: '10px' }}>💡</span>
          <p style={{ fontSize: '1.02rem' }}>Hover over any layer node (L1-L93) or input embedding (b₀) to analyze the residual retrieval path and math formulas in real time.</p>
        </div>
      );
    }

    if (hoveredLayerIdx === -1) {
      return (
        <div style={{ padding: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#10B981' }}>Token Embedding ($b_0$)</span>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>b₀ = h₁</span>
          </div>
          <p style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.5' }}>
            The root features of the network. It integrates text embeddings and continuous visual features processed via <b>MoonViT-V2</b>. In the <b>Attention Residuals (AttnRes)</b> mechanism, this embedding layer $b_0$ acts as a permanent, block-level representation (Block 0) searchable by all subsequent deep layers.
          </p>
        </div>
      );
    }

    const layerNum = hoveredLayerIdx + 1;
    const blockIdx = Math.floor(hoveredLayerIdx / 12) + 1;
    const localIdx = (hoveredLayerIdx % 12) + 1;
    const isMLA = layerNum % 4 === 0 || layerNum === 93;
    const layerType = isMLA ? 'Gated MLA' : 'Kimi Delta Attention (KDA)';
    
    const retrieved = getRetrievedStates(hoveredLayerIdx);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '1.15rem', color: '#6366F1', fontWeight: 'bold', textTransform: 'uppercase' }}>Layer {layerNum} (L{layerNum})</span>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#FFF', fontWeight: 'bold' }}>{layerType}</h4>
          </div>
          <span className="badge" style={{ background: isMLA ? 'rgba(192, 132, 252, 0.15)' : 'rgba(0, 242, 254, 0.15)', color: isMLA ? '#C084FC' : '#00F2FE' }}>
            Block {blockIdx} · Layer {localIdx}
          </span>
        </div>

        <div style={{ fontSize: '1.02rem', color: '#E2E8F0' }}>
          <strong>📡 Retrieval Connections:</strong>
          <span style={{ color: mode === 'standard' ? '#FFB000' : '#10B981', fontWeight: 'bold', marginLeft: '5px' }}>
            {mode === 'standard' ? '1 Group (Standard Skip)' : isBlockMode ? `${retrieved.length} Groups (Block-sparse)` : `${retrieved.length} Groups (Full AttnRes)`}
          </span>
        </div>

        {/* Dynamic Formula representation */}
        <div className="formula-box" style={{ fontSize: '1.15rem', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '4px' }}>Current Layer Residual Aggregation Formula:</div>
          <div style={{ color: '#00F2FE', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {mode === 'standard' ? (
              <span>{`h_${layerNum} = Layer_${layerNum}(h_${hoveredLayerIdx}) + h_${hoveredLayerIdx}`}</span>
            ) : !isBlockMode ? (
              <span>{`h_${layerNum} = Layer_${layerNum}(x) + ∑_{i=0}^{${hoveredLayerIdx - 1}} α_{i→${layerNum}} · v_i`}</span>
            ) : (
              <span>
                {`h_${layerNum} = Layer_${layerNum}(x) + ∑_{b=0}^{${blockIdx - 1}} α_{b→${layerNum}} · b_b`}
                {localIdx > 1 ? ` + α_{cur→${layerNum}} · b_${blockIdx}^{${localIdx - 1}}` : ''}
              </span>
            )}
          </div>
        </div>

        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '5px' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#94A3B8' }}>Retrieval State Details:</div>
          {retrieved.map((state, sIdx) => {
            let color = '#94A3B8';
            if (state.type === 'embedding') color = '#10B981';
            else if (state.type === 'block-boundary') color = '#818CF8';
            else if (state.type === 'partial-sum') color = '#38BDF8';
            else if (state.type === 'residual') color = '#FFB000';
            else if (state.type === 'direct') color = '#10B981';

            return (
              <div 
                key={sIdx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.01)', 
                  padding: '5px 8px', 
                  borderRadius: '4px',
                  borderLeft: `3px solid ${color}`,
                  fontSize: '1.15rem'
                }}
              >
                <div>
                  <strong style={{ color: '#FFF' }}>{state.name}</strong>
                  <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '1px' }}>{state.desc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color, fontWeight: 'bold' }}>{state.weight}</span>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>Weight (α)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="tab-panel active">
      <header>
        <div className="badge">Chapter 2.2 - Attention Residuals (AttnRes)</div>
        <h1>Attention Residuals (AttnRes) Connections</h1>
        <p className="subtitle">Combating signal dilution of low-level semantic and visual features caused by deep PreNorm stacking</p>
      </header>

      <div className="grid-2">
        {/* Left Column: Interactive Visualizer */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>93-Layer Deep Network Residual Signal Attenuation Flow</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${mode === 'standard' ? 'active' : ''}`}
                onClick={() => { setMode('standard'); setHoveredLayerIdx(null); }}
                style={{ padding: '2px 8px', fontSize: '1.15rem' }}
              >
                Traditional PreNorm Mode
              </button>
              <button 
                className={`btn ${mode === 'attnres' ? 'active' : ''}`}
                onClick={() => { setMode('attnres'); setHoveredLayerIdx(null); }}
                style={{ padding: '2px 8px', fontSize: '1.15rem' }}
              >
                Kimi AttnRes Mode
              </button>
            </div>
          </div>

          <p style={{ fontSize: '1.02rem', color: '#94A3B8', marginBottom: '15px' }}>
            {mode === 'standard' 
              ? "⚠️ Under traditional PreNorm, features extracted at low levels are severely diluted through cumulative residuals. By Layer 93, the signal retention drops to ~15% (red), making it extremely hard for deep layers to capture low-level local or visual details." 
              : "✅ With AttnRes enabled, deep layers use attention to directly retrieve from all preceding Block boundaries and the input embedding, maintaining signal retention above 90% (green) without dilution!"}
          </p>

          {/* Block Mode selector when in AttnRes */}
          {mode === 'attnres' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', background: '#090D16', padding: '8px 12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '1.02rem', color: '#E2E8F0' }}>Block AttnRes Optimization:</span>
              <button 
                className={`btn ${!isBlockMode ? 'active' : ''}`}
                onClick={() => setIsBlockMode(false)}
                style={{ padding: '2px 8px', fontSize: '1.15rem' }}
              >
                Full Retrieval (O(L²))
              </button>
              <button 
                className={`btn ${isBlockMode ? 'active' : ''}`}
                onClick={() => setIsBlockMode(true)}
                style={{ padding: '2px 8px', fontSize: '1.15rem' }}
              >
                Block Retrieval (O(Nd) - Saves 88.7% Memory)
              </button>
            </div>
          )}

          {/* Token Embedding Node b0 */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#090D16',
              padding: '10px 14px',
              borderRadius: '6px',
              border: hoveredLayerIdx !== null && isAttended(-1) 
                ? '1px solid #10B981' 
                : hoveredLayerIdx === -1 
                  ? '1px solid #6366F1'
                  : '1px solid rgba(255,255,255,0.06)',
              boxShadow: hoveredLayerIdx !== null && isAttended(-1) ? '0 0 8px rgba(16,185,129,0.3)' : 'none',
              marginBottom: '12px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredLayerIdx(-1)}
            onMouseLeave={() => setHoveredLayerIdx(null)}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#FFF',
              fontSize: '1.15rem'
            }}>
              b₀
            </div>
            <div>
              <div style={{ fontSize: '1.02rem', fontWeight: 'bold', color: '#FFF' }}>Input Token Embedding ($b_0 = h_1$)</div>
              <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Integrates multimodal image/video features (MoonViT) and word embeddings</div>
            </div>
            {hoveredLayerIdx !== null && isAttended(-1) && (
              <span className="badge" style={{ marginLeft: 'auto', background: '#10B981', color: '#000', fontSize: '0.9rem', padding: '2px 6px' }}>
                Retrieved ({getAttentionWeight('Emb (b₀)')})
              </span>
            )}
          </div>

          {/* Visualizing 93 layers organized in blocks */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              background: '#02040a', 
              padding: '15px', 
              borderRadius: '8px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {Array.from({ length: numBlocks }).map((_, blockIdx) => {
              const startLayer = blockIdx * blockSize;
              const endLayer = Math.min(totalLayers, startLayer + blockSize);
              const isBoundary = mode === 'attnres' && isBlockMode;
              const isTargetBlockHovered = hoveredLayerIdx !== null && Math.floor(hoveredLayerIdx / 12) === blockIdx;

              return (
                <div 
                  key={blockIdx}
                  style={{
                    border: isBoundary 
                      ? isTargetBlockHovered 
                        ? '1px dashed #818CF8' 
                        : '1px dashed rgba(99, 102, 241, 0.4)' 
                      : '1px solid rgba(255,255,255,0.04)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isBoundary 
                      ? isTargetBlockHovered
                        ? 'rgba(99, 102, 241, 0.05)'
                        : 'rgba(99, 102, 241, 0.01)' 
                      : 'transparent',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Block label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#94A3B8', marginBottom: '6px' }}>
                    <span style={{ fontWeight: isTargetBlockHovered ? 'bold' : 'normal', color: isTargetBlockHovered ? '#818CF8' : '#94A3B8' }}>
                      Block {blockIdx + 1} (Layers {startLayer + 1}-{endLayer})
                    </span>
                    {isBoundary && (
                      <span style={{ color: '#818CF8', fontSize: '0.9rem' }}>
                        Block Boundary Representation b_{blockIdx + 1}
                      </span>
                    )}
                  </div>

                  {/* Layers grid */}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {Array.from({ length: endLayer - startLayer }).map((_, localIdx) => {
                      const layerIdx = startLayer + localIdx;
                      const { percent, color } = getSignalStrength(layerIdx);
                      const isLastInBlock = localIdx === (endLayer - startLayer - 1);
                      const isHovered = hoveredLayerIdx === layerIdx;
                      const isAttendedNode = isAttended(layerIdx);

                      // Style for different layer categories
                      let borderStyle = 'rgba(255,255,255,0.08)';
                      let glowShadow = 'none';
                      
                      if (isHovered) {
                        borderStyle = '#6366F1';
                        glowShadow = '0 0 8px rgba(99, 102, 241, 0.6)';
                      } else if (isAttendedNode) {
                        if (mode === 'standard') {
                          borderStyle = '#FFB000';
                          glowShadow = '0 0 6px rgba(255, 176, 0, 0.4)';
                        } else if (!isBlockMode) {
                          borderStyle = '#10B981';
                          glowShadow = '0 0 4px rgba(16, 185, 129, 0.2)';
                        } else {
                          // Block Mode
                          const isBoundaryNode = (layerIdx % 12) === 11;
                          const currentBlockIdx = Math.floor(hoveredLayerIdx !== null ? hoveredLayerIdx / 12 : 0);
                          const targetBlockIdx = Math.floor(layerIdx / 12);
                          
                          if (targetBlockIdx < currentBlockIdx && isBoundaryNode) {
                            borderStyle = '#818CF8'; // Boundary node
                            glowShadow = '0 0 6px rgba(129, 140, 248, 0.5)';
                          } else if (targetBlockIdx === currentBlockIdx) {
                            borderStyle = '#38BDF8'; // Partial sum node
                            glowShadow = '0 0 4px rgba(56, 189, 248, 0.3)';
                          }
                        }
                      } else if (isBoundary && isLastInBlock) {
                        borderStyle = 'rgba(129, 140, 248, 0.4)'; // Default boundary border
                      }

                      return (
                        <div 
                          key={layerIdx}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            background: isHovered ? '#1E293B' : isAttendedNode ? 'rgba(255,255,255,0.04)' : '#0F172A',
                            border: `1px solid ${borderStyle}`,
                            boxShadow: glowShadow,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={() => setHoveredLayerIdx(layerIdx)}
                          onMouseLeave={() => setHoveredLayerIdx(null)}
                          title={`Layer ${layerIdx + 1} · Signal Retention: ${percent.toFixed(0)}%`}
                        >
                          <span style={{ fontSize: '0.9rem', color: isHovered ? '#FFF' : '#E2E8F0', fontWeight: 'bold' }}>
                            L{layerIdx + 1}
                          </span>
                          
                          {/* Signal strength indicator bar */}
                          <div 
                            style={{ 
                              position: 'absolute', 
                              bottom: '2px', 
                              left: '2px', 
                              right: '2px', 
                              height: '2.5px', 
                              background: '#222',
                              borderRadius: '1px'
                            }}
                          >
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${percent}%`, 
                                background: color,
                                borderRadius: '1px',
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive signal type selector */}
          {mode === 'attnres' && (
            <div className="control-panel" style={{ marginTop: '15px' }}>
              <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>Adaptive Signal Routing Task Simulation:</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  className={`btn ${signal === 'syntax' ? 'active' : ''}`}
                  onClick={() => setSignal('syntax')}
                  style={{ padding: '4px 10px', fontSize: '1.15rem' }}
                >
                  Syntax/Grammar (attend shallow layers)
                </button>
                <button 
                  className={`btn ${signal === 'vision' ? 'active' : ''}`}
                  onClick={() => setSignal('vision')}
                  style={{ padding: '4px 10px', fontSize: '1.15rem' }}
                >
                  Image Details (cross-layer search)
                </button>
                <button 
                  className={`btn ${signal === 'logic' ? 'active' : ''}`}
                  onClick={() => setSignal('logic')}
                  style={{ padding: '4px 10px', fontSize: '1.15rem' }}
                >
                  Logical Reasoning (direct deep routing)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Signal degradation chart and dynamic analysis */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="card-title">📉 Signal Decay Comparison & Retrieval Analysis</div>

          {/* Signal Strength Comparison Chart */}
          <div style={{ background: '#02040a', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.02rem', color: '#E2E8F0', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
              Signal Retention vs. Network Depth (Layers 1-93)
            </div>
            <svg width="100%" height="130" viewBox="0 0 300 130">
              {/* Axes */}
              <line x1="30" y1="100" x2="280" y2="100" stroke="#475569" strokeWidth="1" />
              <line x1="30" y1="15" x2="30" y2="100" stroke="#475569" strokeWidth="1" />
              <text x="155" y="120" fill="#94A3B8" fontSize="13" textAnchor="middle">Network Depth (Layer Index)</text>
              <text x="10" y="57" fill="#94A3B8" fontSize="13" transform="rotate(-90 10 57)" textAnchor="middle">Signal Retention (%)</text>
              
              <text x="25" y="18" fill="#94A3B8" fontSize="12" textAnchor="end">100%</text>
              <text x="25" y="57" fill="#94A3B8" fontSize="12" textAnchor="end">50%</text>
              <text x="25" y="103" fill="#94A3B8" fontSize="12" textAnchor="end">0%</text>

              {/* Standard PreNorm Curve (Decay to 15%) */}
              <path d="M 30 15 Q 120 60 280 88" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="3" />
              <text x="200" y="80" fill="#EF4444" fontSize="13">PreNorm Severe Dilution</text>

              {/* AttnRes Curve (Maintained near 95%) */}
              <path d="M 30 15 L 280 20" fill="none" stroke="#10B981" strokeWidth="2.5" />
              <text x="200" y="32" fill="#10B981" fontSize="13" fontWeight="bold">AttnRes High Fidelity (90%+)</text>
            </svg>
          </div>

          {/* Hover Analysis Tooltip Area */}
          <div style={{ background: '#090D16', border: '1px solid rgba(255,255,255,0.06)', padding: '15px', borderRadius: '8px', minHeight: '240px' }}>
            {renderHoveredLayerInfo()}
          </div>

          {/* Dynamic Nodes Count Chart */}
          {hoveredLayerIdx !== null && hoveredLayerIdx >= 0 && (
            <div style={{ background: '#090D16', padding: '12px', borderRadius: '6px', fontSize: '1.02rem', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontWeight: 'bold', color: '#FFF', marginBottom: '8px' }}>🎯 Memory Resident States (Current Depth: L{hoveredLayerIdx + 1})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: '#94A3B8' }}>Standard PreNorm Mode:</span>
                    <span style={{ color: '#FFB000', fontWeight: 'bold' }}>1 State</span>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '1.5%', height: '100%', background: '#FFB000' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: '#94A3B8' }}>Full AttnRes (Full Mode):</span>
                    <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{hoveredLayerIdx + 1} States</span>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(2, ((hoveredLayerIdx + 1) / 93) * 100)}%`, height: '100%', background: '#EF4444' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: '#94A3B8' }}>Block AttnRes (Block-sparse Mode):</span>
                    <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                      {Math.floor(hoveredLayerIdx / 12) + 1 + ((hoveredLayerIdx % 12) > 0 ? 1 : 0)} States (Saves {(((hoveredLayerIdx + 1) - (Math.floor(hoveredLayerIdx / 12) + 1 + ((hoveredLayerIdx % 12) > 0 ? 1 : 0))) / (hoveredLayerIdx + 1) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${Math.max(2, ((Math.floor(hoveredLayerIdx / 12) + 1 + ((hoveredLayerIdx % 12) > 0 ? 1 : 0)) / 93) * 100)}%`, 
                        height: '100%', 
                        background: '#10B981' 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retrieval Distance Metaphor */}
          <div style={{ background: '#090D16', padding: '12px', borderRadius: '6px', fontSize: '1.02rem', lineHeight: '1.5' }}>
            <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>📡 Retrieval Complexity Notes</span>
            <p style={{ color: '#94A3B8', marginTop: '5px' }}>
              • <b>Full Retrieval (Full AttnRes):</b> Every layer back-searches all preceding layers and embeddings. Layer 93 retrieves 93 state nodes. Memory and cross-node communication complexity explode at $O(L^2)$ with depth.
            </p>
            <p style={{ color: '#94A3B8', marginTop: '5px' }}>
              • <b>Block Retrieval (Block AttnRes):</b> Kimi K3 groups the 93 layers into 8 blocks of 12 layers. Deeper layers only retrieve block-level summary representations b_n and the current block's local accumulations b_n^(i-1), cutting maximum resident states from 93 to 9, <b>reducing memory and communication overhead by 88.7%</b>.
            </p>
          </div>

          {/* Collapsible Math Panel */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <button 
              className="btn" 
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex', fontSize: '1.02rem', padding: '8px 12px' }}
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>{showFormula ? '▼ Collapse Mathematical Principles & Formulas' : '▶ Click to View Mathematical Principles & Formulas'}</span>
            </button>

            {showFormula && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Full Attention Residuals (Full AttnRes) Computation (Eq 8 & Eq 9):</strong>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace', margin: '4px 0' }}>
                    α_(i→l) = exp(q_lᵀ · RMSNorm(k_i)) / Σ_j exp(q_lᵀ · RMSNorm(k_j))
                  </div>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                    h_l = Layer_l(x) + Σ_(i=0) to (l-1) α_(i→l) · v_i
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Block Attention Residuals (Block AttnRes) Formula (Eq 10):</strong>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace', margin: '4px 0' }}>
                    V = [b_0, b_1, ..., b_n-1]ᵀ (if i=1, block first layer)
                  </div>
                  <div style={{ color: '#38BDF8', fontFamily: 'monospace', margin: '4px 0' }}>
                    V = [b_0, b_1, ..., b_n-1, b_n^(i-1)]ᵀ (if i≥2, block subsequent layers)
                  </div>
                  <div style={{ color: '#10B981', fontSize: '1.15rem', marginTop: '4px' }}>
                    where b_0 = h₁ is the token embedding, b_k = Σ_(j∈B_k) f_j(h_j) is the summed output of the k-th block.
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>Resident Memory & Communication Complexity Reduction:</strong>
                  <div style={{ color: '#F59E0B', fontFamily: 'monospace', margin: '4px 0' }}>
                    Space/Comm Overhead: O(L·d) → O(N·d) (L = 93 layers, N = 8 blocks)
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '1.15rem', lineHeight: '1.4' }}>
                    For Kimi K3 (93 layers): Full AttnRes requires 4,371 layer-to-layer connections. Block partitioning (12 layers/block) requires only 493 connections, <b>reducing resident memory activations and cross-stage pipeline communication overhead by 88.7% (releasing ~8.8x compute capacity)</b>.
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
