import React, { useState, useEffect, useRef } from 'react';

// Pipeline Steps for Multimodal Token Alignment
const pipelineSteps = [
  { id: 0, title: "1. 文本 BPE 查表", desc: "ID 检索 W_emb 词表矩阵", output: "x_text ∈ ℝ^7,168", type: "text" },
  { id: 1, title: "2. 图像 14×14 切片", desc: "14×14×3 (588d 像素块)", output: "Patch x_p ∈ ℝ^588", type: "vision" },
  { id: 2, title: "3. MoonViT-V2 编码", desc: "Conv2d/ViT 提取特征", output: "f_vit ∈ ℝ^512", type: "vision" },
  { id: 3, title: "4. 2×2 Pixel Shuffle", desc: "4 个 Patch 空间降维拼接", output: "v_2048 ∈ ℝ^2,048", type: "vision" },
  { id: 4, title: "5. W_proj 矩阵线性投影", desc: "投影对齐到 7,168 维", output: "x_vis ∈ ℝ^7,168", type: "vision" },
];

export const MultimodalTokenSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patchEncoder' | 'pixelShuffle' | 'latentSpace' | 'decoder'>('overview');
  
  // Interactive Prompt State
  const [prefixText, setPrefixText] = useState<string>('Show me this');
  const [suffixText, setSuffixText] = useState<string>('what cat?');

  // Step Debugger States for Overview Tab
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1800);
  const [viewMode, setViewMode] = useState<'math' | 'analogy'>('analogy');
  const [imgRes, setImgRes] = useState<number>(56); // 56x56 resolution for ablation

  // Interactive Patch selection for Step 2 & 3
  const [selectedPatchGroup, setSelectedPatchGroup] = useState<number>(0);
  
  // Filter inspector selection for Step 2
  const [selectedFilterIdx, setSelectedFilterIdx] = useState<number>(12); // Filter #13: Vertical Edge Detector

  // Reconstructed vs Original opacity slider for Step 5
  const [reconOpacity, setReconOpacity] = useState<number>(85);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Playback loop for Step Debugger
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((prev) => (prev + 1) % pipelineSteps.length);
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
    { name: 'Top-Left (Ear Texture)', color: '#FF5555', filterVal: 0.82 },
    { name: 'Top-Right (Sky Background)', color: '#38BDF8', filterVal: 0.15 },
    { name: 'Bottom-Left (Fur Detail)', color: '#10B981', filterVal: 0.94 },
    { name: 'Bottom-Right (Shadow Pattern)', color: '#FFB000', filterVal: 0.61 },
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
              Layer 0 多模态 Token 转换与对齐深度交互控制台
            </h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid #38BDF8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Multimodal Tokenizer Simulator (§2.1)
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            解密离散文本（BPE 查表）与连续图像（MoonViT + Pixel Shuffle + W_proj 矩阵运算）如何统一转换为 7,168 维 Token 向量
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
            1. 三屏联动交互控制台
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
            2. 588d → 512d 图像编码
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

      {/* TAB 1: THREE-PANEL SYNCHRONIZED INTERACTIVE CONSOLE */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Controls: Prompt & Mode Switch */}
          <div style={{ background: '#070913', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8' }}>前缀文本:</label>
                <input
                  type="text"
                  value={prefixText}
                  onChange={(e) => setPrefixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.95rem', width: '160px' }}
                />
              </div>

              <div style={{ background: 'rgba(167, 139, 250, 0.2)', border: '1px solid #A78BFA', padding: '4px 12px', borderRadius: '4px', color: '#A78BFA', fontWeight: 'bold', fontSize: '0.9rem' }}>
                🖼️ [28×28 Image Region]
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8' }}>后缀文本:</label>
                <input
                  type="text"
                  value={suffixText}
                  onChange={(e) => setSuffixText(e.target.value)}
                  style={{ background: '#0F172A', border: '1px solid #38BDF8', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.95rem', width: '160px' }}
                />
              </div>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px', background: '#0B0F19', padding: '4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setViewMode('analogy')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'analogy' ? '#38BDF8' : 'transparent',
                  color: viewMode === 'analogy' ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                💡 软件工程类比模式
              </button>
              <button
                onClick={() => setViewMode('math')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'math' ? '#A78BFA' : 'transparent',
                  color: viewMode === 'math' ? '#000' : '#94A3B8',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                📐 学术公式与代码模式
              </button>
            </div>
          </div>

          {/* 3-Panel Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            
            {/* PANEL 1: PIPELINE ANIMATION & STEP DEBUGGER */}
            <div style={{ background: '#070913', padding: '20px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#38BDF8', margin: 0, fontWeight: 'bold' }}>
                  🎬 区域一：多模态转换与对齐数据流 (Pipeline Flow)
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
                      background: idx === stepIdx ? (s.type === 'text' ? '#38BDF8' : '#A78BFA') : '#0F172A',
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
                  {isPlaying ? '⏸️ 暂停' : '▶️ 自动播放'}
                </button>
                <button
                  onClick={() => { setIsPlaying(false); setStepIdx((prev) => (prev + 1) % pipelineSteps.length); }}
                  style={{ background: '#1E293B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
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
                </div>
              </div>

              {/* SVG Animation Display */}
              <div style={{ background: '#02040a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <svg viewBox="0 0 540 220" width="100%" height="220">
                  
                  {/* Step 0: Text Lookup */}
                  <g opacity={stepIdx === 0 ? 1 : 0.3}>
                    <rect x="20" y="30" width="140" height="70" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth={stepIdx === 0 ? 2.5 : 1} />
                    <text x="90" y="60" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">1. 文本 BPE 查表</text>
                    <text x="90" y="80" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">W_emb[ID] → 7,168d</text>
                  </g>

                  {/* Step 1: Vision Patch */}
                  <g opacity={stepIdx === 1 ? 1 : 0.3}>
                    <rect x="180" y="30" width="150" height="70" rx="6" fill="#0F172A" stroke="#A78BFA" strokeWidth={stepIdx === 1 ? 2.5 : 1} />
                    <text x="255" y="60" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">2. 14×14×3 切片</text>
                    <text x="255" y="80" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">588 维 RGB 像素</text>
                  </g>

                  {/* Step 2: ViT Feature */}
                  <g opacity={stepIdx === 2 ? 1 : 0.3}>
                    <rect x="360" y="30" width="160" height="70" rx="6" fill="#0F172A" stroke="#10B981" strokeWidth={stepIdx === 2 ? 2.5 : 1} />
                    <text x="440" y="60" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">3. MoonViT-V2</text>
                    <text x="440" y="80" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">512 维 Vision Vector</text>
                  </g>

                  {/* Step 3: Pixel Shuffle */}
                  <g opacity={stepIdx === 3 ? 1 : 0.3}>
                    <rect x="100" y="130" width="160" height="70" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth={stepIdx === 3 ? 2.5 : 1} />
                    <text x="180" y="160" fill="#F59E0B" fontSize="13" fontWeight="bold" textAnchor="middle">4. 2×2 Pixel Shuffle</text>
                    <text x="180" y="180" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">4×512d → 2,048d (1 Token)</text>
                  </g>

                  {/* Step 4: Projection Matrix W_proj */}
                  <g opacity={stepIdx === 4 ? 1 : 0.3}>
                    <rect x="300" y="130" width="220" height="70" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth={stepIdx === 4 ? 2.5 : 1} />
                    <text x="410" y="160" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle">5. W_proj 矩阵对齐</text>
                    <text x="410" y="180" fill="#FFF" fontSize="11" fontFamily="monospace" textAnchor="middle">W_proj [7168×2048] → 7,168d</text>
                  </g>

                  <line x1="260" y1="165" x2="300" y2="165" stroke="#10B981" strokeWidth="2" strokeDasharray="4,4" />
                </svg>

                <div style={{ background: '#0F172A', padding: '10px', borderRadius: '6px', fontSize: '0.88rem', color: '#94A3B8', marginTop: '6px' }}>
                  💡 <b>当前步说明:</b> {currentStep.desc} ➔ 生成 <b>{currentStep.output}</b>。
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
                      类似于视频/图像编解码器的空间下采样与格式转换，将 2D 像素打碎、抽取深层卷积语义、降采样后再做空间特征打平。
                    </p>
                  </div>

                  {/* Strict Boundary Note */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #EF4444' }}>
                    <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.9rem' }}>⚠️ 物理边界与严格区别（保障技术精准性）：</span>
                    <p style={{ color: '#CBD5E1', fontSize: '0.85rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      文本是<b>静态离散字典查表</b>；图像是<b>连续神经网络矩阵乘法高维投影 (x_vis = W_proj · v_2048)</b>。两者的底层几何空间在 Layer 0 经线性变换后，统一收敛在 7,168 维高维切片上。
                    </p>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ background: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '6px' }}>// 文本与图像 Layer 0 矩阵对齐公式：</div>
                    <div style={{ color: '#38BDF8', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      e_text = W_emb[token_id]  ∈ ℝ^(7,168)
                    </div>
                    <div style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '0.95rem', marginTop: '6px' }}>
                      e_img = W_proj · PixelShuffle(f_ViT(x_patch))  ∈ ℝ^(7,168)
                    </div>
                  </div>

                  <div style={{ background: '#0B0F19', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ color: '#64748B', marginBottom: '4px' }}># PyTorch 最小对齐实现:</div>
                    <div style={{ color: stepIdx === 0 ? '#38BDF8' : '#64748B' }}>x_txt = self.w_emb(text_ids)  # [B, T_txt, 7168]</div>
                    <div style={{ color: stepIdx === 2 ? '#A78BFA' : '#64748B' }}>f_vit = self.vit_encoder(patches)  # [B, N, 512]</div>
                    <div style={{ color: stepIdx === 3 ? '#F59E0B' : '#64748B' }}>v_2048 = pixel_shuffle(f_vit, r=2)  # [B, N/4, 2048]</div>
                    <div style={{ color: stepIdx === 4 ? '#10B981' : '#64748B' }}>x_img = self.w_proj(v_2048)  # [B, N/4, 7168]</div>
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
