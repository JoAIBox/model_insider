import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine } from './BeginnerAcademy';

/* ============ Lesson 5: 3:1 混合骨干 (Qwen 3.8 核心) ============ */

/* ---------- Scene 1: 骨干网是一条流水线 ---------- */
const Scene1: React.FC = () => {
  const [activeLayer, setActiveLayer] = React.useState(0);

  return (
    <svg viewBox="0 0 760 300" width="100%" height="300">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">骨干网：64 层高效流水线</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">
        输入 Token 向量流像工厂流水线一样，依次经过 64 个工位（层）加工。点击下方层块：
      </text>

      {/* 64层网格 */}
      <g transform="translate(20,74)">
        {Array.from({ length: 64 }, (_, i) => {
          const isAttn = (i + 1) % 4 === 0;
          const col = i % 16;
          const row = Math.floor(i / 16);
          const x = col * 45;
          const y = row * 45;
          const isSelected = activeLayer === i;

          return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveLayer(i)}>
              <rect x={x} y={y} width={40} height={38} rx={6}
                fill={isSelected ? (isAttn ? '#c4b5fd' : '#67e8f9') : (isAttn ? 'rgba(196,181,253,0.15)' : 'rgba(103,232,249,0.08)')}
                stroke={isAttn ? '#c4b5fd' : '#67e8f9'}
                strokeWidth={isSelected ? 2.5 : 1}
              />
              <text x={x + 20} y={y + 18} fill={isSelected ? '#070a12' : (isAttn ? '#c4b5fd' : '#67e8f9')} fontSize="10" fontWeight="bold" textAnchor="middle">
                L{i + 1}
              </text>
              <text x={x + 20} y={y + 30} fill={isSelected ? '#070a12' : '#64748B'} fontSize="8" textAnchor="middle">
                {isAttn ? 'Attn' : 'GDN'}
              </text>
            </g>
          );
        })}
      </g>

      {/* 选中层信息卡 */}
      <g transform="translate(20,250)">
        <rect x="0" y="0" width="720" height="38" rx="8"
          fill={(activeLayer + 1) % 4 === 0 ? 'rgba(196,181,253,0.12)' : 'rgba(103,232,249,0.08)'}
          stroke={(activeLayer + 1) % 4 === 0 ? '#c4b5fd' : '#67e8f9'} strokeWidth="1.2" />
        <text x="15" y="24" fill={(activeLayer + 1) % 4 === 0 ? '#c4b5fd' : '#67e8f9'} fontSize="13" fontWeight="bold">
          第 {activeLayer + 1} 层：{(activeLayer + 1) % 4 === 0 ? 'Gated Attention（全局注意力层）' : 'GDN（线性门控 DeltaNet 层）'}
        </text>
        <text x="420" y="24" fill="#94A3B8" fontSize="11">
          周期 {Math.floor(activeLayer / 4) + 1} / 16 · {(activeLayer + 1) % 4 === 0 ? '做精确全局检索' : '做高效局部记忆更新'}
        </text>
      </g>
    </svg>
  );
};

/* ---------- Scene 2: 周期：4层为一组 ---------- */
const Scene2: React.FC = () => {
  const [selectedSub, setSelectedSub] = React.useState(0);

  const subLayers = [
    { title: 'Layer 1: GDN 局部更新 1', role: '吸收最邻近词信息，更新局部记忆状态 S_t', color: '#67e8f9' },
    { title: 'Layer 2: GDN 局部更新 2', role: '深化局部上下文理解，过滤微小噪声', color: '#67e8f9' },
    { title: 'Layer 3: GDN 局部更新 3', role: '把过去三层的短程语义压缩至极紧凑状态', color: '#67e8f9' },
    { title: 'Layer 4: Gated Attn 全局锚点', role: '全盘扫描所有历史 KV Cache，补全长距离逻辑钩子', color: '#c4b5fd' },
  ];

  return (
    <svg viewBox="0 0 760 280" width="100%" height="280">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">周期结构：4 层为一个重复单元 (Cycle)</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">Qwen 3.8 的 64 层由 16 个相同的 Cycle 堆叠而成。点击下面 4 个工位了解职责：</text>

      {/* 一个 Cycle 内部 4 层展开 */}
      <g transform="translate(20,76)">
        {subLayers.map((layer, i) => (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedSub(i)}>
            <rect x={i * 180} y={0} width={165} height={100} rx={10}
              fill={selectedSub === i ? `${layer.color}25` : `${layer.color}08`}
              stroke={layer.color} strokeWidth={selectedSub === i ? 2.5 : 1} />
            <text x={i * 180 + 15} y={30} fill={layer.color} fontSize="14" fontWeight="bold">
              {i < 3 ? `GDN #${i + 1}` : 'Gated Attn'}
            </text>
            <text x={i * 180 + 15} y={54} fill="#E2E8F0" fontSize="11">
              {i < 3 ? '线性门控层' : '全局注意力'}
            </text>
            <text x={i * 180 + 15} y={80} fill="#94A3B8" fontSize="10" fontFamily="monospace">
              {i < 3 ? '内存 O(1)' : '显存 KV Cache'}
            </text>
            {selectedSub === i && (
              <circle cx={i * 180 + 145} cy={25} r="5" fill={layer.color} className="bgn-pulse" />
            )}
          </g>
        ))}
      </g>

      {/* 详细说明卡 */}
      <g transform="translate(20,200)">
        <rect x="0" y="0" width="720" height="56" rx="8"
          fill={`${subLayers[selectedSub].color}12`} stroke={subLayers[selectedSub].color} strokeWidth="1.2" />
        <text x="15" y="24" fill={subLayers[selectedSub].color} fontSize="14" fontWeight="bold">
          {subLayers[selectedSub].title}
        </text>
        <text x="15" y="44" fill="#94A3B8" fontSize="12">
          {subLayers[selectedSub].role}
        </text>
      </g>
    </svg>
  );
};

