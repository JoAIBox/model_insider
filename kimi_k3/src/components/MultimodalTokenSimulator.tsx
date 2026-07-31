import React, { useState, useEffect, useRef } from 'react';

// Pipeline Steps for Multimodal Token Alignment & End-to-End Compute Graph
const pipelineSteps = [
  { id: 0, title: "1. 文本 BPE 分词与向量查表", desc: "文本字符串 ➔ BPE 划分为 Token ID ➔ W_emb[ID] 查表生成 7,168 维文本向量", output: "x_text ∈ ℝ^7,168", type: "text" },
  { id: 1, title: "2. 图像 14×14 切片滑窗扫描", desc: "28×28 图像划分为 4 个 14×14×3 (588d) 像素切片 Patch", output: "Patch x_p ∈ ℝ^(4 × 588px)", type: "vision" },
  { id: 2, title: "3. 512 卷积核点积特征提取", desc: "512 个 14×14×3 卷积核覆盖点乘 ➔ 抽取 4 个 512 维特征向量", output: "f_vit ∈ ℝ^(4 × 512d)", type: "vision" },
  { id: 3, title: "4. 2×2 Pixel Shuffle 空间打包", desc: "4 个 512d 向量空间打平融合 ➔ 打包为 1 个 2,048 维图像 Token (压缩75%)", output: "v_2048 ∈ ℝ^2,048 (1 Token)", type: "vision" },
  { id: 4, title: "5. W_proj 矩阵升维对齐", desc: "W_proj [7168×2048] 矩阵乘法 ➔ 升维对齐至 7,168 维统一高维空间", output: "x_vis ∈ ℝ^7,168", type: "vision" },
  { id: 5, title: "6. 前向交错序列物理拼接", desc: "按 [Prefix文本 ➔ 图像Token ➔ Suffix文本] 顺序拼装为 Stream X ➔ 送入 93 层 Backbone", output: "Stream X ∈ ℝ^(T × 7,168)", type: "backbone" },
  { id: 6, title: "7. 单步 160K 词表采样与自回归", desc: "Backbone 输出 h_t ➔ W_unembed [160,000×7168] 词表打分 ➔ 采样 1 个 Next Token ↺ 写回 Context", output: "1 Next Token (t=N+1)", type: "decoder" }
];

