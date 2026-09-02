import React from 'react';
import type { BeginnerLesson } from './BeginnerAcademy';
import { BgnArrows, FlowLine, TokenChip, VecBar } from './BeginnerAcademy';

/* ============ Lesson 1: Token → 数字 (Qwen 3.8 适配) ============ */

/* ---------- Scene 1: 为什么一切都要变数字 ---------- */
const Scene1: React.FC = () => {
  const [phase, setPhase] = React.useState(0);
  const phases = [
    { label: '文字', show: 'text', desc: '计算机无法直接理解文字、图像或声音' },
    { label: '编号', show: 'id', desc: '分词器把文字切碎，每块分配一个编号（Token ID）' },
    { label: '向量', show: 'vec', desc: '嵌入表把编号查表变成一串「含义数字」（向量）' },
  ];

  return (
    <svg viewBox="0 0 760 260" width="100%" height="260">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">为什么一切都要变成数字？</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">计算机只能做加减乘除——必须先把文字「翻译」成数字才能处理。点击下方切换阶段：</text>

      {/* phase buttons */}
      {phases.map((p, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onClick={() => setPhase(i)}>
          <rect x={20 + i * 120} y={70} width={110} height={32} rx={6}
            fill={phase === i ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.04)'}
            stroke={phase === i ? '#00F2FE' : 'rgba(255,255,255,0.12)'} strokeWidth={phase === i ? 1.8 : 1} />
          <text x={75 + i * 120} y={90} fill={phase === i ? '#00F2FE' : '#94A3B8'} fontSize="13" fontWeight={phase === i ? 'bold' : 'normal'} textAnchor="middle">
            {i + 1}. {p.label}
          </text>
        </g>
      ))}

      {/* 动画区域 */}
      <g>
        {/* 文字阶段 */}
        <g opacity={phase >= 0 ? 1 : 0.2}>
          <text x="80" y="140" fill="#38BDF8" fontSize="22" fontWeight="bold" textAnchor="middle">猫</text>
          <text x="80" y="160" fill="#64748B" fontSize="11" textAnchor="middle">原始文字</text>
        </g>

        {phase >= 1 && <FlowLine x1={110} y1={140} x2={200} y2={140} />}

        {/* 编号阶段 */}
        <g opacity={phase >= 1 ? 1 : 0.15}>
          <rect x={210} y={122} width={90} height={36} rx={8}
            fill={phase >= 1 ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)'}
            stroke={phase >= 1 ? '#00F2FE' : 'rgba(255,255,255,0.08)'} />
          <text x="255" y="146" fill="#00F2FE" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ID: 38124</text>
        </g>

        {phase >= 2 && <FlowLine x1={310} y1={140} x2={400} y2={140} color="#A78BFA" />}

        {/* 向量阶段 */}
        <g opacity={phase >= 2 ? 1 : 0.15}>
          <text x="560" y="130" fill="#A78BFA" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            [0.31, -1.22, 0.87, 0.05, ...]
          </text>
          <text x="560" y="152" fill="#64748B" fontSize="11" textAnchor="middle">5,120 维「含义向量」</text>
          <g transform="translate(410,162)">
            <VecBar cells={24} width={300} height={16} highlight={phase >= 2 ? { from: 2, to: 5 } : undefined} />
          </g>
        </g>

        {phase >= 0 && (
          <g className="bgn-float">
            <circle cx={phase === 0 ? 100 : phase === 1 ? 310 : 560} cy="140" r="5" fill="#38BDF8" className="bgn-particle" />
          </g>
        )}
      </g>

      <text x="20" y="210" fill="#94A3B8" fontSize="13">
        <tspan fill="#fbbf24" fontWeight="bold">{phases[phase].desc}</tspan>
      </text>
      <text x="20" y="236" fill="#94A3B8" fontSize="12.5">
        Qwen 3.8 的向量有 <tspan fill="#00F2FE" fontWeight="bold">5,120 个数字</tspan>（5,120 维），每个数字代表一个「含义维度」。
      </text>
    </svg>
  );
};

