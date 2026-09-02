import React, { useEffect, useRef, useState } from 'react';
import './beginner.css';

export interface BeginnerScene {
  /** scene title */
  title: string;
  /** everyday analogy (purple card) */
  analogy?: string;
  /** plain-language explanation (body) */
  explain?: React.ReactNode;
  /** key takeaway (green card) */
  keypoint?: string;
  /** extra tip (yellow dashed card) */
  tip?: string;
  /** how long auto-play stays on a scene (ms) */
  duration?: number;
  /** core animation / graphic (SVG etc.) */
  visual: React.ReactNode;
}

export interface BeginnerLesson {
  id: string;
  label: string;
  emoji: string;
  title: string;
  subtitle: string;
  scenes: BeginnerScene[];
  /** renders the whole lesson as a single interactive embed (no step player) */
  embedded?: boolean;
}

/* ---------- shared visual primitives ---------- */

/** a row of vector cells (highlight marks a range) */
export const VecBar: React.FC<{
  cells: number;
  width?: number;
  highlight?: { from: number; to: number };
  label?: string;
  labelPos?: 'left' | 'right' | 'center';
  height?: number;
  cellGap?: number;
}> = ({ cells, width = 620, highlight, label, labelPos = 'center', height = 26, cellGap = 3 }) => {
  const cellW = (width - cellGap * (cells - 1)) / cells;
  return (
    <svg width={width} height={height + (label ? 26 : 8)} viewBox={`0 0 ${width} ${height + (label ? 26 : 8)}`}>
      {Array.from({ length: cells }, (_, i) => {
        const lit = highlight && i >= highlight.from && i <= highlight.to;
        return (
          <rect
            key={i}
            x={i * (cellW + cellGap)}
            y={2}
            width={cellW}
            height={height}
            rx={2.5}
            fill={lit ? '#00F2FE' : 'rgba(255,255,255,0.08)'}
            className={lit ? 'bgn-pulse' : undefined}
          >
            {lit && <title>component {i + 1}</title>}
          </rect>
        );
      })}
      {label && (
        <text
          x={labelPos === 'left' ? 4 : labelPos === 'right' ? width - 4 : width / 2}
          y={height + 20}
          fill="#94A3B8"
          fontSize="13"
          textAnchor={labelPos === 'left' ? 'start' : labelPos === 'right' ? 'end' : 'middle'}
        >
          {label}
        </text>
      )}
    </svg>
  );
};

/** a single token chip */
export const TokenChip: React.FC<{
  text: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  dim?: boolean;
}> = ({ text, x, y, w = 64, h = 40, color = '#00F2FE', dim }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={6}
      fill={dim ? 'rgba(255,255,255,0.04)' : `${color}1f`}
      stroke={dim ? 'rgba(255,255,255,0.12)' : color}
      strokeWidth="1.4"
    />
    <text x={x + w / 2} y={y + h / 2 + 5} fill={dim ? '#64748B' : color} fontSize="13" fontWeight="bold" textAnchor="middle">
      {text}
    </text>
  </g>
);

/** animated dashed flow arrow */
export const FlowLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; width?: number }> = ({
  x1, y1, x2, y2, color = '#00F2FE', width = 2,
}) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} className="bgn-flow-line" markerEnd="url(#bgn-arrow)" />
);

/** arrow markers — include <BgnArrows/> once inside any svg that uses FlowLine */
export const BgnArrows: React.FC = () => (
  <defs>
    <marker id="bgn-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#00F2FE" />
    </marker>
    <marker id="bgn-arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748B" />
    </marker>
  </defs>
);

/** figure caption */
export const Caption: React.FC<{ text: string; color?: string }> = ({ text, color = '#94A3B8' }) => (
  <text x="50%" y={0} textAnchor="middle">
    <tspan dy="-10" fill={color} fontSize="13">{text}</tspan>
  </text>
);

/* ---------- the player frame ---------- */

