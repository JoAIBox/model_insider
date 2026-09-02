import React, { useState, useEffect, useRef } from 'react';

const sampleTokens = [
  { text: 'Qwen', isKey: true, role: '模型' },
  { text: '3.8', isKey: true, role: '版本' },
  { text: '是', isKey: false, role: '谓词' },
  { text: '一个', isKey: false, role: '量词' },
  { text: '混合', isKey: true, role: '架构' },
  { text: '注意力', isKey: true, role: '核心' },
  { text: '模型', isKey: false, role: '名词' }
];

export const GDNDeepDive: React.FC = () => {
  const [tokenIndex, setTokenIndex] = useState(0);
  const [subStep, setSubStep] = useState<'decay' | 'write' | 'read'>('decay');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1800);
  const [viewMode, setViewMode] = useState<'math' | 'analogy'>('analogy');
  const [contextLength, setContextLength] = useState(128);
  const [userAlpha, setUserAlpha] = useState(0.85);
  const [patternMode, setPatternMode] = useState<'familiar' | 'novel'>('novel');
  const [matrixState, setMatrixState] = useState([
    [0.42, 0.15, 0.78, 0.31],
    [0.64, 0.89, 0.22, 0.55],
    [0.11, 0.37, 0.93, 0.46],
    [0.82, 0.05, 0.61, 0.74]
  ]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSubStep((prev) => {
          if (prev === 'decay') return 'write';
          if (prev === 'write') return 'read';
          
          setTokenIndex((t) => (t + 1) % sampleTokens.length);
          return 'decay';
        });
      }, speedMs / 3);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs]);

  const handleNext = () => {
    setSubStep((prev) => {
      if (prev === 'decay') return 'write';
      if (prev === 'write') return 'read';
      setTokenIndex((t) => (t + 1) % sampleTokens.length);
      return 'decay';
    });
  };

  const handlePrev = () => {
    setSubStep((prev) => {
      if (prev === 'read') return 'write';
      if (prev === 'write') return 'decay';
      setTokenIndex((t) => (t - 1 + sampleTokens.length) % sampleTokens.length);
      return 'read';
    });
  };

  const memoryAttention = contextLength * contextLength * 0.0001;
  const memoryGDN = 4 * 4 * contextLength * 0.001; // constant per token conceptually, but plotting total size

  const currentToken = sampleTokens[tokenIndex];

  return (
    <div style={{
      fontFamily: 'Manrope, sans-serif',
      color: '#e2e8f0',
      backgroundColor: '#070a12',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>⚡ Gated DeltaNet (GDN): 门控增量线性注意力</span>
            <span style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(103, 232, 249, 0.1)', color: '#67e8f9', borderRadius: '12px', border: '1px solid rgba(103, 232, 249, 0.2)' }}>
              占骨干 75% 的核心算子
            </span>
          </h2>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setViewMode('analogy')}
            style={{ 
              padding: '6px 12px', 
              background: viewMode === 'analogy' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              border: 'none', 
              color: viewMode === 'analogy' ? '#fff' : '#888',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>💡 类比模式</button>
          <button 
            onClick={() => setViewMode('math')}
            style={{ 
              padding: '6px 12px', 
              background: viewMode === 'math' ? 'rgba(255,255,255,0.1)' : 'transparent', 
              border: 'none', 
              color: viewMode === 'math' ? '#fff' : '#888',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>🧮 数学模式</button>
        </div>
      </div>

      {/* 2. 创新亮点 */}
      <div style={{
        background: '#0e1421',
        borderRadius: '12px',
        padding: '20px',
        borderLeft: '4px solid #67e8f9',
        border: '1px solid rgba(103, 232, 249, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#67e8f9' }}>⭐ 创新亮点：为什么不用标准 Attention？</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1, background: 'rgba(255,0,0,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,0,0,0.1)' }}>
            <div style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '8px' }}>❌ 标准注意力 O(N²) 瓶颈</div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>随着上下文长度增加，计算量和内存呈平方级爆炸。</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,0,0,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,0,0,0.1)' }}>
            <div style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '8px' }}>❌ 传统线性注意力遗忘</div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>将新信息盲目叠加，导致重要历史信息被噪声淹没。</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(103,232,249,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(103,232,249,0.2)' }}>
            <div style={{ color: '#67e8f9', fontWeight: 'bold', marginBottom: '8px' }}>✅ GDN 解决方案</div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>结合 Delta Rule 与门控机制，实现 O(1) 状态更新，精准修正记忆。</div>
          </div>
        </div>
        
        {/* Evolution Timeline SVG */}
        <div style={{ height: '60px', width: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 60">
            <line x1="50" y1="30" x2="750" y2="30" stroke="#334155" strokeWidth="2" />
            {[
              { label: '标准注意力', x: 50 },
              { label: 'Flash Attention', x: 225 },
              { label: '线性注意力', x: 400 },
              { label: 'DeltaNet', x: 575 },
              { label: 'GDN', x: 750, highlight: true }
            ].map((node, i) => (
              <g key={i} transform={`translate(${node.x}, 30)`}>
                <circle r={node.highlight ? "8" : "6"} fill={node.highlight ? "#67e8f9" : "#475569"} />
                <text y="-15" textAnchor="middle" fill={node.highlight ? "#67e8f9" : "#94a3b8"} fontSize="12px">{node.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 3. 设计动机 */}
      <div style={{
        background: '#0e1421',
        borderRadius: '12px',
        padding: '20px',
        borderLeft: '4px solid #c4b5fd',
        border: '1px solid rgba(196, 181, 253, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#c4b5fd' }}>💡 设计动机：Delta Rule 的核心思想</h3>
        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
          标准的线性注意力更新状态为 <code style={{ fontFamily: 'DM Mono', color: '#fff', background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>S_t = S_{'{t-1}'} + v_t k_t^T</code>，这是一种盲目的覆盖，容易导致早期重要信息的遗忘。
          <br/><br/>
          GDN (Gated DeltaNet) 采用了 <strong>Delta Rule</strong>：只向记忆中写入<strong>当前观测值与现有记忆预测值之间的差异（Residual δ）</strong>。
          同时引入数据依赖的<strong>衰减门控（Gate α_t）</strong>，允许模型在保留重要长期记忆的同时，灵活擦除无用信息。
        </p>
      </div>

      {/* 4. Three-panel interactive console */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        
        {/* Left Panel: Dataflow SVG animation */}
        <div style={{ background: '#0e1421', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: '#e2e8f0' }}>内部数据流</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePrev} style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>⏮</button>
              <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: '#67e8f9', border: 'none', color: '#000', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isPlaying ? '暂停' : '播放'}
              </button>
              <button onClick={handleNext} style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>⏭</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
            {sampleTokens.map((token, i) => (
              <div key={i} 
                onClick={() => setTokenIndex(i)}
                style={{ 
                  padding: '6px 12px', 
                  background: i === tokenIndex ? 'rgba(103, 232, 249, 0.2)' : '#1e293b',
                  border: `1px solid ${i === tokenIndex ? '#67e8f9' : 'transparent'}`,
                  borderRadius: '6px',
                  color: i === tokenIndex ? '#67e8f9' : '#94a3b8',
                  cursor: 'pointer',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                {token.text}
              </div>
            ))}
          </div>

          <div style={{ width: '100%', background: '#070a12', borderRadius: '8px', padding: '16px', overflow: 'hidden' }}>
            <svg width="100%" viewBox="0 0 540 260">
              {/* Token Input */}
              <text x="50" y="40" fill="#94a3b8" fontSize="14px" fontFamily="DM Mono">Input Token (x_t): {currentToken.text}</text>
              
              {/* Gate Alpha Box */}
              <rect x="50" y="60" width="100" height="40" rx="4" fill={subStep === 'decay' ? "rgba(103, 232, 249, 0.2)" : "rgba(103, 232, 249, 0.05)"} stroke="#67e8f9" strokeWidth="2"/>
              <text x="100" y="85" textAnchor="middle" fill={subStep === 'decay' ? "#67e8f9" : "#64748b"} fontSize="12px">Gate α_t (Decay)</text>

              {/* State Matrix */}
              <g transform="translate(220, 90)">
                <text x="60" y="-15" textAnchor="middle" fill="#c4b5fd" fontSize="14px">Memory State (S_t)</text>
                <rect x="0" y="0" width="120" height="120" rx="8" fill="rgba(196, 181, 253, 0.05)" stroke="#c4b5fd" strokeWidth="1"/>
                {matrixState.map((row, i) => 
                  row.map((val, j) => (
                    <rect key={`${i}-${j}`} x={j * 30 + 4} y={i * 30 + 4} width="22" height="22" rx="2" 
                      fill={`rgba(196, 181, 253, ${subStep === 'write' ? Math.min(val + 0.3, 1) : val})`} />
                  ))
                )}
              </g>

              {/* Write Box (Delta) */}
              <rect x="50" y="140" width="100" height="40" rx="4" fill={subStep === 'write' ? "rgba(251, 191, 36, 0.2)" : "rgba(251, 191, 36, 0.05)"} stroke="#fbbf24" strokeWidth="2"/>
              <text x="100" y="165" textAnchor="middle" fill={subStep === 'write' ? "#fbbf24" : "#64748b"} fontSize="12px">Delta Write (δ_t)</text>
              
              {/* Read Box */}
              <rect x="390" y="140" width="100" height="40" rx="4" fill={subStep === 'read' ? "rgba(52, 211, 153, 0.2)" : "rgba(52, 211, 153, 0.05)"} stroke="#34d399" strokeWidth="2"/>
              <text x="440" y="165" textAnchor="middle" fill={subStep === 'read' ? "#34d399" : "#64748b"} fontSize="12px">Read (y_t)</text>

              {/* Arrows */}
              <path d="M150 80 L210 80" stroke={subStep === 'decay' ? "#67e8f9" : "#334155"} strokeWidth="2" markerEnd="url(#arrow-cyan)" fill="none"/>
              <path d="M150 160 L210 160" stroke={subStep === 'write' ? "#fbbf24" : "#334155"} strokeWidth="2" markerEnd="url(#arrow-yellow)" fill="none"/>
              <path d="M340 160 L380 160" stroke={subStep === 'read' ? "#34d399" : "#334155"} strokeWidth="2" markerEnd="url(#arrow-green)" fill="none"/>

              <defs>
                <marker id="arrow-cyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#67e8f9"/></marker>
                <marker id="arrow-yellow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fbbf24"/></marker>
                <marker id="arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#34d399"/></marker>
              </defs>
            </svg>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px' }}>速度 (ms):</label>
            <input type="range" min="500" max="3000" value={speedMs} onChange={(e) => setSpeedMs(Number(e.target.value))} style={{ flex: 1 }}/>
            
            <label style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '12px' }}>衰减率 Alpha:</label>
            <input type="range" min="0.1" max="1.0" step="0.05" value={userAlpha} onChange={(e) => setUserAlpha(Number(e.target.value))} style={{ width: '80px' }}/>
          </div>
          
          <div style={{ marginTop: '16px', background: '#1e293b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>当前步骤: </span>
            {subStep === 'decay' && "应用门控衰减，遗忘不重要的历史信息。"}
            {subStep === 'write' && "计算增量 δ_t = v_t - S_t * k_t，并更新状态矩阵。"}
            {subStep === 'read' && "根据查询 q_t 读取更新后的状态，得到输出 y_t。"}
          </div>
        </div>

        {/* Right Panel: Explanations */}
        <div style={{ background: '#0e1421', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          {viewMode === 'analogy' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(103, 232, 249, 0.05)', borderRadius: '8px', borderLeft: '4px solid #67e8f9' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#67e8f9' }}>1. 衰减 (Decay) - 像清理桌面</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>每次处理新词时，决定保留多少旧记忆。Alpha ({userAlpha.toFixed(2)}) 越高，说明当前信息越重要，需要清理更多旧记忆来腾出空间。</p>
              </div>
              <div style={{ padding: '16px', background: 'rgba(251, 191, 36, 0.05)', borderRadius: '8px', borderLeft: '4px solid #fbbf24' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24' }}>2. 写入 (Write) - 只记不同点</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>与其把整个句子全塞进脑子，不如想想“这和我知道的有什么不同？”(Delta)。只把这个增量信息写入记忆，效率极高。</p>
              </div>
              <div style={{ padding: '16px', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '8px', borderLeft: '4px solid #34d399' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#34d399' }}>3. 读取 (Read) - 精准回忆</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>遇到新词（如“注意力”）时，快速在整合了增量的记忆中搜索相关内容，得到当前预测输出。</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'DM Mono', fontSize: '13px' }}>
              <div style={{ padding: '12px', background: subStep === 'decay' ? 'rgba(103,232,249,0.15)' : '#1e293b', borderRadius: '8px', transition: 'background 0.3s' }}>
                <span style={{ color: '#64748b' }}># 1. Gating & Decay</span><br/>
                <span style={{ color: '#c4b5fd' }}>S_t</span> = <span style={{ color: '#67e8f9' }}>α_t</span> * <span style={{ color: '#c4b5fd' }}>S_{'{t-1}'}</span>
              </div>
              
              <div style={{ padding: '12px', background: subStep === 'write' ? 'rgba(251,191,36,0.15)' : '#1e293b', borderRadius: '8px', transition: 'background 0.3s' }}>
                <span style={{ color: '#64748b' }}># 2. Compute Residual (Delta)</span><br/>
                <span style={{ color: '#fbbf24' }}>δ_t</span> = v_t - (<span style={{ color: '#c4b5fd' }}>S_{'{t-1}'}</span> @ k_t)<br/><br/>
                <span style={{ color: '#64748b' }}># Update State</span><br/>
                <span style={{ color: '#c4b5fd' }}>S_t</span> = <span style={{ color: '#c4b5fd' }}>S_t</span> + <span style={{ color: '#67e8f9' }}>β_t</span> * <span style={{ color: '#fbbf24' }}>δ_t</span> @ k_t.T
              </div>

              <div style={{ padding: '12px', background: subStep === 'read' ? 'rgba(52,211,153,0.15)' : '#1e293b', borderRadius: '8px', transition: 'background 0.3s' }}>
                <span style={{ color: '#64748b' }}># 3. Read Output</span><br/>
                <span style={{ color: '#34d399' }}>y_t</span> = <span style={{ color: '#c4b5fd' }}>S_t</span> @ q_t
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Memory Sandbox */}
      <div style={{ background: '#0e1421', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#e2e8f0' }}>⚖️ 为什么重要：内存复杂度沙盒</h3>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>拖动滑块模拟上下文长度增加时的 KV Cache 内存消耗。</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <span style={{ color: '#fff', width: '60px' }}>{contextLength}K</span>
          <input type="range" min="8" max="1000" step="8" value={contextLength} onChange={(e) => setContextLength(Number(e.target.value))} style={{ flex: 1 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#94a3b8' }}>
              <span>Softmax Attention (O(N²))</span>
              <span style={{ color: '#f87171' }}>~{memoryAttention.toFixed(2)} MB</span>
            </div>
            <div style={{ height: '24px', background: 'rgba(248,113,113,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#f87171', width: `${Math.min(100, memoryAttention / 100)}%`, transition: 'width 0.3s' }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#94a3b8' }}>
              <span>GDN (O(1) State)</span>
              <span style={{ color: '#34d399' }}>~{memoryGDN.toFixed(2)} MB</span>
            </div>
            <div style={{ height: '24px', background: 'rgba(52,211,153,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#34d399', width: `${Math.min(100, memoryGDN / 100)}%`, transition: 'width 0.3s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 3:1 混合比例 */}
      <div style={{ background: '#0e1421', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#e2e8f0' }}>🔄 3:1 混合架构：优势互补</h3>
        <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px' }}>
          Qwen 3.8 并不是全盘抛弃标准注意力。它在每个块中采用了 <strong>3 层 GDN + 1 层 QSA (稀疏注意力)</strong> 的混合周期设计。
          GDN 擅长高效处理长上下文和持续信息流，而 Attention 则作为“记忆检索器”，定期回顾全量信息，解决线性注意力在强依赖检索任务中的短板。
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '20px' }}>
          {['GDN 层', 'GDN 层', 'GDN 层', 'QSA 注意力层'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ 
                padding: '12px 24px', 
                background: i === 3 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(103, 232, 249, 0.1)',
                border: `1px solid ${i === 3 ? '#fbbf24' : '#67e8f9'}`,
                borderRadius: '8px',
                color: i === 3 ? '#fbbf24' : '#67e8f9',
                fontWeight: 'bold'
              }}>
                {label}
              </div>
              {i < 3 && <span style={{ color: '#475569', fontSize: '24px' }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
};

export default GDNDeepDive;