/* ---------- Scene 2: 分词器 ---------- */
const Scene2: React.FC = () => {
  const [activeToken, setActiveToken] = React.useState(-1);
  const sentence = '我喜欢Qwen模型';
  const tokenized = [
    { text: '我', id: 5765, color: '#38BDF8' },
    { text: '喜欢', id: 89012, color: '#22D3EE' },
    { text: 'Qw', id: 51236, color: '#A78BFA' },
    { text: 'en', id: 268, color: '#C084FC' },
    { text: '模型', id: 12409, color: '#fbbf24' },
  ];

  return (
    <svg viewBox="0 0 760 280" width="100%" height="280">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">第 1 步：分词器把句子切碎</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">先把句子拆分成小块，每块叫一个 Token。点击下方每个 Token 查看详情：</text>

      {/* 原始句子 */}
      <rect x="20" y="74" width="720" height="40" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
      <text x="380" y="100" fill="#E2E8F0" fontSize="16" textAnchor="middle">{sentence}</text>
      <FlowLine x1={380} y1={116} x2={380} y2={140} color="#38BDF8" />

      {/* Token 芯片 - 可点击 */}
      {tokenized.map((tk, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveToken(activeToken === i ? -1 : i)}>
          <TokenChip text={tk.text} x={80 + i * 120} y={148} w={100} h={36} color={activeToken === i ? '#fff' : tk.color} />
          <text x={130 + i * 120} y={200} fill={activeToken === i ? tk.color : '#64748B'} fontSize="10" textAnchor="middle" fontFamily="monospace">
            ID: {tk.id}
          </text>
          {activeToken === i && (
            <g>
              <rect x={80 + i * 120} y={148} width={100} height={36} rx={6}
                fill="none" stroke={tk.color} strokeWidth="2.5" className="bgn-ripple" />
            </g>
          )}
        </g>
      ))}

      <text x="660" y="174" fill="#64748B" fontSize="12">→ {tokenized.length} 个 Token</text>

      {/* 选中 Token 的详情 */}
      {activeToken >= 0 && (
        <g>
          <rect x="20" y="218" width="720" height="48" rx="8"
            fill={`${tokenized[activeToken].color}15`}
            stroke={tokenized[activeToken].color} strokeWidth="1.2" />
          <text x="35" y="240" fill={tokenized[activeToken].color} fontSize="13" fontWeight="bold">
            「{tokenized[activeToken].text}」
          </text>
          <text x="35" y="256" fill="#94A3B8" fontSize="11">
            Token ID = {tokenized[activeToken].id} · 在 Qwen 3.8 的 151,936 个词条中第 {tokenized[activeToken].id} 行
          </text>
        </g>
      )}
      {activeToken < 0 && (
        <text x="20" y="248" fill="#64748B" fontSize="12">
          ↑ 点击上方任意 Token 查看它的编号。注意 "Qwen" 被拆成了 "Qw" 和 "en" 两个子词。
        </text>
      )}
    </svg>
  );
};

/* ---------- Scene 3: 嵌入表查表 ---------- */
const Scene3: React.FC = () => {
  const [hoveredRow, setHoveredRow] = React.useState(2); // 默认高亮"猫"
  const rows = [
    { t: '的', id: 223, lit: false, vec: [-0.41, 1.02, 0.36, 0.15] },
    { t: '喜欢', id: 89012, lit: false, vec: [0.82, -0.37, 1.55, -0.91] },
    { t: '猫', id: 38124, lit: true, vec: [1.87, 0.33, -0.72, 0.54] },
    { t: 'Qw', id: 51236, lit: false, vec: [-0.12, 0.67, -1.33, 0.28] },
    { t: '…', id: 0, lit: false, vec: [0, 0, 0, 0] },
  ];

  return (
    <svg viewBox="0 0 760 300" width="100%" height="300">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">第 2 步：查「含义词典」（嵌入表）</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">每个 Token 用编号查表，取出一整行数字。鼠标悬停查看不同行：</text>

      <TokenChip text={rows[hoveredRow]?.t || '猫'} x={30} y={80} color="#38BDF8" />
      <FlowLine x1={108} y1={100} x2={175} y2={100} color="#38BDF8" />

      {/* 嵌入表 */}
      <g>
        <rect x={180} y={66} width={280} height={rows.length * 30 + 28} rx="8" fill="#0A0F1D" stroke="rgba(255,255,255,0.12)" />
        <text x={192} y={86} fill="#64748B" fontSize="10" fontFamily="monospace">嵌入表: 151,936 行 × 5,120 列</text>
        {rows.map((row, i) => (
          <g key={row.t}
            style={{ cursor: row.t !== '…' ? 'pointer' : 'default' }}
            onMouseEnter={() => row.t !== '…' && setHoveredRow(i)}
          >
            <rect x={188} y={96 + i * 30} width={48} height={24} rx="4"
              fill={i === hoveredRow ? '#00F2FE' : 'transparent'}
              stroke={i === hoveredRow ? '#00F2FE' : 'transparent'} />
            <text x={212} y={96 + i * 30 + 16} fontSize="12"
              fill={i === hoveredRow ? '#02121d' : '#94A3B8'}
              fontWeight={i === hoveredRow ? 800 : 400} textAnchor="middle">
              {row.t}
            </text>
            <rect x={244} y={96 + i * 30} width={200} height={24} rx="4"
              fill={i === hoveredRow ? 'rgba(0,242,254,0.25)' : 'rgba(255,255,255,0.04)'}
              className={i === hoveredRow ? 'bgn-sweep' : undefined} />
            {i === hoveredRow && (
              <circle cx={440} cy={96 + i * 30 + 12} r="5" fill="none" stroke="#00F2FE" strokeWidth="1.5" className="bgn-ripple" />
            )}
          </g>
        ))}
      </g>

      <FlowLine x1={468} y1={100} x2={498} y2={100} color="#A78BFA" />

      {/* 取出的向量 */}
      <g>
        <text x={600} y={80} fill="#A78BFA" fontSize="12" fontWeight="bold" textAnchor="middle">
          「{rows[hoveredRow]?.t}」的向量
        </text>
        <g transform="translate(500,92)">
          <VecBar cells={24} width={220} height={16} highlight={{ from: 3, to: 7 }} />
        </g>
        <text x={500} y={130} fill="#64748B" fontSize="11">前 4 个值（共 5,120 个）：</text>
        <text x={500} y={150} fill="#A78BFA" fontSize="12" fontFamily="monospace">
          [{rows[hoveredRow]?.vec.map(v => v.toFixed(2)).join(', ')}, …]
        </text>
      </g>

      <text x="20" y="250" fill="#94A3B8" fontSize="12.5">
        这些数字不是随机的——<tspan fill="#00F2FE" fontWeight="bold">训练</tspan>会让含义相近的词拥有相似的数字。
      </text>
      <text x="20" y="274" fill="#94A3B8" fontSize="12.5">
        「猫」和「狗」的向量很接近，但和「飞机」的向量相差很远。
      </text>
    </svg>
  );
};