export const BeginnerAcademy: React.FC<{ lessons: BeginnerLesson[] }> = ({ lessons }) => {
  const [activeId, setActiveId] = useState(lessons[0].id);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const lesson = lessons.find((l) => l.id === activeId) ?? lessons[0];
  const scene = lesson.scenes[sceneIdx];
  const isLast = sceneIdx === lesson.scenes.length - 1;

  const goTo = (idx: number) => {
    setSceneIdx(Math.max(0, Math.min(lesson.scenes.length - 1, idx)));
  };

  const selectLesson = (id: string) => {
    setActiveId(id);
    setSceneIdx(0);
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return;
    const dur = scene?.duration ?? 6500;
    timerRef.current = window.setTimeout(() => {
      if (sceneIdx >= lesson.scenes.length - 1) {
        setPlaying(false);
        return;
      }
      setSceneIdx(sceneIdx + 1);
    }, dur);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, sceneIdx, lesson.id, lesson.scenes.length, scene?.duration]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (isLast) goTo(0);
      setPlaying(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target?.tagName ?? '')) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(sceneIdx + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(sceneIdx - 1);
      } else if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sceneIdx, lesson.scenes.length, playing, isLast]);

  return (
    <div className="bgn-root">
      <div className="bgn-header">
        <h2>🎓 Qwen 3.8 架构原理动画指南</h2>
        <p>
          用<b>生活类比</b>和<b>逐步动画</b>讲解 Qwen 3.8 的每个核心机制——无需任何机器学习背景。
          每节课支持<b>自动播放</b>，也可以手动逐步浏览。键盘 ← / → 切换步骤，空格键播放/暂停。
        </p>
      </div>

      <div className="bgn-tabs">
        {lessons.map((l) => (
          <button
            key={l.id}
            className={`bgn-tab ${l.id === activeId ? 'active' : ''}`}
            onClick={() => selectLesson(l.id)}
          >
            {l.emoji} {l.label}
          </button>
        ))}
      </div>

      {lesson.embedded ? (
        <div className="bgn-visual" style={{ padding: 4 }}>{lesson.scenes[0].visual}</div>
      ) : (
        <>
          <div className="bgn-scene" key={`${activeId}-${sceneIdx}`}>
        <div className="bgn-scene-top">
          <span className="bgn-scene-step">步骤 {sceneIdx + 1} / {lesson.scenes.length}</span>
          <span className="bgn-scene-title">{scene.title}</span>
        </div>

        {scene.analogy && (
          <div className="bgn-analogy">
            <span className="bgn-badge analogy">类比</span>
            <span>{scene.analogy}</span>
          </div>
        )}

        {scene.explain && (
          <div className="bgn-explain">
            <span className="bgn-badge explain">解释</span> {scene.explain}
          </div>
        )}

        <div className="bgn-visual">{scene.visual}</div>

        {scene.keypoint && (
          <div className="bgn-explain" style={{ borderLeft: '4px solid var(--success)', background: 'rgba(0,230,118,0.06)', padding: '8px 12px', borderRadius: '8px' }}>
            <span className="bgn-badge key">关键要点</span> {scene.keypoint}
          </div>
        )}

        {scene.tip && <div className="bgn-tip">💡 {scene.tip}</div>}
      </div>

      <div className="bgn-controls">
        <button className="bgn-btn" onClick={() => goTo(0)} disabled={sceneIdx === 0} title="回到第一步">⏮</button>
        <button className="bgn-btn" onClick={() => goTo(sceneIdx - 1)} disabled={sceneIdx === 0} title="上一步">←</button>
        <button className="bgn-btn play" onClick={togglePlay}>
          {playing ? '⏸ 暂停' : isLast ? '↻ 重播' : '▶ 播放'}
        </button>
        <button className="bgn-btn" onClick={() => goTo(sceneIdx + 1)} disabled={isLast} title="下一步">→</button>
        <button className="bgn-btn" onClick={() => goTo(lesson.scenes.length - 1)} disabled={isLast} title="跳到最后">⏭</button>
      </div>

      <div className="bgn-dots">
        {lesson.scenes.map((s, i) => (
          <button
            key={i}
            className={`bgn-dot ${i === sceneIdx ? 'active' : ''}`}
            onClick={() => goTo(i)}
            title={s.title}
            aria-label={`步骤 ${i + 1}: ${s.title}`}
          />
        ))}
      </div>

      <div className="bgn-progress">
        <div className="bgn-progress-fill" style={{ width: `${((sceneIdx + 1) / lesson.scenes.length) * 100}%` }} />
      </div>

      <div className="bgn-footer-note">
        {lesson.title} · 步骤 {sceneIdx + 1} · 播放时自动推进；点击圆点可跳转 · 键盘: ← / → 切换步骤, 空格 播放/暂停
      </div>
        </>
      )}
    </div>
  );
};