export const MultimodalTokenSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patchEncoder' | 'pixelShuffle' | 'latentSpace' | 'decoder'>('overview');
  
  // Interactive Prompt State
  const [prefixText, setPrefixText] = useState<string>('Show me');
  const [suffixText, setSuffixText] = useState<string>('a cat');

  // Dynamic Flow & Animation Control States
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true); // Default active live animation
  const [speedMs, setSpeedMs] = useState<number>(1600);
  const [viewMode, setViewMode] = useState<'math' | 'analogy'>('analogy');
  const [imgRes, setImgRes] = useState<number>(56);

  // Active patch animation highlight index
  const [activeScanPatch, setActiveScanPatch] = useState<number>(0);

  // Autoregressive Token Generation Queue (Simulating step-by-step token generation)
  const [genStep, setGenStep] = useState<number>(0);
  const vocabSampleTokens = [
    { id: 4891, token: "photo", prob: 0.84, type: "text", color: "#F59E0B" },
    { id: 1024, token: "of", prob: 0.91, type: "text", color: "#10B981" },
    { id: 8931, token: "cat", prob: 0.78, type: "text", color: "#EC4899" }
  ];

  // Interactive Patch selection for Step 2 & 3
  const [selectedPatchGroup, setSelectedPatchGroup] = useState<number>(0);
  const [selectedFilterIdx, setSelectedFilterIdx] = useState<number>(12);
  const [reconOpacity, setReconOpacity] = useState<number>(85);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Playback loop for Step Debugger and Patch Scanner
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((prev) => {
          const nextStep = (prev + 1) % pipelineSteps.length;
          if (nextStep === 1 || nextStep === 2) {
            setActiveScanPatch((p) => (p + 1) % 4);
          }
          return nextStep;
        });
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs]);

  // Sample 4x4 Grid images (4 patches of 14x14)
  const samplePatches = [
    { name: 'Top-Left (Ear Pattern)', color: '#FF5555', filterVal: 0.82 },
    { name: 'Top-Right (Sky Background)', color: '#38BDF8', filterVal: 0.15 },
    { name: 'Bottom-Left (Fur Texture)', color: '#10B981', filterVal: 0.94 },
    { name: 'Bottom-Right (Shadow Detail)', color: '#FFB000', filterVal: 0.61 },
  ];

  const currentStep = pipelineSteps[stepIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: '#02040a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌟</span>
            <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: 0, fontWeight: 'bold' }}>
              Layer 0 多模态 Token 全流程计算拓扑与自回归生成先后控制台
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Multimodal Tokenizer Simulator (§2.1)
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            真实展现连续图像如何经过 2×2 Pixel Shuffle 空间打包为 1 个视觉 Token，以及自回归解码如何单次从 160K 词表采样 1 个 Token 回流追加
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#070913', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'overview' ? '#38BDF8' : 'transparent',
              color: activeTab === 'overview' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            1. 动态全拓扑与自回归 (Compute Graph)
          </button>
          <button
            onClick={() => setActiveTab('patchEncoder')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'patchEncoder' ? '#A78BFA' : 'transparent',
              color: activeTab === 'patchEncoder' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            2. 512 卷积核点积计算
          </button>
          <button
            onClick={() => setActiveTab('pixelShuffle')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'pixelShuffle' ? '#10B981' : 'transparent',
              color: activeTab === 'pixelShuffle' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            3. 2×2 Pixel Shuffle (2,048d)
          </button>
          <button
            onClick={() => setActiveTab('latentSpace')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'latentSpace' ? '#F59E0B' : 'transparent',
              color: activeTab === 'latentSpace' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            4. 7,168维 统一高维潜空间
          </button>
          <button
            onClick={() => setActiveTab('decoder')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'decoder' ? '#EC4899' : 'transparent',
              color: activeTab === 'decoder' ? '#000' : '#94A3B8',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            5. 逆向重构还原验证
          </button>
        </div>
      </div>

      {/* TAB 1: THREE-PANEL SYNCHRONIZED INTERACTIVE CONSOLE WITH DYNAMIC COMPUTATION & AUTOREGRESSIVE ENGINE */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Controls: Dynamic Input Prompt & Autoregressive Decoder Step Controls */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            
            {/* Multimodal Prompt Inputs */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>前缀文本 Prompt:</label>
                <input
                  type="text"
                  value={prefixText}
                  onChange={(e) => setPrefixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem', width: '130px' }}
                />
              </div>

              <div style={{ background: 'rgba(167, 139, 250, 0.15)', border: '1px solid #A78BFA', padding: '6px 12px', borderRadius: '6px', color: '#A78BFA', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🖼️ [28×28 图像输入]</span>
                <span style={{ fontSize: '0.75rem', background: '#0F172A', color: '#10B981', padding: '2px 6px', borderRadius: '4px' }}>打包为 1 Visual Token</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>后缀文本 Prompt:</label>
                <input
                  type="text"
                  value={suffixText}
                  onChange={(e) => setSuffixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem', width: '130px' }}
                />
              </div>
            </div>

            {/* Autoregressive Step Control Button */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#0B0F19', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <span style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: 'bold' }}>
                ⏱️ 自回归生成步: {genStep === 0 ? 'Prefill 预热' : `t = N+${genStep}`}
              </span>
              <button
                onClick={() => setGenStep((prev) => (prev < vocabSampleTokens.length ? prev + 1 : 0))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#F59E0B',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {genStep < vocabSampleTokens.length ? `↻ 预测 160K 词表下一个 Token (t=N+${genStep + 1})` : '🔄 重置 Context'}
              </button>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '6px', background: '#0B0F19', padding: '4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setViewMode('analogy')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'analogy' ? '#38BDF8' : 'transparent',
                  color: viewMode === 'analogy' ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                💡 类比模式
              </button>
              <button
                onClick={() => setViewMode('math')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'math' ? '#A78BFA' : 'transparent',
                  color: viewMode === 'math' ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                📐 学术模式
              </button>
            </div>

          </div>

          {/* 3-Panel Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
            
            {/* PANEL 1: END-TO-END COMPUTATION GRAPH & AUTOREGRESSIVE ENGINE SVG */}
            <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
                  🎬 区域一：多模态 Token 全流程计算与 160K 词表自回归拓扑图
                </h3>
                <span style={{ fontSize: '0.85rem', background: '#0F172A', color: '#38BDF8', padding: '3px 10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  Step {stepIdx + 1}/{pipelineSteps.length}: {currentStep.title}
                </span>
              </div>

              {/* Step Navigation Strip */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px', background: '#0B0F19', borderRadius: '8px' }}>
                {pipelineSteps.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => { setStepIdx(idx); setIsPlaying(false); }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: idx === stepIdx ? (s.type === 'text' ? '#38BDF8' : s.type === 'decoder' ? '#EC4899' : '#A78BFA') : '#0F172A',
                      color: idx === stepIdx ? '#000' : '#94A3B8',
                      fontWeight: 'bold',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      border: idx === stepIdx ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.06)',
                      minWidth: '100px',
                      textAlign: 'center'
                    }}
                  >
                    <div>{s.title}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>{s.output}</div>
                  </div>
                ))}
              </div>

              {/* Step Controls */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#0F172A', padding: '8px 12px', borderRadius: '6px' }}>
                <button
                  onClick={() => { setIsPlaying(false); setStepIdx((prev) => (prev > 0 ? prev - 1 : pipelineSteps.length - 1)); }}
                  style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ⏪ 上一步
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ background: isPlaying ? '#EF4444' : '#10B981', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isPlaying ? '⏸️ 暂停动画' : '▶️ 自动播放全流程'}
                </button>
                <button
                  onClick={() => { setIsPlaying(false); setStepIdx((prev) => (prev + 1) % pipelineSteps.length); }}
                  style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  下一步 ⏩
                </button>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>动画播放速度:</span>
                  <input
                    type="range"
                    min="600"
                    max="3000"
                    step="200"
                    value={speedMs}
                    onChange={(e) => setSpeedMs(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* WIDESCREEN END-TO-END COMPUTATION & AUTOREGRESSIVE LOOPBACK GRAPH SVG */}
              <div style={{ background: '#02040a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <svg viewBox="0 0 940 500" width="100%" height="500">
                  <defs>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
                    </marker>
                    <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
                    </marker>
                    <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
                    </marker>
                    <marker id="arrow-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EC4899" />
                    </marker>
                    <marker id="arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                    </marker>
                    
                    {/* Linear Gradients for Flow Animation */}
                    <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* === SECTION 1: FORWARD ENCODING COMPUTE GRAPH (TOP HALF) === */}

                  {/* 1. TEXT BRANCH: String -> Token ID -> W_emb Lookup */}
                  <g opacity={stepIdx === 0 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="20" y="20" width="170" height="100" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth={stepIdx === 0 ? 3 : 1.5} />
                    <text x="105" y="44" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">1. 文本 BPE 分词与查表</text>
                    <text x="105" y="64" fill="#FFF" fontSize="11" textAnchor="middle">"{prefixText}" ➔ Token ID</text>
                    <text x="105" y="82" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle">W_emb[ID] 检索硬查找</text>
                    <text x="105" y="100" fill="#FFF" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">x_text ∈ ℝ^7,168</text>
                  </g>

                  {/* 2. VISION BRANCH A: 28x28 Image & 14x14 Patch Sliding Traversal */}
                  <g opacity={stepIdx === 1 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="210" y="20" width="150" height="100" rx="8" fill="#0F172A" stroke="#A78BFA" strokeWidth={stepIdx === 1 ? 3 : 1.5} />
                    <text x="285" y="44" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">2. 切片遍历 (Patch)</text>
                    <text x="285" y="64" fill="#FFF" fontSize="11" textAnchor="middle">28×28 图像网格</text>
                    <text x="285" y="82" fill="#A78BFA" fontSize="10" fontFamily="monospace" textAnchor="middle">4 个 14×14×3 切片</text>
                    <text x="285" y="100" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">Patch P_{activeScanPatch+1} 点阵</text>
                  </g>

                  <line x1="360" y1="70" x2="378" y2="70" stroke="#A78BFA" strokeWidth="2" markerEnd="url(#arrow-purple)" />

                  {/* 3. VISION BRANCH B: 512 Conv2d Filters (MoonViT) */}
                  <g opacity={stepIdx === 2 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="385" y="20" width="170" height="100" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth={stepIdx === 2 ? 3 : 1.5} />
                    <text x="470" y="44" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">3. 512 卷积核 (Conv2d)</text>
                    <text x="470" y="64" fill="#FFF" fontSize="11" textAnchor="middle">512 个 14×14×3 卷积核</text>
                    <text x="470" y="82" fill="#10B981" fontSize="10" fontFamily="monospace" textAnchor="middle">覆盖点乘卷积</text>
                    <text x="470" y="100" fill="#FFF" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">f_vit ∈ ℝ^(4 × 512d)</text>
                  </g>

                  <line x1="555" y1="70" x2="573" y2="70" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />

                  {/* 4. VISION BRANCH C: 2x2 Pixel Shuffle Synthesis (2048d -> 1 Visual Token) */}
                  <g opacity={stepIdx === 3 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="580" y="20" width="160" height="100" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth={stepIdx === 3 ? 3 : 1.5} />
                    <text x="660" y="44" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">4. 2×2 Pixel Shuffle</text>
                    <text x="660" y="64" fill="#FFF" fontSize="11" textAnchor="middle">4×512d 空间打包打平</text>
                    <text x="660" y="82" fill="#F59E0B" fontSize="10" fontFamily="monospace" textAnchor="middle">打包为 1个图像Token!</text>
                    <text x="660" y="100" fill="#FFF" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">v_2048 ∈ ℝ^2,048</text>
                  </g>

                  <line x1="740" y1="70" x2="760" y2="70" stroke="#F59E0B" strokeWidth="2" />
                  <line x1="760" y1="70" x2="760" y2="135" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-green)" />

                  {/* 5. VISION BRANCH D: W_proj Matrix Projection (7168d) */}
                  <g opacity={stepIdx === 4 ? 1 : 0.5} style={{ transition: 'all 0.3s' }}>
                    <rect x="650" y="140" width="220" height="75" rx="8" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth={stepIdx === 4 ? 3 : 1.5} />
                    <text x="760" y="165" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">5. 线性投影 W_proj 对齐</text>
                    <text x="760" y="185" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">W_proj [7168×2048] 矩阵乘法</text>
                    <text x="760" y="202" fill="#10B981" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">x_vis = W_proj · v_2048 ∈ ℝ^7,168</text>
                  </g>

                  {/* === SECTION 2: INTERLEAVED SEQUENCE & BACKBONE (MIDDLE) === */}

                  {/* Flow lines down to sequence stream */}
                  <line x1="105" y1="120" x2="105" y2="255" stroke="#38BDF8" strokeWidth="2.5" />
                  <line x1="105" y1="255" x2="140" y2="255" stroke="#38BDF8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />

                  <line x1="760" y1="215" x2="760" y2="255" stroke="#10B981" strokeWidth="2.5" />
                  <line x1="760" y1="255" x2="720" y2="255" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-green)" />

                  {/* 6. Interleaved Physical Sequence Bar & Autoregressive Loopback Stream */}
                  <g opacity={stepIdx === 5 || stepIdx === 0 || stepIdx === 4 ? 1 : 0.75} style={{ transition: 'all 0.3s' }}>
                    <rect x="140" y="235" width="580" height="90" rx="8" fill="rgba(15, 23, 42, 0.95)" stroke="#10B981" strokeWidth={stepIdx === 5 ? 3 : 2} />
                    <text x="430" y="258" fill="#FFF" fontSize="13" fontWeight="bold" textAnchor="middle">
                      6. 前向交错序列 Stream X ➔ 送入 93 层 Backbone 处理 (KDA + AttnRes + LatentMoE)
                    </text>

                    {/* Sequential Order Visual Blocks (Prefill Tokens + 1-by-1 Autoregressive Appended Token) */}
                    <g transform="translate(155, 270)">
                      <rect x="0" y="0" width="110" height="26" rx="4" fill="#38BDF8" />
                      <text x="55" y="17" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">x_prefix (Text)</text>

                      <rect x="118" y="0" width="150" height="26" rx="4" fill="#10B981" />
                      <text x="193" y="17" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">1个x_vis (28×28 Image)</text>

                      <rect x="276" y="0" width="110" height="26" rx="4" fill="#38BDF8" />
                      <text x="331" y="17" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">x_suffix (Text)</text>

                      {/* Autoregressive Appended Single Token y_t appearing step by step */}
                      {genStep >= 1 && (
                        <g transform="translate(394, 0)">
                          <rect x="0" y="0" width="50" height="26" rx="4" fill="#F59E0B" />
                          <text x="25" y="17" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">Token_y1</text>
                        </g>
                      )}
                      {genStep >= 2 && (
                        <g transform="translate(448, 0)">
                          <rect x="0" y="0" width="50" height="26" rx="4" fill="#10B981" />
                          <text x="25" y="17" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">Token_y2</text>
                        </g>
                      )}
                      {genStep >= 3 && (
                        <g transform="translate(502, 0)">
                          <rect x="0" y="0" width="50" height="26" rx="4" fill="#EC4899" />
                          <text x="25" y="17" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">Token_y3</text>
                        </g>
                      )}
                    </g>
                  </g>

                  {/* === SECTION 3: BACKWARD / DECODING RECONSTRUCTION GRAPH & LOOPBACK === */}
                  <line x1="430" y1="325" x2="430" y2="355" stroke="#EC4899" strokeWidth="2.5" markerEnd="url(#arrow-pink)" />

                  {/* 7. DECODING PIPELINE BOX */}
                  <g opacity={stepIdx === 6 || genStep > 0 ? 1 : 0.6} style={{ transition: 'all 0.3s' }}>
                    <rect x="60" y="360" width="740" height="100" rx="8" fill="rgba(236, 72, 153, 0.1)" stroke="#EC4899" strokeWidth={stepIdx === 6 ? 3 : 1.5} />
                    <text x="430" y="384" fill="#EC4899" fontSize="14" fontWeight="bold" textAnchor="middle">
                      7. 单步 160K 词表采样解码与自回归追加 (160K Vocabulary Sampling & Write-Back)
                    </text>

                    {/* Left Decoder Branch: 160K Vocabulary Text Decoding */}
                    <g transform="translate(80, 396)">
                      <rect x="0" y="0" width="310" height="52" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                      <text x="155" y="20" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">🔤 W_unembed [160,000×7,168] 词表打分</text>
                      <text x="155" y="38" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">
                        {genStep === 0 ? 'h_t ➔ 160K Logits ➔ Softmax ➔ 采样 1 个 Next Token' : `采样输出 1 个 Token (t=N+${genStep}): ${vocabSampleTokens[genStep - 1]?.token}`}
                      </text>
                    </g>

                    {/* Right Decoder Branch: Image Reconstruction */}
                    <g transform="translate(420, 396)">
                      <rect x="0" y="0" width="360" height="52" rx="6" fill="#0F172A" stroke="#EC4899" strokeWidth="1" />
                      <text x="180" y="20" fill="#EC4899" fontSize="11" fontWeight="bold" textAnchor="middle">🖼️ 图像还原: Un-shuffle ➔ ConvTranspose2d</text>
                      <text x="180" y="38" fill="#FFF" fontSize="10" fontFamily="monospace" textAnchor="middle">1个v_2048 ➔ 4×512d ➔ 4×588px ➔ 28×28 像素重构</text>
                    </g>
                  </g>

                  {/* === AUTOREGRESSIVE GOLDEN LOOPBACK ARROW (Loopback Arc) === */}
                  <path
                    d="M 235 448 C 30 448, 30 280, 130 280"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                    markerEnd="url(#arrow-gold)"
                  />
                  <rect x="25" y="350" width="135" height="26" rx="4" fill="#F59E0B" />
                  <text x="92" y="367" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">
                    ↺ 单 Token 回流追加 (Write Back)
                  </text>
                </svg>

                <div style={{ background: '#0F172A', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', color: '#94A3B8', marginTop: '6px' }}>
                  💡 <b>严格符合 Kimi K3 架构规范的 Token 数量与采样逻辑:</b>
                  <br />
                  1. <b>图像分支 Token 压缩率</b>：2×2 Pixel Shuffle 将 4 个 14×14 ViT 512d 特征块打包为 <b>仅 1 个 2,048d 图像 Token</b>（升维后为 1 个 7,168d Token），使图像视觉 Token 数量锐减 75%！
                  <br />
                  2. <b>自回归解码单 Token 采样</b>：每次时间步 $t$，模型过 W_unembed 对 <b>160,000 (160K) 维词表</b>打分，<b>单次仅采样产生 1 个 Next Token</b>；该 Token 沿黄色回路写回 (Write Back) 上下文末尾，驱动下一步推演！
                </div>
              </div>

            </div>

            {/* PANEL 2: SYNCHRONIZED MATH / CS ANALOGY */}
            <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <h3 style={{ fontSize: '1.1rem', color: '#A78BFA', margin: 0, fontWeight: 'bold' }}>
                {viewMode === 'analogy' ? '💡 区域二：软件工程概念锚点 (Analogy Mode)' : '📐 区域二：动态学术公式与代码'}
              </h3>

              {viewMode === 'analogy' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #38BDF8' }}>
                    <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>🔤 文本 Embedding：SQL 主键索引查表 (ID Lookup)</span>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      类似于数据库中通过字符串 ID 在预存词表中检索 7,168 维浮点数组，操作为硬查找与内存只读抽取。
                    </p>
                  </div>

                  <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #A78BFA' }}>
                    <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '0.95rem' }}>🖼️ 图像 Projection：编解码重采样 (Resampling Codec)</span>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      类似于视频/图像编解码器的空间下采样与格式转换，将 2D 像素打碎、用 512 卷积核抽取特征、2×2 Shuffle 打平后再用 W_proj 空间升维对齐。
                    </p>
                  </div>

                  <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #F59E0B' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.95rem' }}>↺ 自回归 Loopback：递归 Iterator 与 Queue 追加</span>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      类似于生成器模式 (Generator Iterator)。每次产生的返回值 y_t 被 `queue.append(y_t)` 追加到动态数组末尾，驱动下一轮循环。
                    </p>
                  </div>

                  {/* Strict Boundary Note */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #EF4444' }}>
                    <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.9rem' }}>⚠️ 物理边界与严格区别（保障技术精准性）：</span>
                    <p style={{ color: '#CBD5E1', fontSize: '0.85rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      文本是<b>静态离散字典查表</b>；图像是<b>连续神经网络矩阵乘法高维投影 (x_vis = W_proj · v_2048)</b>。自回归生成是<b>逐步概率采样并迭代追加 KV Cache</b>。
                    </p>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '6px' }}>// 前向与自回归生成全逻辑公式：</div>
                    <div style={{ color: '#38BDF8', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                      e_text = W_emb[token_id]  ∈ ℝ^(7,168)
                    </div>
                    <div style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '0.92rem', marginTop: '4px' }}>
                      e_img = W_proj · PixelShuffle(Conv2d_512(x_patch))  ∈ ℝ^(7,168)
                    </div>
                    <div style={{ color: '#F59E0B', fontFamily: 'monospace', fontSize: '0.92rem', marginTop: '4px' }}>
                      y_(t+1) = Softmax(W_unembed · h_t), Append y_(t+1) to Context
                    </div>
                  </div>

                  <div style={{ background: '#0B0F19', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ color: '#64748B', marginBottom: '4px' }}># PyTorch 前向与自回归 Loopback 实现:</div>
                    <div style={{ color: stepIdx === 0 ? '#38BDF8' : '#64748B' }}>x_txt = self.w_emb(text_ids)  # [B, T_txt, 7168]</div>
                    <div style={{ color: stepIdx === 2 ? '#10B981' : '#64748B' }}>f_vit = self.conv2d_512(patches)  # [B, N, 512]</div>
                    <div style={{ color: stepIdx === 3 ? '#F59E0B' : '#64748B' }}>v_2048 = pixel_shuffle(f_vit, r=2)  # [B, N/4, 2048]</div>
                    <div style={{ color: stepIdx === 4 ? '#10B981' : '#64748B' }}>x_img = self.w_proj(v_2048)  # [B, N/4, 7168]</div>
                    <div style={{ color: genStep > 0 ? '#F59E0B' : '#64748B' }}># Autoregressive Loopback:</div>
                    <div style={{ color: genStep > 0 ? '#F59E0B' : '#64748B' }}>y_next = torch.argmax(self.w_unembed(h_t))</div>
                    <div style={{ color: genStep > 0 ? '#F59E0B' : '#64748B' }}>seq_stream.append(self.w_emb(y_next))</div>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* PANEL 3: ABLATION SANDBOX FOR PIXEL SHUFFLE */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#10B981', margin: 0, fontWeight: 'bold' }}>
                📊 区域三：为什么需要 2×2 Pixel Shuffle 空间下采样？(Ablation Sandbox)
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0F172A', padding: '4px 12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: '#FFF' }}>模拟图像分辨率:</span>
                <input
                  type="range"
                  min="28"
                  max="224"
                  step="28"
                  value={imgRes}
                  onChange={(e) => setImgRes(Number(e.target.value))}
                  style={{ width: '120px' }}
                />
                <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>{imgRes}×{imgRes} px</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              
              {/* Without Pixel Shuffle */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.95rem' }}>传统 ViT (无 Pixel Shuffle)</span>
                  <span style={{ color: '#EF4444', fontFamily: 'monospace', fontWeight: 'bold' }}>{(imgRes / 14) ** 2} Vision Tokens</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                  每个 14×14 像素 Patch 独立作为一个 Token，包含太多空间冗余。导致 93 层 Backbone 的 Attention 计算开销暴增 16 倍！
                </p>
              </div>

              {/* With 2x2 Pixel Shuffle */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>Kimi K3 (2×2 Pixel Shuffle)</span>
                  <span style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>{((imgRes / 14) ** 2) / 4} Vision Tokens (压缩 75%!)</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                  将 2×2 邻近的 4 个 Patch 融合成 1 个 2,048 维 Token，使 Token 数量减少 75%，完美兼顾后续 Backbone 运行效率与像素细节！
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: 588d -> 512d PATCH ENCODER DETAILED SIMULATOR */}
      {activeTab === 'patchEncoder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#A78BFA', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🔬 14×14×3 (588d 像素) 如何转换为 512d 深度向量？
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              每个 $14 \times 14$ 像素的切片包含 $14 \times 14 \times 3 = 588$ 个 RGB 原始数值。在工程上，通常使用 <b>512 个不同的 $14 \times 14 \times 3$ 卷积核</b>（即 `Conv2d(3, 512, kernel_size=14, stride=14)`）覆盖整个切片进行一次性点乘运算。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Left: 14x14 Patch RGB Visualizer */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>1. 原始 14×14 像素切片 (588d)</span>
              
              <div style={{ width: '220px', height: '220px', background: '#000', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '1px', padding: '4px', border: '1px solid #334155' }}>
                {Array.from({ length: 196 }).map((_, idx) => {
                  const row = Math.floor(idx / 14);
                  const col = idx % 14;
                  const r = Math.floor(200 - row * 8);
                  const g = Math.floor(100 + col * 10);
                  const b = 220;
                  return (
                    <div
                      key={idx}
                      style={{ background: `rgb(${r},${g},${b})` }}
                      title={`Pixel (${row},${col}): RGB(${r},${g},${b})`}
                    />
                  );
                })}
              </div>

              <div style={{ fontSize: '0.95rem', color: '#94A3B8', textAlign: 'center' }}>
                像素点数: 196 × 3 通道 = <b>588 原始浮点数值</b>
              </div>
            </div>

            {/* Right: 512 Filter Selector & Output Inspection */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>2. 512 个不同权重的 14×14×3 卷积核提取器</span>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', color: '#94A3B8' }}>选择卷积核编号 (Filter #):</span>
                <input
                  type="range"
                  min="0"
                  max="511"
                  value={selectedFilterIdx}
                  onChange={(e) => setSelectedFilterIdx(parseInt(e.target.value))}
                  style={{ width: '200px' }}
                />
                <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'monospace' }}>
                  Filter #{selectedFilterIdx + 1} / 512
                </span>
              </div>

              {/* Active Filter Details */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: '#FFF', fontWeight: 'bold' }}>卷积核功能特性:</span>
                  <span style={{ color: '#38BDF8' }}>
                    {selectedFilterIdx % 4 === 0 && '🔍 垂直边缘检测器 (Vertical Edge Filter)'}
                    {selectedFilterIdx % 4 === 1 && '🎨 蓝绿色彩对比度检测器 (Color Contrast Filter)'}
                    {selectedFilterIdx % 4 === 2 && '纹理粗糙度特征器 (Texture Gradient Filter)'}
                    {selectedFilterIdx % 4 === 3 && '☀️ 高频明暗梯度提取器 (Brightness Gradient)'}
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#94A3B8' }}>
                  每个卷积核带有 <b>14×14×3 = 588 个专属训练权重</b>。覆盖切片一次性乘加，输出 <b>1 个特征标量值</b>。
                </div>
                <div style={{ fontSize: '1.1rem', color: '#A78BFA', fontWeight: 'bold', marginTop: '4px', fontFamily: 'monospace' }}>
                  计算输出值 Output [{selectedFilterIdx}] = {(Math.sin(selectedFilterIdx * 0.4) * 0.85 + 0.12).toFixed(4)}
                </div>
              </div>

              {/* Resulting 512d Vector Bar */}
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '1rem', color: '#FFF', fontWeight: 'bold' }}>3. 拼合产生的 512 维 Patch 向量 (v_t ∈ ℝ^512)</span>
                <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const isActive = Math.abs(idx * 16 - selectedFilterIdx) < 16;
                    const val = Math.sin(idx * 0.5);
                    const opacity = Math.abs(val);
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          background: isActive ? '#A78BFA' : `rgba(167, 139, 250, ${opacity * 0.6 + 0.1})`,
                          borderRight: '1px solid rgba(0,0,0,0.3)',
                          cursor: 'pointer'
                        }}
                        title={`Dimension [${idx * 16} ~ ${idx * 16 + 15}]`}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px', fontFamily: 'monospace' }}>
                  <span>Index 0</span>
                  <span>Index 255</span>
                  <span>Index 511</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 2x2 PIXEL SHUFFLE SIMULATOR */}
      {activeTab === 'pixelShuffle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#10B981', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🧩 2×2 Pixel Shuffle 空间重组（4 个 512d 合并为 1 个 2,048d）
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              直接把 512 维向量送入 LLM 序列太长（开销大）。通过 Pixel Shuffle，将<b>空间上相邻的 2×2（4个）$14 \times 14$ 小切片</b>按顺序首尾相接拼接在一起，代表一个 <b>$28 \times 28$ 像素的画面区域</b>。 Token 数量减少为 $1/4$，维度增加为 4 倍（$512 \times 4 = 2,048$ 维）。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
            {/* Left: 2x2 Grid of 14x14 Patches (28x28 Region) */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>28×28 像素画面区域 (包含 4 个 Patch)</span>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#0B0F19', padding: '10px', borderRadius: '6px', border: '1px solid #10B981' }}>
                {samplePatches.map((patch, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPatchGroup(idx)}
                    style={{
                      background: patch.color + '22',
                      border: `2px solid ${patch.color}`,
                      borderRadius: '6px',
                      padding: '16px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      boxShadow: selectedPatchGroup === idx ? `0 0 12px ${patch.color}` : 'none'
                    }}
                  >
                    <span style={{ color: patch.color, fontWeight: 'bold', fontSize: '0.95rem' }}>Patch {idx + 1}</span>
                    <span style={{ color: '#FFF', fontSize: '0.85rem', marginTop: '4px' }}>14×14 px</span>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '2px' }}>ℝ^512</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.4' }}>
                💡 点击上图任意 Patch，可在右侧观察其在 2,048 维向量中所占有的 512 维数据区间。
              </div>
            </div>

            {/* Right: Merged 2,048d Vector Visualizer */}
            <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>合并后的单个 2,048 维 Token 向量结构</span>

              {/* 4 Segment Blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {samplePatches.map((patch, idx) => {
                  const isSelected = selectedPatchGroup === idx;
                  const startDim = idx * 512;
                  const endDim = (idx + 1) * 512 - 1;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPatchGroup(idx)}
                      style={{
                        background: isSelected ? patch.color + '33' : '#0F172A',
                        border: `1.5px solid ${patch.color}`,
                        borderRadius: '6px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <span style={{ color: patch.color, fontWeight: 'bold', fontSize: '1rem' }}>
                          [{startDim} ~ {endDim}] ({patch.name})
                        </span>
                        <div style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '2px' }}>
                          包含 Patch {idx + 1} 的完整 512 维特征数值，零信息损耗
                        </div>
                      </div>
                      <span style={{ background: patch.color, color: '#000', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        512 维
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Box */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', padding: '12px 16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '1rem' }}>
                  2×2 拼接结果 Token 向量:
                </span>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  512 + 512 + 512 + 512 = 2,048 维
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNIFIED 7,168d LATENT SPACE */}
      {activeTab === 'latentSpace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              📐 7,168 维统一高维潜空间（Latent Geometry & Semantic Alignment）
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              文本与图像在乘以投影矩阵 W_proj 之后，均成为了 7,168 维 `float32` 数组。虽然人类无法直观解释每个数值的具体含义，但大模型通过 93 层 <b>Self-Attention 得分矩阵 (Q · Kᵀ / √d_h)</b> 计算几何相关度，精准实现跨模态理解！
            </p>
          </div>

          {/* Latent Space Interactive Inspection Canvas */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>
              高维向量余弦相似度与 Attention 点积对齐计算模拟
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
              {/* Pair 1: Text "cat" vs Image Patch (Cat Ear) */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #10B981', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>文本: "cat" (x_text)</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>图像: 猫耳 Patch (x_vis)</span>
                </div>
                <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '92.4%', background: '#10B981', height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>7,168维 向量点积相似度:</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>0.924 (极高对齐)</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                  💡 语言概念 "cat" 的 Query 向量与图像猫耳的 Key 向量在 7,168 维空间中几何夹角极小，模型直接关注此图像区域！
                </p>
              </div>

              {/* Pair 2: Text "cat" vs Image Patch (Sky Background) */}
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid #64748B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '1rem' }}>文本: "cat" (x_text)</span>
                  <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: '1rem' }}>图像: 蓝天背景 Patch</span>
                </div>
                <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '12.8%', background: '#64748B', height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#94A3B8' }}>7,168维 向量点积相似度:</span>
                  <span style={{ color: '#64748B', fontWeight: 'bold', fontFamily: 'monospace' }}>0.128 (无关区域)</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                  💡 背景区域向量点积权重大幅衰减，模型忽略非关键背景像素。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INVERSE DECODER RECONSTRUCTION */}
      {activeTab === 'decoder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#EC4899', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              🔄 逆向重构还原验证（2,048d Token 还原回 28×28 原始像素画面）
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>
              验证单 Token 的信息完整性：在自编码器/生成模型中，1 个 2,048 维 Token 可以通过 <b>Un-shuffle 拆分为 4 个 512 维向量</b>，再通过 <b>转置卷积 `ConvTranspose2d` 还原为 4 个 588 维像素块</b>，最终精准重构出 28×28 像素的原图画面！
            </p>
          </div>

          {/* Interactive Reconstruction Inspection Panel */}
          <div style={{ background: '#070913', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05rem', color: '#FFF', fontWeight: 'bold' }}>
                重构图像透明度对比 slider:
              </span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.95rem' }}>原始像素</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reconOpacity}
                  onChange={(e) => setReconOpacity(parseInt(e.target.value))}
                  style={{ width: '180px' }}
                />
                <span style={{ color: '#EC4899', fontWeight: 'bold', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                  重构还原比: {reconOpacity}%
                </span>
              </div>
            </div>

            {/* Side by side comparison */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center', flexWrap: 'wrap', padding: '20px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '160px', height: '160px', background: '#000', borderRadius: '8px', border: '2px solid #38BDF8', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 50%, #A78BFA 100%)' }} />
                </div>
                <span style={{ color: '#38BDF8', fontWeight: 'bold', fontSize: '0.95rem' }}>1. 原始 28×28 像素画面</span>
                <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>2,352 原始 RGB 像素数值</span>
              </div>

              <div style={{ fontSize: '1.8rem', color: '#EC4899' }}>➔</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#0F172A', border: '2px solid #EC4899', padding: '12px 18px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#EC4899', fontWeight: 'bold', fontSize: '1rem' }}>1 个 2,048 维 Token</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '4px' }}>Un-shuffle 拆分为 4 × 512d</div>
                </div>
                <span style={{ color: '#EC4899', fontWeight: 'bold', fontSize: '0.95rem' }}>2. 压缩特征潜表达</span>
              </div>

              <div style={{ fontSize: '1.8rem', color: '#EC4899' }}>➔</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '160px', height: '160px', background: '#000', borderRadius: '8px', border: '2px solid #10B981', overflow: 'hidden', opacity: reconOpacity / 100 }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 50%, #A78BFA 100%)' }} />
                </div>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>3. 还原解码画面 (MSE Loss &lt; 0.001)</span>
                <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>`ConvTranspose2d` 恢复 588px × 4</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