/* ---------- Scene 4: 图像变 Token ---------- */
const Scene4: React.FC = () => {
  const [activePatch, setActivePatch] = React.useState(5);

  return (
    <svg viewBox="0 0 760 280" width="100%" height="280">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">图像也变成 Token</text>
      <text x="20" y="54" fill="#94A3B8" fontSize="13">把画切成拼图碎片，每块经视觉编码器变成向量。点击方块查看：</text>

      {/* 图像网格 */}
      <g transform="translate(50,75)">
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i}
            x={(i % 4) * 34} y={Math.floor(i / 4) * 34}
            width={30} height={30} rx="4"
            fill={i === activePatch ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.06)'}
            stroke={i === activePatch ? '#A78BFA' : 'rgba(255,255,255,0.12)'}
            strokeWidth={i === activePatch ? 2.5 : 1}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setActivePatch(i)}
          />
        ))}
        <text x="68" y="158" fill="#64748B" fontSize="11" textAnchor="middle">图像 14×14 patch 网格</text>
        <text x="68" y="174" fill="#A78BFA" fontSize="10" textAnchor="middle">选中: patch #{activePatch + 1}</text>
      </g>

      <FlowLine x1={210} y1={130} x2={290} y2={130} color="#A78BFA" />

      {/* 视觉编码器 */}
      <g>
        <rect x={300} y={95} width={200} height={64} rx="10" fill="#0A0F1D" stroke="rgba(167,139,250,0.4)" />
        <text x="400" y="120" fill="#A78BFA" fontSize="13" fontWeight="bold" textAnchor="middle">ViT 视觉编码器</text>
        <text x="400" y="142" fill="#94A3B8" fontSize="11" textAnchor="middle">patch → 5,120 维向量</text>
      </g>

      <FlowLine x1={510} y1={130} x2={560} y2={130} color="#00F2FE" />

      {/* 输出 */}
      <g>
        <TokenChip text={`[img${activePatch}]`} x={570} y={112} w={90} color="#A78BFA" />
        <text x="615" y="170" fill="#64748B" fontSize="10" textAnchor="middle">视觉 Token</text>
      </g>

      <text x="20" y="248" fill="#94A3B8" fontSize="12.5">
        每 4 个相邻 patch 特征通过 2×2 Pixel Shuffle 合并为 1 个视觉 Token，与文本 Token 排成一队。
      </text>
      <text x="20" y="270" fill="#94A3B8" fontSize="12.5">
        Qwen3.8-27B 采用 Dense 视觉语言架构，所有 Token 共用同一条计算路径。
      </text>
    </svg>
  );
};

