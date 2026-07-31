import React, { useState, useEffect, useRef } from 'react';

// Sample Token stream for interactive simulation
const sampleTokens = [
  { text: "Kimi", isKey: true, role: "Subject" },
  { text: "K3", isKey: true, role: "Model ID" },
  { text: "is", isKey: false, role: "Verb" },
  { text: "a", isKey: false, role: "Article" },
  { text: "2.8T", isKey: true, role: "Param Scale" },
  { text: "MoE", isKey: true, role: "Architecture" },
  { text: "model", isKey: false, role: "Noun" }
];

export const KDAOperatorDeepDive: React.FC = () => {
  // Step & Playback Control States
  const [tokenIndex, setTokenIndex] = useState<number>(0); // Token t
  const [subStep, setSubStep] = useState<'decay' | 'write' | 'read'>('decay'); // Animation sub-step
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1800);
  const [viewMode, setViewMode] = useState<'math' | 'analogy'>('analogy'); // Math vs CS Analogy mode
  const [contextLength, setContextLength] = useState<number>(128); // 128K context for ablation
  const [userAlpha, setUserAlpha] = useState<number>(0.85); // Dynamic decay gate alpha_t

  // Simulated Matrix S_t cell values (4x4 representation for visualization)
  const [matrixState] = useState<number[][]>([
    [0.42, 0.15, 0.78, 0.31],
    [0.64, 0.89, 0.22, 0.55],
    [0.11, 0.37, 0.93, 0.46],
    [0.82, 0.05, 0.61, 0.74]
  ]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Automatic playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSubStep((prevSub) => {
          if (prevSub === 'decay') return 'write';
          if (prevSub === 'write') return 'read';
          // Move to next token
          setTokenIndex((prevIdx) => (prevIdx + 1) % sampleTokens.length);
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

  // Step Controls
  const handlePrevStep = () => {
    setIsPlaying(false);
    if (subStep === 'read') setSubStep('write');
    else if (subStep === 'write') setSubStep('decay');
    else {
      setSubStep('read');
      setTokenIndex((prev) => (prev > 0 ? prev - 1 : sampleTokens.length - 1));
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (subStep === 'decay') setSubStep('write');
    else if (subStep === 'write') setSubStep('read');
    else {
      setSubStep('decay');
      setTokenIndex((prev) => (prev + 1) % sampleTokens.length);
    }
  };

  const currentToken = sampleTokens[tokenIndex];

  // Dynamic alpha value based on token importance
  const computedAlpha = currentToken.isKey ? userAlpha : Math.max(0.2, userAlpha - 0.4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* 1. Header Banner & View Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              KDA (Kimi Delta Attention) 三屏联动交互原理与应用深探
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              69-Layer Core Backbone Operator
            </span>
          </div>
          <p style={{ fontSize: '1rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            结合线性循环状态矩阵 \(S_t\) 与动态门控衰减，实现长文本 \(O(1)\) 常数显存推理与 \(O(T)\) 并行训练
          </p>
        </div>

        {/* Math vs CS Analogy Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setViewMode('analogy')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'analogy' ? '#38BDF8' : 'transparent',
              color: viewMode === 'analogy' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            💡 软件工程类比模式 (Analogy Mode)
          </button>
          <button
            onClick={() => setViewMode('math')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'math' ? '#A78BFA' : 'transparent',
              color: viewMode === 'math' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            📐 学术公式与代码模式 (Math/PyTorch Mode)
          </button>
        </div>
      </div>

      {/* 2. THREE-PANEL SYNCHRONIZED INTERACTIVE CONSOLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* PANEL 1: DATAFLOW ANIMATION & STEP DEBUGGER */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#38BDF8', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎬 区域一：状态矩阵动态演化 (Dataflow Pipeline)
            </h3>
            <span style={{ fontSize: '0.85rem', background: '#0F172A', color: '#38BDF8', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)', fontFamily: 'monospace' }}>
              Token t={tokenIndex + 1}/{sampleTokens.length} | Phase: {subStep.toUpperCase()}
            </span>
          </div>

          {/* Interactive Token Strip */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', background: '#0B0F19', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {sampleTokens.map((tok, idx) => (
              <div
                key={idx}
                onClick={() => { setTokenIndex(idx); setSubStep('decay'); setIsPlaying(false); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: idx === tokenIndex ? (tok.isKey ? '#38BDF8' : '#64748B') : '#0F172A',
                  color: idx === tokenIndex ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  border: idx === tokenIndex ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '60px'
                }}
              >
                <span>"{tok.text}"</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{tok.role}</span>
              </div>
            ))}
          </div>

          {/* Step Debugger Control Toolbar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#0F172A', padding: '10px 14px', borderRadius: '8px' }}>
            <button onClick={handlePrevStep} style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⏪ 上一步
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ background: isPlaying ? '#EF4444' : '#10B981', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isPlaying ? '⏸️ 暂停' : '▶️ 自动播放'}
            </button>
            <button onClick={handleNextStep} style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              下一步 ⏩
            </button>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>速度:</span>
              <input
                type="range"
                min="600"
                max="3000"
                step="200"
                value={speedMs}
                onChange={(e) => setSpeedMs(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.85rem', color: '#38BDF8', marginLeft: '10px' }}>基础α: {userAlpha.toFixed(2)}</span>
              <input
                type="range"
                min="0.3"
                max="0.99"
                step="0.05"
                value={userAlpha}
                onChange={(e) => setUserAlpha(Number(e.target.value))}
                style={{ width: '80px' }}
              />
            </div>
          </div>

          {/* SVG Dataflow Diagram */}
          <div style={{ background: '#02040a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
            <svg viewBox="0 0 540 260" width="100%" height="240">
              
              {/* Step 1: Decay Gate Effect */}
              <g opacity={subStep === 'decay' ? 1 : 0.4}>
                <rect x="20" y="40" width="120" height="70" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth={subStep === 'decay' ? 2.5 : 1} />
                <text x="80" y="70" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">1. 衰减门控 α_t</text>
                <text x="80" y="90" fill="#FFF" fontSize="12" fontFamily="monospace" textAnchor="middle">α_t = {computedAlpha.toFixed(2)}</text>
              </g>

              {/* State Matrix S_t Visualizer */}
              <rect
                x="180" y="30" width="180" height="180" rx="8"
                fill={subStep === 'decay' ? 'rgba(56, 189, 248, 0.08)' : subStep === 'write' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(16, 185, 129, 0.15)'}
                stroke={subStep === 'decay' ? '#38BDF8' : subStep === 'write' ? '#A78BFA' : '#10B981'}
                strokeWidth="2.5"
                style={{ transition: 'all 0.3s ease' }}
              />
              <text x="270" y="20" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                状态矩阵 S_t (128×128)
              </text>

              {/* 4x4 Grid Representation */}
              {matrixState.map((row, r) =>
                row.map((val, c) => {
                  const activeDecay = subStep === 'decay';
                  const activeWrite = subStep === 'write';
                  const displayVal = activeDecay ? (val * computedAlpha).toFixed(2) : val.toFixed(2);

                  return (
                    <g key={`${r}-${c}`}>
                      <rect
                        x={195 + c * 38}
                        y={45 + r * 38}
                        width="34"
                        height="34"
                        rx="4"
                        fill={activeWrite && r === c ? '#A78BFA' : activeDecay ? '#0F172A' : '#0B0F19'}
                        stroke={activeDecay ? '#38BDF8' : '#475569'}
                        strokeWidth="1"
                        opacity={activeDecay ? computedAlpha : 1}
                      />
                      <text
                        x={212 + c * 38}
                        y={66 + r * 38}
                        fill={activeWrite && r === c ? '#000' : '#E2E8F0'}
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {displayVal}
                      </text>
                    </g>
                  );
                })
              )}

              {/* Step 2: Write Vector (v_t * k_t^T) */}
              <g opacity={subStep === 'write' ? 1 : 0.3}>
                <line x1="390" y1="80" x2="450" y2="80" stroke="#A78BFA" strokeWidth="2" />
                <rect x="450" y="55" width="80" height="50" rx="6" fill="rgba(167, 139, 250, 0.2)" stroke="#A78BFA" strokeWidth="2" />
                <text x="490" y="78" fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">2. 外积写入</text>
                <text x="490" y="95" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">v_t · k_tᵀ</text>
              </g>

              {/* Step 3: Query Read (o_t = S_t * q_t) */}
              <g opacity={subStep === 'read' ? 1 : 0.3}>
                <line x1="270" y1="210" x2="270" y2="245" stroke="#10B981" strokeWidth="2.5" />
                <rect x="200" y="225" width="140" height="30" rx="4" fill="#10B981" />
                <text x="270" y="244" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">3. 软检索输出 o_t = S_t · q_t</text>
              </g>
            </svg>

            {/* Substep Explainer */}
            <div style={{ background: '#0F172A', padding: '10px 14px', borderRadius: '6px', fontSize: '0.9rem', color: '#94A3B8', marginTop: '6px' }}>
              {subStep === 'decay' && (
                <span>💡 <b>步骤 1 (衰减):</b> 历史矩阵乘以衰减门控 \(\alpha_t = {computedAlpha.toFixed(2)}\)，全盘记忆按比例淡化。</span>
              )}
              {subStep === 'write' && (
                <span>💡 <b>步骤 2 (写入):</b> 生成当前 Token 的 Key/Value 外积方阵，叠加嵌入矩阵完成“记忆增量覆盖”。</span>
              )}
              {subStep === 'read' && (
                <span>💡 <b>步骤 3 (读取):</b> Query 向量点积检索状态矩阵，提取包含完整历史上下文的注意力特征向量 \(o_t\)。</span>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: SYNCHRONIZED MATH, PYTORCH & CS ANALOGY */}
        <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <h3 style={{ fontSize: '1.15rem', color: '#A78BFA', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {viewMode === 'analogy' ? '💡 区域二：软件工程概念锚点 (Analogy Mode)' : '📐 区域二：动态发光公式与 PyTorch 代码'}
          </h3>

          {/* VIEW MODE A: CS ANALOGY */}
          {viewMode === 'analogy' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #38BDF8' }}>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>🔗 概念类比：固定尺寸的在线滑动缓冲区 (Fixed Online Buffer)</span>
                <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
                  像操作系统或数据库中的<b>在线增量累加器 / 固定尺寸 Ring Buffer</b>。传统 Transformer 每增加一个词都需要开辟新的数组空间，而 KDA 始终使用固定尺寸的缓冲区存储动态聚合数据。
                </p>
              </div>

              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #A78BFA' }}>
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>⚡ 门控 α_t：LRU 缓存淘汰衰减率 (Decay Rate)</span>
                <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
                  根据当前输入的权重，动态决定旧缓存的“降权与擦除速率”。如果是“金钥匙”等核心实体，\(\alpha_t \approx 0.99\)（强锁存）；如果是无意义修饰词，\(\alpha_t \approx 0.2\)（快速淘汰）。
                </p>
              </div>

              {/* Strict Physical Difference Note */}
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid #EF4444' }}>
                <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.95rem' }}>⚠️ 物理边界与严格差异（保障技术精确性）：</span>
                <p style={{ color: '#CBD5E1', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
                  传统 Hash 缓存是<b>0或1的硬匹配 (Hard Key Match)</b>；而 KDA 的 \(S_t\) 存储的是<b>高维连续特征向量的空间旋转与相干投影 (Continuous Linear Projection)</b>，并非简单的字符串字典查找。
                </p>
              </div>

            </div>
          ) : (
            /* VIEW MODE B: MATH & PYTORCH CODE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Dynamic Highlighted Math Formulas */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px' }}>// 状态更新与查询 LaTeX 动态表达式：</div>
                
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: subStep === 'decay' || subStep === 'write' ? 'rgba(56, 189, 248, 0.15)' : '#070913',
                  border: subStep === 'decay' || subStep === 'write' ? '1px solid #38BDF8' : 'none',
                  color: '#FFF',
                  fontFamily: 'monospace',
                  fontSize: '1.05rem'
                }}>
                  <span style={{ color: subStep === 'decay' ? '#38BDF8' : '#94A3B8', fontWeight: subStep === 'decay' ? 'bold' : 'normal' }}>
                    S_t = α_t · S_(t-1)
                  </span>
                  <span style={{ color: subStep === 'write' ? '#A78BFA' : '#94A3B8', fontWeight: subStep === 'write' ? 'bold' : 'normal' }}>
                    {' '} + v_t · k_tᵀ
                  </span>
                </div>

                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: subStep === 'read' ? 'rgba(16, 185, 129, 0.15)' : '#070913',
                  border: subStep === 'read' ? '1px solid #10B981' : 'none',
                  color: subStep === 'read' ? '#10B981' : '#94A3B8',
                  fontFamily: 'monospace',
                  fontSize: '1.05rem',
                  marginTop: '8px'
                }}>
                  o_t = σ(W_g · x_t) ⊙ ( S_t · q_t )
                </div>
              </div>

              {/* PyTorch Code Box */}
              <div style={{ background: '#0B0F19', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#64748B', marginBottom: '6px' }}># PyTorch 最小参考实现:</div>
                <div style={{ color: subStep === 'decay' ? '#38BDF8' : '#64748B', background: subStep === 'decay' ? 'rgba(56,189,248,0.1)' : 'transparent', padding: '2px 4px' }}>
                  alpha_t = torch.sigmoid(self.W_alpha(x_t))
                </div>
                <div style={{ color: subStep === 'decay' ? '#38BDF8' : '#64748B', background: subStep === 'decay' ? 'rgba(56,189,248,0.1)' : 'transparent', padding: '2px 4px' }}>
                  S = alpha_t * S_prev  # Phase 1: Decay
                </div>
                <div style={{ color: subStep === 'write' ? '#A78BFA' : '#64748B', background: subStep === 'write' ? 'rgba(167,139,250,0.1)' : 'transparent', padding: '2px 4px' }}>
                  S = S + torch.outer(v_t, k_t)  # Phase 2: Write
                </div>
                <div style={{ color: subStep === 'read' ? '#10B981' : '#64748B', background: subStep === 'read' ? 'rgba(16,185,129,0.1)' : 'transparent', padding: '2px 4px' }}>
                  o_t = torch.matmul(S, q_t)  # Phase 3: Read
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 3. PANEL 3: WHY IT MATTERS & ABLATION SANDBOX */}
      <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#10B981', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 区域三：核心处理作用对比沙盒 (Why It Matters: O(1) Memory Sandbox)
          </h3>

          {/* Interactive Context Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0F172A', padding: '6px 14px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 'bold' }}>推演上下文长度:</span>
            <input
              type="range"
              min="8"
              max="1000"
              step="32"
              value={contextLength}
              onChange={(e) => setContextLength(Number(e.target.value))}
              style={{ width: '160px' }}
            />
            <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>{contextLength}K Tokens</span>
          </div>
        </div>

        {/* Side-by-Side Memory Footprint Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Standard Softmax Attention (Linear Memory Growth) */}
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '1rem' }}>传统 Softmax Attention</span>
              <span style={{ color: '#EF4444', fontFamily: 'monospace', fontWeight: 'bold' }}>O(N) 显存开销</span>
            </div>
            
            {/* Simulated Memory Bar */}
            <div style={{ height: '24px', background: '#070913', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (contextLength / 256) * 100)}%`,
                  background: contextLength > 256 ? '#EF4444' : '#F59E0B',
                  transition: 'width 0.3s ease'
                }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '3px', fontSize: '0.8rem', color: '#FFF', fontFamily: 'monospace' }}>
                {(contextLength * 0.75).toFixed(1)} GB {contextLength > 256 ? '⚠️ 显存爆满 OOM!' : ''}
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              KV Cache 随上下文长度无限延伸增长。1M 上下文需要近 750GB 显存，极易触发 GPU OOM。
            </p>
          </div>

          {/* KDA Gated Delta Attention (O(1) Constant Memory) */}
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1rem' }}>KDA (Kimi Delta Attention)</span>
              <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>O(1) 常数级显存</span>
            </div>
            
            {/* Constant Memory Bar */}
            <div style={{ height: '24px', background: '#070913', borderRadius: '4px', marginTop: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <div style={{ height: '100%', width: '12%', background: '#10B981' }} />
              <span style={{ position: 'absolute', right: '10px', top: '3px', fontSize: '0.8rem', color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                恒定 0.04 GB 🟢 (完全安全)
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              无论输入 8K 还是 1000K (1M) Tokens，状态矩阵 \(S_t\) 尺寸始终恒定为 128×128，推理显存占用恒为常数！
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