/* ---------- Scene 3: 每层内部结构 (Norm -> SeqMix -> Norm -> FFN -> Add) ---------- */
const Scene3: React.FC = () => {
  const [stepIdx, setStepIdx] = React.useState(0);
  const steps = [
    { title: '1. RMSNorm 归一化', desc: '把输入的 5,120 维向量缩放到合适数值范围，防止数值爆炸。', color: '#67e8f9' },
    { title: '2. 序列混合 (GDN 或 Attn)', desc: '在不同 Token（时间维度）之间传递信息，更新每个 Token 的上下文含义。', color: '#c4b5fd' },
    { title: '3. 残差相加 1 (Residual Add)', desc: '把处理后的输出加上原输入：h = h_in + SubLayer(Norm(h_in))。', color: '#fbbf24' },
    { title: '4. RMSNorm 归一化', desc: '再次对向量做归一化，准备进入通道特征计算。', color: '#67e8f9' },
    { title: '5. 前馈网络 FFN / MoE', desc: '在每个 Token 自身的 5,120 维特征（通道维度）内部做非线性变换思考。', color: '#10b981' },
    { title: '6. 残差相加 2', desc: '再次加上输入，保持梯度畅通，完成当前层的全部计算。', color: '#fbbf24' },
  ];

  return (
    <svg viewBox="0 0 760 300" width="100%" height="300">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">单层内部流程：标准 Transformer 模块</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">无论 GDN 层还是 Attention 层，内部都遵循先序列混合、后特征思考的规则：</text>

      {/* 6 步块 */}
      <g transform="translate(20,74)">
        {steps.map((s, i) => (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => setStepIdx(i)}>
            <rect x={i * 120} y={0} width={112} height={80} rx={8}
              fill={stepIdx === i ? `${s.color}25` : 'rgba(255,255,255,0.03)'}
              stroke={s.color} strokeWidth={stepIdx === i ? 2 : 1} />
            <text x={i * 120 + 56} y={32} fill={s.color} fontSize="11" fontWeight="bold" textAnchor="middle">
              {s.title.split(' ')[1]}
            </text>
            <text x={i * 120 + 56} y={54} fill="#94A3B8" fontSize="9" textAnchor="middle">
              {i % 2 === 0 ? '特征规范' : i === 1 ? '跨 Token 交流' : i === 4 ? '单 Token 思考' : '残差保护'}
            </text>
          </g>
        ))}
      </g>

      {/* 详情卡 */}
      <g transform="translate(20,180)">
        <rect x="0" y="0" width="720" height="60" rx="8"
          fill={`${steps[stepIdx].color}12`} stroke={steps[stepIdx].color} strokeWidth="1.2" />
        <text x="15" y="24" fill={steps[stepIdx].color} fontSize="14" fontWeight="bold">
          {steps[stepIdx].title}
        </text>
        <text x="15" y="46" fill="#94A3B8" fontSize="12">
          {steps[stepIdx].desc}
        </text>
      </g>
    </svg>
  );
};

