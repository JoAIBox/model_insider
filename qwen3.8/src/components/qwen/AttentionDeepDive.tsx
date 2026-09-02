import React, { useState, useEffect, useRef } from 'react';

export const AttentionDeepDive: React.FC = () => {
  const [mode, setMode] = useState<'gated' | 'qsa'>('gated');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(3);
  const [budget, setBudget] = useState(4);
  const [contextLength, setContextLength] = useState(128);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gatedSteps = ['投影 Q/K/V', '计算 QKᵀ/√d', 'Softmax 加权', '门控输出'];
  const qsaSteps = ['Indexer 扫描', 'Top-K 选择', '稀疏注意力', '输出'];
  
  const currentSteps = mode === 'gated' ? gatedSteps : qsaSteps;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep((s) => (s + 1) % currentSteps.length);
      }, 1500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSteps.length]);

  const handleStepClick = (idx: number) => {
    setStep(idx);
    setIsPlaying(false);
  };

  const handleToggle = () => {
    setMode(mode === 'gated' ? 'qsa' : 'gated');
    setStep(0);
    setIsPlaying(false);
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: 'Manrope, sans-serif',
    backgroundColor: '#0e1421',
    color: '#e2e8f0',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    maxWidth: '900px',
    margin: '0 auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: 'rgba(196, 181, 253, 0.1)',
    color: '#c4b5fd',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const highlightStyle: React.CSSProperties = {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(103, 232, 249, 0.05)',
    borderLeft: '4px solid #67e8f9',
    marginBottom: '16px',
  };

  const motivationStyle: React.CSSProperties = {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(196, 181, 253, 0.05)',
    borderLeft: '4px solid #c4b5fd',
    marginBottom: '24px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const mathBlockStyle: React.CSSProperties = {
    fontFamily: '"DM Mono", monospace',
    backgroundColor: '#070a12',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom: '12px',
    fontSize: '15px',
    overflowX: 'auto',
  };

  const renderGatedAnimation = () => (
    <svg width="100%" height="300" viewBox="0 0 540 300">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#c4b5fd" />
        </marker>
        <linearGradient id="gatedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Input Tokens */}
      <text x="50" y="30" fill="#94a3b8" fontSize="14" textAnchor="middle">输入序列</text>
      {[0, 1, 2, 3].map((i) => (
        <circle key={`t-${i}`} cx={20 + i * 20} cy="60" r="8" fill={step >= 0 ? '#67e8f9' : '#334155'} />
      ))}

      {/* Q/K/V Projections */}
      <rect x="120" y="40" width="40" height="40" rx="4" fill="#1e293b" stroke="#c4b5fd" strokeWidth="2" opacity={step >= 0 ? 1 : 0.5} />
      <text x="140" y="65" fill="#e2e8f0" fontSize="12" textAnchor="middle" opacity={step >= 0 ? 1 : 0.5}>W_q</text>
      
      <rect x="120" y="100" width="40" height="40" rx="4" fill="#1e293b" stroke="#67e8f9" strokeWidth="2" opacity={step >= 0 ? 1 : 0.5} />
      <text x="140" y="125" fill="#e2e8f0" fontSize="12" textAnchor="middle" opacity={step >= 0 ? 1 : 0.5}>W_k</text>

      <rect x="120" y="160" width="40" height="40" rx="4" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" opacity={step >= 0 ? 1 : 0.5} />
      <text x="140" y="185" fill="#e2e8f0" fontSize="12" textAnchor="middle" opacity={step >= 0 ? 1 : 0.5}>W_v</text>

      {/* Connectors */}
      <path d="M 160 60 L 200 80" stroke="#c4b5fd" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 1 ? 1 : 0.2} />
      <path d="M 160 120 L 200 100" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 1 ? 1 : 0.2} />

      {/* Attention Score Heatmap */}
      <g transform="translate(220, 50)" opacity={step >= 1 ? 1 : 0.3}>
        <text x="40" y="-10" fill="#94a3b8" fontSize="12" textAnchor="middle">QKᵀ/√d</text>
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3].map((c) => {
            const val = r >= c ? 0.2 + (r === c ? 0.8 : 0.4 * Math.random()) : 0;
            return (
              <rect
                key={`h-${r}-${c}`}
                x={c * 20}
                y={r * 20}
                width="18"
                height="18"
                fill="#c4b5fd"
                opacity={step >= 2 ? val : val * 0.5}
                rx="2"
              />
            );
          })
        )}
      </g>

      {/* Softmax -> Output */}
      <path d="M 310 90 L 350 90" stroke="#c4b5fd" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 2 ? 1 : 0.2} />
      <rect x="360" y="70" width="60" height="40" rx="4" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" opacity={step >= 2 ? 1 : 0.5} />
      <text x="390" y="95" fill="#e2e8f0" fontSize="12" textAnchor="middle" opacity={step >= 2 ? 1 : 0.5}>Softmax·V</text>

      {/* Gating */}
      <path d="M 60 250 L 390 250" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 3 ? 1 : 0.2} />
      <rect x="360" y="230" width="60" height="40" rx="4" fill="#1e293b" stroke="#67e8f9" strokeWidth="2" opacity={step >= 3 ? 1 : 0.5} />
      <text x="390" y="255" fill="#e2e8f0" fontSize="12" textAnchor="middle" opacity={step >= 3 ? 1 : 0.5}>σ(W_g·x)</text>

      {/* Element-wise Multiply */}
      <circle cx="390" cy="160" r="15" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" opacity={step >= 3 ? 1 : 0.2} />
      <text x="390" y="165" fill="#e2e8f0" fontSize="16" textAnchor="middle" opacity={step >= 3 ? 1 : 0.2}>×</text>
      
      <path d="M 390 110 L 390 145" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 3 ? 1 : 0.2} />
      <path d="M 390 230 L 390 175" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 3 ? 1 : 0.2} />

      <path d="M 405 160 L 460 160" stroke="#e2e8f0" strokeWidth="2" markerEnd="url(#arrow)" opacity={step >= 3 ? 1 : 0.2} />
      <rect x="470" y="140" width="40" height="40" rx="4" fill="url(#gatedGrad)" stroke="#c4b5fd" strokeWidth="2" opacity={step >= 3 ? 1 : 0.2} />
      <text x="490" y="165" fill="#e2e8f0" fontSize="12" textAnchor="middle" opacity={step >= 3 ? 1 : 0.2}>输出</text>
    </svg>
  );

  const renderQSAAnimation = () => {
    const blocks = Array.from({ length: 16 }, (_, i) => i);
    const topKBlocks = [2, 7, 11, 14].slice(0, budget);

    return (
      <svg width="100%" height="300" viewBox="0 0 540 300">
        <defs>
          <marker id="arrow-qsa" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
          </marker>
        </defs>

        <text x="50" y="30" fill="#94a3b8" fontSize="14" textAnchor="middle">Query 状态</text>
        <circle cx="50" cy="150" r="20" fill="#c4b5fd" opacity={step >= 0 ? 1 : 0.3} />
        <text x="50" y="155" fill="#1e293b" fontSize="14" fontWeight="bold" textAnchor="middle">Q</text>

        <path d="M 75 150 L 140 150" stroke="#c4b5fd" strokeWidth="2" markerEnd="url(#arrow-qsa)" opacity={step >= 0 ? 1 : 0.2} />

        <text x="210" y="30" fill="#94a3b8" fontSize="14" textAnchor="middle">文档块 (Blocks)</text>
        <g transform="translate(150, 60)">
          {blocks.map((b) => {
            const isSelected = step >= 1 && topKBlocks.includes(b);
            const score = step >= 0 ? (topKBlocks.includes(b) ? 0.8 : 0.2 + 0.3 * Math.random()) : 0.1;
            return (
              <g key={`b-${b}`} transform={`translate(${(b % 4) * 30}, ${Math.floor(b / 4) * 30})`}>
                <rect
                  width="24"
                  height="24"
                  rx="4"
                  fill="#1e293b"
                  stroke={isSelected ? '#fbbf24' : '#475569'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <rect
                  width="24"
                  height="24"
                  rx="4"
                  fill="#c4b5fd"
                  opacity={step >= 0 ? score : 0}
                />
                {isSelected && step >= 1 && (
                  <circle cx="20" cy="4" r="4" fill="#fbbf24" />
                )}
              </g>
            );
          })}
        </g>

        <path d="M 280 150 L 340 150" stroke="#fbbf24" strokeWidth="2" strokeDasharray={step >= 2 ? "0" : "4"} markerEnd="url(#arrow-qsa)" opacity={step >= 2 ? 1 : 0.2} />
        <text x="310" y="140" fill="#fbbf24" fontSize="12" textAnchor="middle" opacity={step >= 2 ? 1 : 0}>Gather</text>

        <rect x="360" y="110" width="80" height="80" rx="8" fill="#1e293b" stroke="#67e8f9" strokeWidth="2" opacity={step >= 2 ? 1 : 0.2} />
        <text x="400" y="145" fill="#e2e8f0" fontSize="12" textAnchor="middle" opacity={step >= 2 ? 1 : 0.2}>稀疏 Attention</text>
        <text x="400" y="165" fill="#94a3b8" fontSize="10" textAnchor="middle" opacity={step >= 2 ? 1 : 0.2}>K/V (Top-K)</text>

        <path d="M 445 150 L 480 150" stroke="#67e8f9" strokeWidth="2" markerEnd="url(#arrow-qsa)" opacity={step >= 3 ? 1 : 0.2} />
        <rect x="490" y="130" width="40" height="40" rx="4" fill="#fbbf24" opacity={step >= 3 ? 0.8 : 0.2} />
        <text x="510" y="155" fill="#1e293b" fontSize="12" fontWeight="bold" textAnchor="middle" opacity={step >= 3 ? 1 : 0.2}>Out</text>
      </svg>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🔍 门控注意力 / QSA：精确上下文检索
            <span style={badgeStyle}>Qwen 3.8</span>
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            第 4 层锚点层，提供全局精确记忆
          </p>
        </div>
        <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setMode('gated')}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'gated' ? '#334155' : 'transparent',
              color: mode === 'gated' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: mode === 'gated' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            Gated Attention
          </button>
          <button
            onClick={() => setMode('qsa')}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'qsa' ? '#334155' : 'transparent',
              color: mode === 'qsa' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: mode === 'qsa' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            QSA 稀疏模式
          </button>
        </div>
      </div>

      <div style={highlightStyle}>
        <div style={sectionTitleStyle}>⭐ 创新亮点</div>
        {mode === 'gated' ? (
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            <strong>3:1 混合中的“锚点层”</strong> - 3层GDN处理序列/局部, 每4层插入一层精确全局检索。通过门控过滤信息。
          </p>
        ) : (
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            <strong>QSA：从 O(N²) 降到 O(N·B)</strong> - Indexer 扫描所有块 → 选择Top-K → 仅对选中块做注意力。
          </p>
        )}
      </div>

      <div style={motivationStyle}>
        <div style={sectionTitleStyle}>💡 设计动机</div>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
          <li><strong>为什么不能全用 GDN？</strong> - 纯 GDN 丢失精确检索能力</li>
          <li><strong>为什么不全用 Attention？</strong> - O(N²) 太贵</li>
          <li><strong>QSA 进一步优化</strong> - 即使是锚点层也可以亚二次</li>
        </ul>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                backgroundColor: isPlaying ? '#ef4444' : '#10b981',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isPlaying ? '⏸ 暂停' : '▶ 播放'}
            </button>
            <button
              onClick={handleToggle}
              style={{
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              🔄 切换模式
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            {currentSteps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleStepClick(idx)}
                style={{
                  padding: '4px 12px',
                  backgroundColor: step === idx ? (mode === 'gated' ? '#c4b5fd' : '#fbbf24') : '#334155',
                  color: step === idx ? '#1e293b' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: step === idx ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {idx + 1}. {s}
              </button>
            ))}
          </div>
        </div>

        {mode === 'qsa' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', fontSize: '14px' }}>
            <span style={{ color: '#94a3b8' }}>检索预算 (Top-K Blocks): {budget}</span>
            <input 
              type="range" 
              min="2" 
              max="8" 
              value={budget} 
              onChange={(e) => setBudget(Number(e.target.value))} 
              style={{ width: '150px' }}
            />
            <span style={{ color: '#fbbf24', marginLeft: 'auto' }}>
              节省计算: {Math.round((1 - budget / 16) * 100)}%
            </span>
          </div>
        )}

        <div style={{ backgroundColor: '#070a12', borderRadius: '8px', overflow: 'hidden' }}>
          {mode === 'gated' ? renderGatedAnimation() : renderQSAAnimation()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#e2e8f0' }}>数学公式</h3>
          {mode === 'gated' ? (
            <>
              <div style={{...mathBlockStyle, opacity: step === 0 ? 1 : 0.6}}>
                <span style={{color: '#c4b5fd'}}>Q</span>=<span style={{color: '#67e8f9'}}>W_q</span>·RMSNorm(x)
              </div>
              <div style={{...mathBlockStyle, opacity: step === 1 || step === 2 ? 1 : 0.6}}>
                Attn=<span style={{color: '#ef4444'}}>Softmax</span>(<span style={{color: '#c4b5fd'}}>Q</span>·<span style={{color: '#67e8f9'}}>K</span>ᵀ/√d)·<span style={{color: '#fbbf24'}}>V</span>
              </div>
              <div style={{...mathBlockStyle, opacity: step === 3 ? 1 : 0.6}}>
                y=<span style={{color: '#3b82f6'}}>W_o</span>·[σ(W_g·x)⊙Attn]
              </div>
            </>
          ) : (
            <>
              <div style={{...mathBlockStyle, opacity: step === 0 ? 1 : 0.6}}>
                score_b=f_index(<span style={{color: '#c4b5fd'}}>Q</span>, <span style={{color: '#67e8f9'}}>K_b</span>)
              </div>
              <div style={{...mathBlockStyle, opacity: step === 1 ? 1 : 0.6}}>
                B_sel=<span style={{color: '#fbbf24'}}>TopK</span>(scores)
              </div>
              <div style={{...mathBlockStyle, opacity: step >= 2 ? 1 : 0.6}}>
                y=Attn(<span style={{color: '#c4b5fd'}}>Q</span>, K[B_sel], V[B_sel])
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#1e293b', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between' }}>
          <span>复杂度对比</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'normal' }}>
            <span style={{ color: '#94a3b8' }}>Context Length: {contextLength}</span>
            <input 
              type="range" 
              min="16" 
              max="1024" 
              step="16"
              value={contextLength} 
              onChange={(e) => setContextLength(Number(e.target.value))} 
              style={{ width: '100px' }}
            />
          </div>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>Full Attention O(N²)</span>
              <span>O(N²)</span>
            </div>
            <div style={{ width: '100%', height: '16px', backgroundColor: '#070a12', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (contextLength / 1024) * (contextLength / 1024) * 100)}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.3s' }}></div>
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>GDN O(1)</span>
              <span>O(1)</span>
            </div>
            <div style={{ width: '100%', height: '16px', backgroundColor: '#070a12', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (contextLength / 1024) * 5)}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.3s' }}></div>
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>QSA O(N·B)</span>
              <span>O(N·B)</span>
            </div>
            <div style={{ width: '100%', height: '16px', backgroundColor: '#070a12', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (contextLength / 1024) * (budget / 16) * 40)}%`, height: '100%', backgroundColor: '#fbbf24', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