/* ---------- Scene 5: 总结 ---------- */
const Scene5: React.FC = () => {
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const tokens = [
    { text: '我', type: 'text', color: '#38BDF8' },
    { text: '喜欢', type: 'text', color: '#38BDF8' },
    { text: '[img]', type: 'image', color: '#A78BFA' },
    { text: 'Qw', type: 'text', color: '#38BDF8' },
    { text: 'en', type: 'text', color: '#38BDF8' },
    { text: '模型', type: 'text', color: '#38BDF8' },
  ];

  return (
    <svg viewBox="0 0 760 240" width="100%" height="240">
      <BgnArrows />
      <text x="20" y="30" fill="#E2E8F0" fontSize="17" fontWeight="bold">总结：向量流穿越模型</text>

      <rect x="20" y="52" width="720" height="90" rx="10" fill="rgba(0,242,254,0.04)" stroke="rgba(0,242,254,0.2)" />

      {tokens.map((tk, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveIdx(activeIdx === i ? -1 : i)}>
          <TokenChip text={tk.text} x={50 + i * 110} y={66} w={90} color={activeIdx === i ? '#fff' : tk.color} />
          <rect x={50 + i * 110} y={112} width={90} height={14} rx="3"
            fill={`${tk.color}40`}
            className={activeIdx === i ? 'bgn-pulse' : undefined} />
          {activeIdx === i && (
            <text x={95 + i * 110} y={142} fill={tk.color} fontSize="10" textAnchor="middle" fontWeight="bold">
              {tk.type === 'text' ? '文本 Token' : '视觉 Token'} · 5,120 维
            </text>
          )}
        </g>
      ))}

      <text x="20" y="178" fill="#94A3B8" fontSize="13">
        一段文字 + 一张图 → 一长串 5,120 维向量流 <tspan fill="#00F2FE" fontWeight="bold">[x₁, x₂, …, x_T]</tspan>。
      </text>
      <text x="20" y="200" fill="#94A3B8" fontSize="13">
        接下来 64 层骨干网络的任务就是：<tspan fill="#fbbf24" fontWeight="bold">不断变换这些向量、在它们之间交换信息</tspan>，直到最终生成文字。
      </text>
      <text x="20" y="226" fill="#64748B" fontSize="11">
        ↑ 点击任意 Token 查看详情
      </text>
    </svg>
  );
};

export const LessonTokens: BeginnerLesson = {
  id: 'tokens',
  label: 'Token 与嵌入',
  emoji: '🔤',
  title: '第 1 课 · Token 与嵌入',
  subtitle: '计算机只能处理数字，所以文字和图像必须先「翻译」成向量。',
  scenes: [
    {
      title: '为什么一切都要变成数字？',
      analogy: '像发电报用摩尔斯码：每个词先翻译成点和划，机器才能发送。',
      explain: <>Qwen 3.8 的第一步是把文字翻译成机器能计算的<b>数字</b>。结果不是一个简单的编号——而是一串能承载<b>含义</b>的数字列表（向量）。</>,
      visual: <Scene1 />,
      keypoint: 'Token → 5,120 维向量：一串表达「含义」的数字列表。',
    },
    {
      title: '分词器：把句子切碎',
      analogy: '查字典前先把词拆开——"我喜欢猫" 变成 "我 / 喜欢 / 猫"。',
      explain: <>模型先把句子切成小块，每块叫一个 <b>Token</b>。Qwen 3.8 的词表有 <b>151,936</b> 个 Token。</>,
      visual: <Scene2 />,
      tip: '为什么要拆？直接输入整句话，机器没有 Token 边界；拆开后每个 Token 才能各自查「含义词典」。',
    },
    {
      title: '查「含义词典」（嵌入表）',
      analogy: '每个词条是一行——查到「猫」就抄下那一行全部数字。',
      explain: <>模型内部有一张 <b>151,936 行 × 5,120 列</b> 的巨大查表（嵌入矩阵 <b>W_emb</b>）。每个 Token 查自己那行 → 得到 5,120 维向量。训练会让含义相近的词在向量空间里靠近。</>,
      visual: <Scene3 />,
      keypoint: '嵌入查表 = 给每个 Token 一串「含义数字」——语言理解的起点。',
    },
    {
      title: '图像也变成 Token',
      analogy: '把画切成拼图碎片，给每块碎片编号——模型按顺序读碎片。',
      explain: <>图像被切成 14×14 的小块（patch），视觉编码器把 patch 特征变成向量。然后 2×2 Pixel Shuffle 把 4 个相邻 patch 合并成 1 个视觉 Token，和文本 Token 排在一起。</>,
      visual: <Scene4 />,
    },
    {
      title: '总结：向量流穿越模型',
      explain: <>一段文字 + 一张图 → 一长串 5,120 维向量 <b>[x₁, x₂, …, x_T]</b>。64 层骨干网络的任务就是不断变换这些向量，在它们之间交换信息。</>,
      visual: <Scene5 />,
    },
  ],
};