/* ---------- Scene 4: 残差连接 —— 梯度高速公路 ---------- */
const Scene4: React.FC = () => {
  const [hasResidual, setHasResidual] = React.useState(true);

  return (
    <svg viewBox="0 0 760 270" width="100%" height="270">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">残差连接：64 层不迷路的高速公路</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">点击下方开关，体验残差连接（Residual Connection）的作用：</text>

      {/* 开关 */}
      <g style={{ cursor: 'pointer' }} onClick={() => setHasResidual(!hasResidual)}>
        <rect x="20" y="70" width="180" height="34" rx={8}
          fill={hasResidual ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}
          stroke={hasResidual ? '#10b981' : '#EF4444'} strokeWidth="1.5" />
        <text x="110" y="92" fill={hasResidual ? '#10b981' : '#EF4444'} fontSize="12" fontWeight="bold" textAnchor="middle">
          {hasResidual ? '残差连接：开启 ✓' : '残差连接：关闭 ✗'}
        </text>
      </g>

      {/* 数据流示意图 */}
      <g transform="translate(20,120)">
        <text x="0" y="20" fill="#67e8f9" fontSize="12" fontWeight="bold">输入 h</text>
        <FlowLine x1={50} y1={15} x2={120} y2={15} color="#67e8f9" />

        {/* 主处理分支 */}
        <rect x="125" y="-5" width={140} height="40" rx={8} fill="#0A0F1D" stroke="#c4b5fd" strokeWidth="1.2" />
        <text x="195" y="20" fill="#c4b5fd" fontSize="11" textAnchor="middle">复杂网络 Block(h)</text>

        <FlowLine x1={270} y1={15} x2={340} y2={15} color="#c4b5fd" />

        {/* 残差旁路跳跃 */}
        {hasResidual && (
          <path d="M 50 15 C 50 65, 340 65, 340 15" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" className="bgn-flow-line" />
        )}

        {/* 加法节点 */}
        <circle cx={350} cy={15} r="12" fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="350" y="19" fill="#fbbf24" fontSize="14" fontWeight="bold" textAnchor="middle">+</text>

        <FlowLine x1={365} y1={15} x2={430} y2={15} color="#fbbf24" />
        <text x="440" y="20" fill="#E2E8F0" fontSize="12" fontWeight="bold">输出 h + Block(h)</text>
      </g>

      {/* 说明 */}
      <g transform="translate(20,200)">
        <text x="0" y="20" fill={hasResidual ? '#10b981' : '#EF4444'} fontSize="13" fontWeight="bold">
          {hasResidual ? '信息像开高速公路：原始信号毫无损失地直达深层，训练极其稳定。' : '没有残差连接：信号经过 64 层后严重衰减/爆炸，深层模型根本无法训练！'}
        </text>
        <text x="0" y="42" fill="#94A3B8" fontSize="11">
          残差结构让深层神经网络能够训练到上百层（Qwen 3.8 为 64 层）。
        </text>
      </g>
    </svg>
  );
};

export const LessonHybrid: BeginnerLesson = {
  id: 'hybrid',
  label: '3:1 混合骨干',
  emoji: '🏗️',
  title: '第 5 课 · 3:1 混合骨干网络',
  subtitle: '64 层流水线如何高效协同工作。',
  scenes: [
    {
      title: '骨干网是一条流水线',
      analogy: '工厂流水线有 64 个连续工位，加工一串长长的特征向量。',
      explain: <>Qwen 3.8 的骨干网包含 <b>64 层</b>。其中前 3 层为 GDN 局部更新，第 4 层为 Gated Attention 全局检索。</>,
      visual: <Scene1 />,
      keypoint: '64 层由 48 层 GDN 与 16 层 Gated Attention 组成。',
    },
    {
      title: '周期结构：4 层为一个单元',
      analogy: '4 人小组轮班：3 人快速记录局部，1 人定期整理总结全局。',
      explain: <>整个网络由 <b>16 个周期 (Cycle)</b> 循环组成，每个周期包含 3 个 GDN 层 + 1 个 Gated Attention 层。</>,
      visual: <Scene2 />,
      keypoint: '3:1 比例在推理速度与全局召回率之间达到了完美的平衡。',
    },
    {
      title: '单层内部流程',
      analogy: '先开会交流（序列混合），再独立思考（通道特征变换）。',
      explain: <>每层都包含 RMSNorm 归一化、序列混合（GDN 或 Attention）、残差加和、前馈网络（FFN/MoE）。</>,
      visual: <Scene3 />,
      keypoint: '规范化与残差连接保证了深层特征变换的稳定。',
    },
    {
      title: '残差连接：梯度高速公路',
      analogy: '传话游戏：每次不仅传递加工后的信息，还附带原始原话。',
      explain: <>残差连接 <b>h_out = h_in + Layer(h_in)</b> 保证原始信号能直通 64 层，避免信息丢失或梯度消失。</>,
      visual: <Scene4 />,
      keypoint: '残差连接是训练深层大模型的核心保障。',
    },
  ],
};
